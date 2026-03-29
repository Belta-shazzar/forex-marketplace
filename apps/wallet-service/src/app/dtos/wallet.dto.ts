import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateWalletDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNumber()
  @Min(0)
  initialBalance?: number;
}

export class CreditWalletDto {
  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  reason?: string;
}

export class DebitWalletDto {
  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  reason?: string;
}

export class WalletResponseDto {
  id: string;
  userId: string;
  balances: Array<{
    currency: string;
    balance: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export class BalanceResponseDto {
  currency: string;
  balance: number;
}
