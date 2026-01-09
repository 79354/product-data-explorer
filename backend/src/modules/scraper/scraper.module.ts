import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScraperService } from './scraper.service';
import { Navigation } from '../../database/entities/navigation.entity';
import { Category } from '../../database/entities/category.entity';
import { Product } from '../../database/entities/product.entity';
import { ProductDetail } from '../../database/entities/product-detail.entity';
import { Review } from '../../database/entities/review.entity';
import { ScrapeJob } from '../../database/entities/scrape-job.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Navigation, Category, Product, ProductDetail, Review, ScrapeJob]),
    BullModule.registerQueue({
      name: 'scraping',
    }),
  ],
  providers: [ScraperService],
  exports: [ScraperService],
})
export class ScraperModule {}
