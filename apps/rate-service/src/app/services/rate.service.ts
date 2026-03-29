import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Rate } from '../entities/rate.entity';

@Injectable()
export class RateService {
  private readonly logger = new Logger(RateService.name);
  private readonly supportedCurrencies = ['USD', 'EUR', 'GBP', 'NGN', 'JPY', 'CAD', 'AUD'];
  private readonly externalApiUrl = 'https://api.exchangerate-api.com/v4/latest';

  constructor(
    @InjectRepository(Rate)
    private readonly rateRepository: Repository<Rate>,
    private readonly httpService: HttpService,
  ) {
    // Fetch rates on startup
    this.fetchAndCacheRates();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async fetchAndCacheRates() {
    this.logger.log('Fetching exchange rates from external API...');
    
    for (const fromCurrency of this.supportedCurrencies) {
      try {
        const response = await firstValueFrom(
          this.httpService.get(`${this.externalApiUrl}/${fromCurrency}`),
        );

        const rates = response.data.rates;
        
        for (const toCurrency of this.supportedCurrencies) {
          if (fromCurrency !== toCurrency && rates[toCurrency]) {
            await this.updateRate(fromCurrency, toCurrency, rates[toCurrency]);
          }
        }
      } catch (error) {
        this.logger.error(`Failed to fetch rates for ${fromCurrency}: ${error.message}`);
      }
    }

    this.logger.log('Exchange rates updated successfully');
  }

  private async updateRate(fromCurrency: string, toCurrency: string, rate: number) {
    let rateRecord = await this.rateRepository.findOne({
      where: { fromCurrency, toCurrency },
    });

    if (!rateRecord) {
      rateRecord = this.rateRepository.create({
        fromCurrency,
        toCurrency,
        rate,
        source: 'exchangerate-api.com',
      });
    } else {
      rateRecord.rate = rate;
    }

    await this.rateRepository.save(rateRecord);
  }

  async getRate(fromCurrency: string, toCurrency: string): Promise<number> {
    const rateRecord = await this.rateRepository.findOne({
      where: { fromCurrency, toCurrency },
    });

    if (!rateRecord) {
      throw new Error(`Rate not found for ${fromCurrency}/${toCurrency}`);
    }

    return rateRecord.rate;
  }

  async getRates(fromCurrency: string, toCurrencies: string[]): Promise<Map<string, number>> {
    const rates = new Map<string, number>();

    for (const toCurrency of toCurrencies) {
      try {
        const rate = await this.getRate(fromCurrency, toCurrency);
        rates.set(toCurrency, rate);
      } catch (error) {
        this.logger.warn(`Could not fetch rate for ${fromCurrency}/${toCurrency}`);
      }
    }

    return rates;
  }

  async getAllRatesForCurrency(fromCurrency: string): Promise<Map<string, number>> {
    const rates = await this.rateRepository.find({
      where: { fromCurrency },
    });

    const ratesMap = new Map<string, number>();
    rates.forEach(r => ratesMap.set(r.toCurrency, r.rate));
    return ratesMap;
  }
}
