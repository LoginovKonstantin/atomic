import { Controller, Get, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/btc-usd/price')
  async getBtcUsdPrice(@Query('userId') userId): Promise<void> {
    await this.appService.getBtcUsdPrice(userId);
  }

  @Get('/btc-usd/price/:minutes')
  async getHistoricalBtcUsdPrice(
    @Param('minutes') minutes: number,
    @Query('userId') userId: string,
  ): Promise<void> {
    await this.appService.getHistoricalBtcUsdPrice(userId, Number(minutes));
  }
}
