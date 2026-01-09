import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../database/entities/product.entity';
import { ScraperService } from '../scraper/scraper.service';
import { PaginationDto } from '../../common/dto/pagination/pagination.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    private scraperService: ScraperService,
  ) {}

  async findAll(pagination: PaginationDto, categoryId?: string) {
    const { page = 1, limit = 20 } = pagination;
    const whereClause = categoryId ? { categoryId } : {};

    const [products, total] = await this.productRepo.findAndCount({
      where: whereClause,
      relations: ['category', 'detail'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'detail', 'reviews'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return product;
  }

  async scrapeProduct(id: string, force: boolean) {
    const product = await this.findById(id);
    const detail = await this.scraperService.scrapeProductDetail(id, force);
    return { ...product, detail };
  }
}
