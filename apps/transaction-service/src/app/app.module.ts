import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { Order, Transaction } from './entities/order.entity';
import { OrderController } from './controllers/order.controller';
import { OrderService } from './services/order.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.MONGODB_URI || 'mongodb://localhost:27017/forex-transaction-db',
      entities: [Order, Transaction],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Order, Transaction]),
    HttpModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class AppModule {}
