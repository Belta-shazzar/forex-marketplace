import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ObjectId } from 'typeorm';
import { Wallet, CurrencyBalance } from '../entities/wallet.entity';
import { WalletResponseDto, BalanceResponseDto } from '../dtos/wallet.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  async createWallet(userId: string, currency: string, initialBalance: number = 0): Promise<WalletResponseDto> {
    let wallet = await this.walletRepository.findOne({
      where: { userId },
    });

    if (!wallet) {
      wallet = this.walletRepository.create({
        userId,
        balances: [{ currency, balance: initialBalance }],
      });
      await this.walletRepository.save(wallet);
    } else {
      // Add currency if not exists
      const existingCurrency = wallet.balances.find(b => b.currency === currency);
      if (!existingCurrency) {
        wallet.balances.push({ currency, balance: initialBalance });
        await this.walletRepository.save(wallet);
      }
    }

    return this.toResponseDto(wallet);
  }

  async getWallet(userId: string): Promise<WalletResponseDto> {
    const wallet = await this.walletRepository.findOne({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet for user ${userId} not found`);
    }

    return this.toResponseDto(wallet);
  }

  async getBalance(userId: string, currency: string): Promise<BalanceResponseDto> {
    const wallet = await this.walletRepository.findOne({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet for user ${userId} not found`);
    }

    const balance = wallet.balances.find(b => b.currency === currency);
    if (!balance) {
      throw new NotFoundException(`No balance found for currency ${currency}`);
    }

    return balance;
  }

  async credit(userId: string, currency: string, amount: number, reason?: string): Promise<BalanceResponseDto> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const wallet = await this.walletRepository.findOne({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet for user ${userId} not found`);
    }

    const balanceIndex = wallet.balances.findIndex(b => b.currency === currency);
    if (balanceIndex === -1) {
      throw new NotFoundException(`No balance found for currency ${currency}`);
    }

    wallet.balances[balanceIndex].balance += amount;
    await this.walletRepository.save(wallet);

    return wallet.balances[balanceIndex];
  }

  async debit(userId: string, currency: string, amount: number, reason?: string): Promise<BalanceResponseDto> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const wallet = await this.walletRepository.findOne({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet for user ${userId} not found`);
    }

    const balanceIndex = wallet.balances.findIndex(b => b.currency === currency);
    if (balanceIndex === -1) {
      throw new NotFoundException(`No balance found for currency ${currency}`);
    }

    if (wallet.balances[balanceIndex].balance < amount) {
      throw new BadRequestException(`Insufficient balance for currency ${currency}`);
    }

    wallet.balances[balanceIndex].balance -= amount;
    await this.walletRepository.save(wallet);

    return wallet.balances[balanceIndex];
  }

  private toResponseDto(wallet: Wallet): WalletResponseDto {
    return {
      id: wallet.id.toString(),
      userId: wallet.userId,
      balances: wallet.balances,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }
}
