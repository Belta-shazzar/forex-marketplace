import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Wallet } from './entities/wallet.entity';
import { WalletController } from './controllers/wallet.controller';
import { WalletService } from './services/wallet.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.MONGODB_URI || 'mongodb://localhost:27017/forex-wallet-db',
      entities: [Wallet],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Wallet]),
    ClientsModule.register([
      {
        name: 'RATE_SERVICE',
        transport: Transport.GRPC,
        options: {
          url: process.env.RATE_SERVICE_URL || 'localhost:5001',
          package: 'rate',
          protoPath: join(__dirname, '../../../rate-service/src/protos/rate.proto'),
        },
      },
    ]),
  ],
  controllers: [WalletController],
  providers: [WalletService],
})
export class AppModule {}
