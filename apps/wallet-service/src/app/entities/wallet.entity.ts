import { Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

export interface CurrencyBalance {
  currency: string;
  balance: number;
}

@Entity('wallets')
export class Wallet {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  userId: string; // Reference to user from user-service

  @Column({
    type: 'array',
    default: [],
  })
  balances: CurrencyBalance[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
