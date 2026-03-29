import { Controller, Get, Post, Body, Param, BadRequestException } from '@nestjs/common';
import { WalletService } from '../services/wallet.service';
import { CreateWalletDto, CreditWalletDto, DebitWalletDto, WalletResponseDto, BalanceResponseDto } from '../dtos/wallet.dto';

@Controller('api/wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  async createWallet(@Body() createWalletDto: CreateWalletDto): Promise<WalletResponseDto> {
    return this.walletService.createWallet(
      createWalletDto.userId,
      createWalletDto.currency,
      createWalletDto.initialBalance || 0,
    );
  }

  @Get(':userId')
  async getWallet(@Param('userId') userId: string): Promise<WalletResponseDto> {
    return this.walletService.getWallet(userId);
  }

  @Get(':userId/balance/:currency')
  async getBalance(
    @Param('userId') userId: string,
    @Param('currency') currency: string,
  ): Promise<BalanceResponseDto> {
    return this.walletService.getBalance(userId, currency);
  }

  @Post(':userId/credit')
  async credit(
    @Param('userId') userId: string,
    @Body() creditWalletDto: CreditWalletDto,
  ): Promise<BalanceResponseDto> {
    return this.walletService.credit(userId, creditWalletDto.currency, creditWalletDto.amount, creditWalletDto.reason);
  }

  @Post(':userId/debit')
  async debit(
    @Param('userId') userId: string,
    @Body() debitWalletDto: DebitWalletDto,
  ): Promise<BalanceResponseDto> {
    return this.walletService.debit(userId, debitWalletDto.currency, debitWalletDto.amount, debitWalletDto.reason);
  }
}
