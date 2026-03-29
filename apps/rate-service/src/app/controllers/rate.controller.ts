import { Controller, Get, Param, Query } from '@nestjs/common';
import { RateService } from '../services/rate.service';

@Controller('api/rates')
export class RateController {
  constructor(private readonly rateService: RateService) {}

  @Get(':fromCurrency/:toCurrency')
  async getRate(
    @Param('fromCurrency') fromCurrency: string,
    @Param('toCurrency') toCurrency: string,
  ): Promise<{ fromCurrency: string; toCurrency: string; rate: number }> {
    const rate = await this.rateService.getRate(
      fromCurrency.toUpperCase(),
      toCurrency.toUpperCase(),
    );

    return {
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      rate,
    };
  }

  @Get(':fromCurrency')
  async getRates(
    @Param('fromCurrency') fromCurrency: string,
    @Query('to') toCurrencies?: string,
  ): Promise<any> {
    const toArray = toCurrencies ? toCurrencies.split(',').map(c => c.toUpperCase()) : [];

    if (toArray.length === 0) {
      // Return all available rates for the currency
      const rates = await this.rateService.getAllRatesForCurrency(fromCurrency.toUpperCase());
      return {
        fromCurrency: fromCurrency.toUpperCase(),
        rates: Array.from(rates.entries()).map(([to, rate]) => ({ to, rate })),
      };
    }

    const rates = await this.rateService.getRates(fromCurrency.toUpperCase(), toArray);
    return {
      fromCurrency: fromCurrency.toUpperCase(),
      rates: Array.from(rates.entries()).map(([to, rate]) => ({ to, rate })),
    };
  }
}
