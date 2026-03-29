import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { Rate } from './entities/rate.entity';
import { RateController } from './controllers/rate.controller';
import { RateService } from './services/rate.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.MONGODB_URI || 'mongodb://localhost:27017/forex-rate-db',
      entities: [Rate],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Rate]),
    HttpModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [RateController],
  providers: [RateService],
})
export class AppModule {}
