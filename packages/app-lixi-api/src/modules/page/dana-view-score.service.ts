import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class DanaViewScoreService {
  private logger: Logger = new Logger(this.constructor.name);
  private keyPrefix = 'posts:item-data:danaview';

  constructor(@InjectRedis() private readonly redis: Redis) {}

  async getById(id: string) {
    return (await this.redis.hget(this.keyPrefix, `${id}`)) ?? 0;
  }

  async getByIds(ids: string[]) {
    return await this.redis.hmget(this.keyPrefix, ...ids);
  }

  async incrBy(id: string, value: number) {
    await this.redis.hincrbyfloat(this.keyPrefix, `${id}`, value);
  }
}
