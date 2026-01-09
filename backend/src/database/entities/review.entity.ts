import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('review')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  author: string;

  @Column({ type: 'integer', nullable: true })
  rating: number;

  @Column({ type: 'text', nullable: true })
  text: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Product, product => product.reviews)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
