import { Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

export enum OrderType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Entity('orders')
export class Order {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  userId: string;

  @Column()
  type: OrderType;

  @Column()
  status: OrderStatus;

  @Column()
  fromCurrency: string;

  @Column()
  toCurrency: string;

  @Column('decimal', { precision: 20, scale: 8 })
  fromAmount: number;

  @Column('decimal', { precision: 20, scale: 8 })
  toAmount: number;

  @Column('decimal', { precision: 20, scale: 8 })
  rate: number;

  @Column({ nullable: true })
  errorMessage?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('transactions')
export class Transaction {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  orderId: string;

  @Column()
  userId: string;

  @Column()
  type: OrderType;

  @Column()
  fromCurrency: string;

  @Column()
  toCurrency: string;

  @Column('decimal', { precision: 20, scale: 8 })
  fromAmount: number;

  @Column('decimal', { precision: 20, scale: 8 })
  toAmount: number;

  @Column('decimal', { precision: 20, scale: 8 })
  rate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
