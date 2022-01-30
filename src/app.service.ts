import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisCacheService } from './cache/redisCache.service';
import { SocketGateway } from './socket/socket.gateway';

@Injectable()
export class AppService {
  private readonly btcUsdPriceEvent = 'btc-usd:price';
  private readonly btcUsdHistoryEvent = 'btc-usd:history:price';
  private readonly availableIntervalsMinutes = [15, 30, 60];

  constructor(
    private redisCacheService: RedisCacheService,
    private socketGateway: SocketGateway,
  ) {}

  async getBtcUsdPrice(userId: string): Promise<void> {
    const userSession = await this.getUserSessionOrThrow(userId);
    const price = await this.redisCacheService.getBtcUsdPrice();

    this.socketGateway.server.sockets.sockets
      .get(userSession)
      .emit(this.btcUsdPriceEvent, price);
  }

  async getHistoricalBtcUsdPrice(
    userId: string,
    minutes: number,
  ): Promise<void> {
    this.checkMinutes(minutes);

    const userSession = await this.getUserSessionOrThrow(userId);
    const prices = await this.redisCacheService.getBtcUsdHistory();

    this.socketGateway.server.sockets.sockets
      .get(userSession)
      .emit(
        this.btcUsdHistoryEvent,
        prices ? prices.reverse().slice(0, minutes) : [],
      );
  }

  private async getUserSessionOrThrow(userId: string): Promise<string> {
    const userSession = await this.redisCacheService.getUserSession(userId);

    if (!userSession) {
      throw new NotFoundException(
        'User session by user id not found, check socket connection',
      );
    }
    return userSession;
  }

  private checkMinutes(minutes: number): void {
    if (!this.availableIntervalsMinutes.includes(minutes)) {
      throw new NotFoundException(
        `Incorrect minutes value, available param for minutes are ${this.availableIntervalsMinutes.toString()}`,
      );
    }
  }
}
