import { Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('rates')
export class Rate {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  fromCurrency: string;

  @Column()
  toCurrency: string;

  @Column('decimal', { precision: 20, scale: 8 })
  rate: number;

  @Column()
  source: string; // External API source (e.g., "fixer.io")

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
