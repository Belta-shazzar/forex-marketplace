import { IsNotEmpty, IsNumber, IsString, IsEnum, Min } from 'class-validator';

export enum OrderTypeDto {
  BUY = 'BUY',
  SELL = 'SELL',
}

export class PlaceOrderDto {
  @IsEnum(OrderTypeDto)
  type: OrderTypeDto;

  @IsNotEmpty()
  @IsString()
  fromCurrency: string;

  @IsNotEmpty()
  @IsString()
  toCurrency: string;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class OrderResponseDto {
  id: string;
  userId: string;
  type: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  status: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TransactionResponseDto {
  id: string;
  orderId: string;
  userId: string;
  type: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  createdAt: Date;
  updatedAt: Date;
}
