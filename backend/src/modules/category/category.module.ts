import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category } from '../../database/entities/category.entity';
import { ScraperModule } from '../scraper/scraper.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), ScraperModule],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
