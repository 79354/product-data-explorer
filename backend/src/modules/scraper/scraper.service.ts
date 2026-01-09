// src/modules/scraper/scraper.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlaywrightCrawler, ProxyConfiguration } from 'crawlee';
import { Navigation } from '../../database/entities/navigation.entity';
import { Category } from '../../database/entities/category.entity';
import { Product } from '../../database/entities/product.entity';
import { ProductDetail } from '../../database/entities/product-detail.entity';
import { Review } from '../../database/entities/review.entity';
import { ScrapeJob, ScrapeJobStatus, ScrapeTargetType } from '../../database/entities/scrape-job.entity';

interface NavigationData {
  title: string;
  slug: string;
  url: string;
}

interface CategoryData {
  title: string;
  slug: string;
  url: string;
  navigationId?: string;
  parentId?: string;
}

interface ProductData {
  sourceId: string;
  title: string;
  author?: string;
  price?: number;
  currency: string;
  imageUrl?: string;
  sourceUrl: string;
  categoryId?: string;
}

interface ProductDetailData {
  description?: string;
  specs?: Record<string, any>;
  ratingsAvg?: number;
  reviewsCount?: number;
  recommendations?: string[];
  reviews?: Array<{
    author?: string;
    rating?: number;
    text?: string;
    reviewDate?: Date;
  }>;
}

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  private readonly BASE_URL = 'https://www.worldofbooks.com';
  private readonly SCRAPE_DELAY_MS = 2000;
  private readonly SCRAPE_TTL_HOURS = 24;

  constructor(
    @InjectRepository(Navigation)
    private navigationRepo: Repository<Navigation>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(ProductDetail)
    private productDetailRepo: Repository<ProductDetail>,
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    @InjectRepository(ScrapeJob)
    private scrapeJobRepo: Repository<ScrapeJob>,
  ) {}

  private createCrawler() {
    return new PlaywrightCrawler({
      maxRequestsPerMinute: 30,
      maxConcurrency: 2,
      requestHandlerTimeoutSecs: 60,
      launchContext: {
        launchOptions: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      },
    });
  }

  private needsScrape(lastScrapedAt: Date | null): boolean {
    if (!lastScrapedAt) return true;
    const ttlMs = this.SCRAPE_TTL_HOURS * 60 * 60 * 1000;
    return Date.now() - lastScrapedAt.getTime() > ttlMs;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }

  async scrapeNavigation(forceRefresh = false): Promise<Navigation[]> {
    this.logger.log('Starting navigation scrape');

    const job = this.scrapeJobRepo.create({
      targetUrl: this.BASE_URL,
      targetType: ScrapeTargetType.NAVIGATION,
      status: ScrapeJobStatus.PENDING,
    });
    await this.scrapeJobRepo.save(job);

    try {
      // Check if we need to scrape
      const existing = await this.navigationRepo.find();
      if (existing.length > 0 && !forceRefresh) {
        const needsUpdate = existing.some(nav => this.needsScrape(nav.lastScrapedAt));
        if (!needsUpdate) {
          this.logger.log('Navigation data is fresh, skipping scrape');
          job.status = ScrapeJobStatus.COMPLETED;
          job.finishedAt = new Date();
          await this.scrapeJobRepo.save(job);
          return existing;
        }
      }

      job.status = ScrapeJobStatus.IN_PROGRESS;
      job.startedAt = new Date();
      await this.scrapeJobRepo.save(job);

      const navigationData: NavigationData[] = [];
      const crawler = this.createCrawler();

      await crawler.run([
        {
          url: this.BASE_URL,
          label: 'HOMEPAGE',
          userData: {},
        },
      ]);

      crawler.router.addDefaultHandler(async ({ page, request }) => {
        this.logger.log(`Scraping navigation from: ${request.url}`);

        await page.waitForLoadState('networkidle');
        await this.delay(this.SCRAPE_DELAY_MS);

        // Extract navigation items from the main menu
        const navItems = await page.$$eval('nav a, header a, .menu a', (links) =>
          links
            .filter((link) => {
              const text = link.textContent?.trim();
              const href = link.getAttribute('href');
              return text && href && text.length > 2;
            })
            .map((link) => ({
              title: link.textContent!.trim(),
              url: link.getAttribute('href')!,
            }))
            .filter((item, index, self) =>
              index === self.findIndex((t) => t.title === item.title)
            )
        );

        for (const item of navItems) {
          if (item.title && !item.title.match(/sign|login|cart|account/i)) {
            const fullUrl = item.url.startsWith('http') ? item.url : `${this.BASE_URL}${item.url}`;
            navigationData.push({
              title: item.title,
              slug: this.slugify(item.title),
              url: fullUrl,
            });
          }
        }
      });

      // Save navigation data
      const savedNavigation: Navigation[] = [];
      for (const navData of navigationData) {
        let nav = await this.navigationRepo.findOne({ where: { slug: navData.slug } });
        if (!nav) {
          nav = this.navigationRepo.create(navData);
        } else {
          Object.assign(nav, navData);
        }
        nav.lastScrapedAt = new Date();
        savedNavigation.push(await this.navigationRepo.save(nav));
      }

      job.status = ScrapeJobStatus.COMPLETED;
      job.finishedAt = new Date();
      await this.scrapeJobRepo.save(job);

      this.logger.log(`Navigation scrape completed: ${savedNavigation.length} items`);
      return savedNavigation;
    } catch (error) {
      this.logger.error('Navigation scrape failed', error);
      job.status = ScrapeJobStatus.FAILED;
      job.finishedAt = new Date();
      job.errorLog = error.message;
      await this.scrapeJobRepo.save(job);
      throw error;
    }
  }

  async scrapeCategory(categoryUrl: string, navigationId?: string, forceRefresh = false): Promise<Category> {
    this.logger.log(`Starting category scrape: ${categoryUrl}`);

    const job = this.scrapeJobRepo.create({
      targetUrl: categoryUrl,
      targetType: ScrapeTargetType.CATEGORY,
      status: ScrapeJobStatus.PENDING,
    });
    await this.scrapeJobRepo.save(job);

    try {
      job.status = ScrapeJobStatus.IN_PROGRESS;
      job.startedAt = new Date();
      await this.scrapeJobRepo.save(job);

      const categoryData: CategoryData = {
        title: '',
        slug: '',
        url: categoryUrl,
        navigationId,
      };

      const crawler = this.createCrawler();

      await crawler.run([{ url: categoryUrl, label: 'CATEGORY' }]);

      crawler.router.addDefaultHandler(async ({ page }) => {
        await page.waitForLoadState('networkidle');
        await this.delay(this.SCRAPE_DELAY_MS);

        // Extract category title
        const title = await page.$eval('h1, .category-title, .page-title', (el) => el.textContent?.trim()).catch(() => 'Unknown Category');
        categoryData.title = title;
        categoryData.slug = this.slugify(title);

        // Count products
        const productCount = await page.$$eval('.product-item, .product-card, [data-product-id]', (items) => items.length).catch(() => 0);
        categoryData['productCount'] = productCount;
      });

      let category = await this.categoryRepo.findOne({ where: { url: categoryUrl } });
      if (!category) {
        category = this.categoryRepo.create(categoryData);
      } else {
        Object.assign(category, categoryData);
      }
      category.lastScrapedAt = new Date();
      const savedCategory = await this.categoryRepo.save(category);

      job.status = ScrapeJobStatus.COMPLETED;
      job.finishedAt = new Date();
      await this.scrapeJobRepo.save(job);

      this.logger.log(`Category scrape completed: ${savedCategory.title}`);
      return savedCategory;
    } catch (error) {
      this.logger.error('Category scrape failed', error);
      job.status = ScrapeJobStatus.FAILED;
      job.finishedAt = new Date();
      job.errorLog = error.message;
      await this.scrapeJobRepo.save(job);
      throw error;
    }
  }

  async scrapeProducts(categoryUrl: string, categoryId: string, page = 1, limit = 20): Promise<Product[]> {
    this.logger.log(`Scraping products from: ${categoryUrl} (page ${page})`);

    const url = `${categoryUrl}?page=${page}`;
    const job = this.scrapeJobRepo.create({
      targetUrl: url,
      targetType: ScrapeTargetType.PRODUCT_LIST,
      status: ScrapeJobStatus.PENDING,
    });
    await this.scrapeJobRepo.save(job);

    try {
      job.status = ScrapeJobStatus.IN_PROGRESS;
      job.startedAt = new Date();
      await this.scrapeJobRepo.save(job);

      const productsData: ProductData[] = [];
      const crawler = this.createCrawler();

      await crawler.run([{ url, label: 'PRODUCTS' }]);

      crawler.router.addDefaultHandler(async ({ page: browserPage }) => {
        await browserPage.waitForLoadState('networkidle');
        await this.delay(this.SCRAPE_DELAY_MS);

        const products = await browserPage.$$eval('.product-item, .product-card, [data-product-id]', (items) =>
          items.slice(0, 20).map((item) => {
            const titleEl = item.querySelector('h2, h3, .product-title, .title');
            const priceEl = item.querySelector('.price, .product-price');
            const imageEl = item.querySelector('img');
            const linkEl = item.querySelector('a');
            const authorEl = item.querySelector('.author, .product-author');

            const priceText = priceEl?.textContent?.trim().replace(/[£$€,]/g, '');
            const price = priceText ? parseFloat(priceText) : null;

            return {
              title: titleEl?.textContent?.trim() || 'Unknown Product',
              author: authorEl?.textContent?.trim() || null,
              price: price,
              currency: 'GBP',
              imageUrl: imageEl?.getAttribute('src') || imageEl?.getAttribute('data-src') || null,
              sourceUrl: linkEl?.getAttribute('href') || '',
              sourceId: linkEl?.getAttribute('href')?.split('/').pop() || `product-${Date.now()}`,
            };
          })
        ).catch(() => []);

        productsData.push(...products);
      });

      const savedProducts: Product[] = [];
      for (const prodData of productsData.slice(0, limit)) {
        const fullUrl = prodData.sourceUrl.startsWith('http') ? prodData.sourceUrl : `${this.BASE_URL}${prodData.sourceUrl}`;
        let product = await this.productRepo.findOne({ where: { sourceUrl: fullUrl } });
        if (!product) {
          product = this.productRepo.create({ ...prodData, sourceUrl: fullUrl, categoryId });
        } else {
          Object.assign(product, { ...prodData, sourceUrl: fullUrl, categoryId });
        }
        product.lastScrapedAt = new Date();
        savedProducts.push(await this.productRepo.save(product));
      }

      job.status = ScrapeJobStatus.COMPLETED;
      job.finishedAt = new Date();
      await this.scrapeJobRepo.save(job);

      this.logger.log(`Products scrape completed: ${savedProducts.length} products`);
      return savedProducts;
    } catch (error) {
      this.logger.error('Products scrape failed', error);
      job.status = ScrapeJobStatus.FAILED;
      job.finishedAt = new Date();
      job.errorLog = error.message;
      await this.scrapeJobRepo.save(job);
      throw error;
    }
  }

  async scrapeProductDetail(productId: string, forceRefresh = false): Promise<ProductDetail> {
    const product = await this.productRepo.findOne({ where: { id: productId }, relations: ['detail'] });
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.detail && !forceRefresh && !this.needsScrape(product.lastScrapedAt)) {
      this.logger.log('Product detail is fresh, skipping scrape');
      return product.detail;
    }

    this.logger.log(`Scraping product detail: ${product.sourceUrl}`);

    const job = this.scrapeJobRepo.create({
      targetUrl: product.sourceUrl,
      targetType: ScrapeTargetType.PRODUCT_DETAIL,
      status: ScrapeJobStatus.PENDING,
    });
    await this.scrapeJobRepo.save(job);

    try {
      job.status = ScrapeJobStatus.IN_PROGRESS;
      job.startedAt = new Date();
      await this.scrapeJobRepo.save(job);

      const detailData: ProductDetailData = {};
      const crawler = this.createCrawler();

      await crawler.run([{ url: product.sourceUrl, label: 'PRODUCT_DETAIL' }]);

      crawler.router.addDefaultHandler(async ({ page }) => {
        await page.waitForLoadState('networkidle');
        await this.delay(this.SCRAPE_DELAY_MS);

        // Extract description
        detailData.description = await page.$eval('.description, .product-description, [itemprop="description"]', (el) => el.textContent?.trim()).catch(() => null);

        // Extract ratings
        const ratingText = await page.$eval('.rating, .stars, [itemprop="ratingValue"]', (el) => el.textContent?.trim()).catch(() => null);
        if (ratingText) {
          detailData.ratingsAvg = parseFloat(ratingText.replace(/[^\d.]/g, ''));
        }

        // Extract review count
        const reviewText = await page.$eval('.review-count, [itemprop="reviewCount"]', (el) => el.textContent?.trim()).catch(() => null);
        if (reviewText) {
          detailData.reviewsCount = parseInt(reviewText.replace(/\D/g, ''));
        }

        // Extract reviews
        detailData.reviews = await page.$$eval('.review, .review-item', (reviews) =>
          reviews.map((review) => ({
            author: review.querySelector('.author, .reviewer')?.textContent?.trim(),
            rating: parseInt(review.querySelector('.rating')?.textContent?.replace(/\D/g, '') || '0'),
            text: review.querySelector('.review-text, .comment')?.textContent?.trim(),
          }))
        ).catch(() => []);

        // Extract specs
        detailData.specs = await page.$$eval('.spec-item, .product-spec', (specs) => {
          const result = {};
          specs.forEach((spec) => {
            const label = spec.querySelector('.label, .spec-label')?.textContent?.trim();
            const value = spec.querySelector('.value, .spec-value')?.textContent?.trim();
            if (label && value) result[label] = value;
          });
          return result;
        }).catch(() => ({}));
      });

      // Save product detail
      let productDetail = await this.productDetailRepo.findOne({ where: { productId } });
      if (!productDetail) {
        productDetail = this.productDetailRepo.create({ ...detailData, productId });
      } else {
        Object.assign(productDetail, detailData);
      }
      const savedDetail = await this.productDetailRepo.save(productDetail);

      // Save reviews
      if (detailData.reviews && detailData.reviews.length > 0) {
        await this.reviewRepo.delete({ productId });
        const reviews = detailData.reviews.map((review) =>
          this.reviewRepo.create({ ...review, productId })
        );
        await this.reviewRepo.save(reviews);
      }

      // Update product lastScrapedAt
      product.lastScrapedAt = new Date();
      await this.productRepo.save(product);

      job.status = ScrapeJobStatus.COMPLETED;
      job.finishedAt = new Date();
      await this.scrapeJobRepo.save(job);

      this.logger.log(`Product detail scrape completed: ${product.title}`);
      return savedDetail;
    } catch (error) {
      this.logger.error('Product detail scrape failed', error);
      job.status = ScrapeJobStatus.FAILED;
      job.finishedAt = new Date();
      job.errorLog = error.message;
      await this.scrapeJobRepo.save(job);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
