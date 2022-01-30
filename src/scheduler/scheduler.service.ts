import { lastValueFrom, map } from 'rxjs';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, Timeout } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { RedisCacheService } from '../cache/redisCache.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private redisCacheService: RedisCacheService,
  ) {}

  @Timeout('OnStartup', 1000)
  async onStartup(): Promise<void> {
    await this.updateBtcUsdPrice();
  }

  @Cron('0 */1 * * * *')
  async updateBtcUsdPrice() {
    const [priceUrl, historyPriceUrl, key] = [
      this.configService.get<string>('BTC_USD_PRICE_URL'),
      this.configService.get<string>('BTC_USD_HISTORICAL_PRICE_URL'),
      this.configService.get<string>('CRYPTO_API_KEY'),
    ];

    const [currentPrice, history] = await Promise.all(
      [priceUrl, historyPriceUrl].map(async (url) =>
        lastValueFrom(
          this.httpService
            .get(`${url}&api_key=${key}`)
            .pipe(map((res) => res.data)),
        ),
      ),
    );

    const btcUsdPrice = currentPrice.USD;

    if (!btcUsdPrice) {
      this.logger.error(
        `CRYPTO API response without btc/usd price, response: ${currentPrice}`,
      );
    } else {
      await this.redisCacheService.setBtcUsdPrice(btcUsdPrice);
    }

    if (!history || !history.Data || !history.Data.Data) {
      this.logger.error(
        `CRYPTO API response without history btc/usd prices, response: ${history}`,
      );
    } else {
      await this.redisCacheService.setBtcUsdHistory(
        history.Data.Data.map((el) => ({
          time: el.time,
          price: ((el.high + el.low) / 2).toFixed(2),
        })),
      );
    }
  }
}
