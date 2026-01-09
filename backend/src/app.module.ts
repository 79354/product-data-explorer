import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { NavigationModule } from './modules/navigation/navigation.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { ScraperModule } from './modules/scraper/scraper.module';
import { HistoryModule } from './modules/history/history.module';
import { Navigation } from './database/entities/navigation.entity';
import { Category } from './database/entities/category.entity';
import { Product } from './database/entities/product.entity';
import { ProductDetail } from './database/entities/product-detail.entity';
import { Review } from './database/entities/review.entity';
import { ScrapeJob } from './database/entities/scrape-job.entity';
import { ViewHistory } from './database/entities/view-history.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Navigation, Category, Product, ProductDetail, Review, ScrapeJob, ViewHistory],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    NavigationModule,
    CategoryModule,
    ProductModule,
    ScraperModule,
    HistoryModule,
  ],
})
export class AppModule {}
