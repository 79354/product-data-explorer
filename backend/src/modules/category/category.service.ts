import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../database/entities/category.entity';
import { ScraperService } from '../scraper/scraper.service';
import { PaginationDto } from '../../common/dto/pagination/pagination.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    private scraperService: ScraperService,
  ) {}

  async findAll(pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const [categories, total] = await this.categoryRepo.findAndCount({
      relations: ['navigation', 'parent'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'ASC' },
    });

    return {
      data: categories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { slug },
      relations: ['navigation', 'parent', 'children', 'products'],
    });

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    return category;
  }

  async scrapeCategory(slug: string, force: boolean): Promise<Category> {
    const category = await this.findBySlug(slug);
    return this.scraperService.scrapeCategory(category.url, category.navigationId, force);
  }
}
