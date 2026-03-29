import { Injectable, BadRequestException, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Order, Transaction, OrderType, OrderStatus } from '../entities/order.entity';
import { PlaceOrderDto, OrderResponseDto, TransactionResponseDto } from '../dtos/order.dto';

@Injectable()
export class OrderService {
  private readonly walletServiceUrl = process.env.WALLET_SERVICE_URL || 'http://localhost:3002/api';
  private readonly rateServiceUrl = process.env.RATE_SERVICE_URL || 'http://localhost:3003/api';

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly httpService: HttpService,
  ) {}

  async placeOrder(userId: string, placeOrderDto: PlaceOrderDto): Promise<OrderResponseDto> {
    const { type, fromCurrency, toCurrency, amount } = placeOrderDto;

    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    if (fromCurrency === toCurrency) {
      throw new BadRequestException('Source and target currencies cannot be the same');
    }

    // Create order record
    const order = this.orderRepository.create({
      userId,
      type: type === 'BUY' ? OrderType.BUY : OrderType.SELL,
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      fromAmount: amount,
      toAmount: 0,
      rate: 0,
      status: OrderStatus.PENDING,
    });

    try {
      // Wait Fetch exchange rate from Rate Service
      const rate = await this.fetchRate(fromCurrency.toUpperCase(), toCurrency.toUpperCase());
      order.rate = rate;
      order.toAmount = amount * rate;

      // Perform the transaction based on order type
      if (type === 'BUY') {
        // User is buying toCurrency with fromCurrency
        // Debit fromCurrency from wallet and credit toCurrency
        await this.debitWallet(userId, fromCurrency.toUpperCase(), amount);
        await this.creditWallet(userId, toCurrency.toUpperCase(), order.toAmount);
      } else if (type === 'SELL') {
        // User is selling fromCurrency to get toCurrency
        // Debit fromCurrency and credit toCurrency
        await this.debitWallet(userId, fromCurrency.toUpperCase(), amount);
        await this.creditWallet(userId, toCurrency.toUpperCase(), order.toAmount);
      }

      // Mark order as completed
      order.status = OrderStatus.COMPLETED;
      const savedOrder = await this.orderRepository.save(order);

      // Create transaction record
      await this.transactionRepository.save({
        orderId: savedOrder.id.toString(),
        userId,
        type: type === 'BUY' ? OrderType.BUY : OrderType.SELL,
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        fromAmount: amount,
        toAmount: order.toAmount,
        rate,
      });

      return this.toOrderResponseDto(savedOrder);
    } catch (error) {
      // Mark order as failed
      order.status = OrderStatus.FAILED;
      order.errorMessage = error.message;
      await this.orderRepository.save(order);
      throw error;
    }
  }

  async getOrder(orderId: string): Promise<OrderResponseDto> {
    const ObjectId = require('mongodb').ObjectId;
    const order = await this.orderRepository.findOne({
      where: { id: new ObjectId(orderId) },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return this.toOrderResponseDto(order);
  }

  async getUserOrders(userId: string): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.find({
      where: { userId },
    });

    return orders.map(order => this.toOrderResponseDto(order));
  }

  async getTransactionHistory(userId: string): Promise<TransactionResponseDto[]> {
    const transactions = await this.transactionRepository.find({
      where: { userId },
    });

    return transactions.map(tx => this.toTransactionResponseDto(tx));
  }

  private async fetchRate(fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.rateServiceUrl}/rates/${fromCurrency}/${toCurrency}`),
      );
      return response.data.rate;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch rate for ${fromCurrency}/${toCurrency}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async creditWallet(userId: string, currency: string, amount: number): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.walletServiceUrl}/wallets/${userId}/credit`, {
          currency,
          amount,
          reason: 'Forex transaction credit',
        }),
      );
    } catch (error) {
      throw new HttpException(
        `Failed to credit wallet for user ${userId}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async debitWallet(userId: string, currency: string, amount: number): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.walletServiceUrl}/wallets/${userId}/debit`, {
          currency,
          amount,
          reason: 'Forex transaction debit',
        }),
      );
    } catch (error) {
      throw new HttpException(
        `Failed to debit wallet for user ${userId}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private toOrderResponseDto(order: Order): OrderResponseDto {
    return {
      id: order.id.toString(),
      userId: order.userId,
      type: order.type,
      fromCurrency: order.fromCurrency,
      toCurrency: order.toCurrency,
      fromAmount: order.fromAmount,
      toAmount: order.toAmount,
      rate: order.rate,
      status: order.status,
      errorMessage: order.errorMessage,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private toTransactionResponseDto(transaction: Transaction): TransactionResponseDto {
    return {
      id: transaction.id.toString(),
      orderId: transaction.orderId,
      userId: transaction.userId,
      type: transaction.type,
      fromCurrency: transaction.fromCurrency,
      toCurrency: transaction.toCurrency,
      fromAmount: transaction.fromAmount,
      toAmount: transaction.toAmount,
      rate: transaction.rate,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}
