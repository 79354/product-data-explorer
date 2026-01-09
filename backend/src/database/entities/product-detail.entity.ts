import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_detail')
export class ProductDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  productId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  specs: Record<string, any>;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  ratingsAvg: number;

  @Column({ type: 'integer', default: 0 })
  reviewsCount: number;

  @Column({ type: 'jsonb', nullable: true })
  recommendations: string[];

  @OneToOne(() => Product, product => product.detail)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
