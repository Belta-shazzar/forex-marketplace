import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { PlaceOrderDto, OrderResponseDto, TransactionResponseDto } from '../dtos/order.dto';

@Controller('api/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async placeOrder(
    @Req() request: any,
    @Body() placeOrderDto: PlaceOrderDto,
  ): Promise<OrderResponseDto> {
    // In production, extract userId from JWT token via guard
    const userId = request.body.userId || '1'; // TODO: Get from token
    return this.orderService.placeOrder(userId, placeOrderDto);
  }

  @Get(':orderId')
  async getOrder(@Param('orderId') orderId: string): Promise<OrderResponseDto> {
    return this.orderService.getOrder(orderId);
  }

  @Get('user/:userId')
  async getUserOrders(@Param('userId') userId: string): Promise<OrderResponseDto[]> {
    return this.orderService.getUserOrders(userId);
  }

  @Get('transactions/:userId')
  async getTransactionHistory(@Param('userId') userId: string): Promise<TransactionResponseDto[]> {
    return this.orderService.getTransactionHistory(userId);
  }
}
