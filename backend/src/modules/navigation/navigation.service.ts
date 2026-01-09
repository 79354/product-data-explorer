import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Navigation } from '../../database/entities/navigation.entity';
import { ScraperService } from '../scraper/scraper.service';

@Injectable()
export class NavigationService {
  constructor(
    @InjectRepository(Navigation)
    private navigationRepo: Repository<Navigation>,
    private scraperService: ScraperService,
  ) {}

  async findAll(): Promise<Navigation[]> {
    const navigation = await this.navigationRepo.find({
      relations: ['categories'],
      order: { createdAt: 'ASC' },
    });

    // Trigger scrape if no data exists
    if (navigation.length === 0) {
      return this.scrapeNavigation(false);
    }

    return navigation;
  }

  async findBySlug(slug: string): Promise<Navigation> {
    const navigation = await this.navigationRepo.findOne({
      where: { slug },
      relations: ['categories'],
    });

    if (!navigation) {
      throw new NotFoundException(`Navigation with slug "${slug}" not found`);
    }

    return navigation;
  }

  async scrapeNavigation(force: boolean): Promise<Navigation[]> {
    return this.scraperService.scrapeNavigation(force);
  }
}
