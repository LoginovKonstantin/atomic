import { Cache } from 'cache-manager';
import {
  Injectable,
  Inject,
  CACHE_MANAGER,
  OnApplicationShutdown,
} from '@nestjs/common';

@Injectable()
export class RedisCacheService implements OnApplicationShutdown {
  private readonly base = 'atomic:';
  private readonly userIdPrefix = `${this.base}:user:id:`;
  private readonly userSessionPrefix = `${this.base}:user:session:`;

  private readonly cryptoKey = `${this.base}btc:usd`;
  private readonly cryptoHistoryKey = `${this.base}history:btc:usd`;

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async setBtcUsdPrice(value): Promise<void> {
    await this.cache.set(this.cryptoKey, value);
  }

  async setBtcUsdHistory(values): Promise<void> {
    await this.cache.set(this.cryptoHistoryKey, values);
  }

  async getBtcUsdPrice(): Promise<number> {
    return await this.cache.get(this.cryptoKey);
  }

  async getBtcUsdHistory(): Promise<Array<{ time: number; price: number }>> {
    return await this.cache.get(this.cryptoHistoryKey);
  }

  async setUserSession(userId: string, sessionId: string): Promise<void> {
    await this.cache.set(`${this.userIdPrefix}${userId}`, sessionId);
    await this.cache.set(`${this.userSessionPrefix}${sessionId}`, userId);
  }

  async getUserSession(userId: string): Promise<string> {
    return await this.cache.get(`${this.userIdPrefix}${userId}`);
  }

  async delUserBySession(sessionId: string): Promise<void> {
    const userId = await this.cache.get(
      `${this.userSessionPrefix}${sessionId}`,
    );
    await this.cache.del(`${this.userIdPrefix}${userId}`);
    await this.cache.del(`${this.userSessionPrefix}${sessionId}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async onApplicationShutdown(ignore: string): Promise<void> {
    const keys = await this.cache.store.keys(`${this.base}*`);
    await Promise.all(keys.map((k) => this.cache.del(k)));
  }
}
