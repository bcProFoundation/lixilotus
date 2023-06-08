import { IItem, IPaginatedItems, ISortedItemRepository } from '../models/redis.model';
import { Redis, Cluster } from 'ioredis';
import { encode } from '@msgpack/msgpack';
import { bufferToItem } from './repository';

export class SortedItemRepository<T> implements ISortedItemRepository<T> {
  private readonly keyPrefix: string;
  private readonly hashPrefix: string;

  constructor(keyPrefix: string, hashPrefix: string, public readonly redis: Redis | Cluster = new Redis()) {
    this.keyPrefix = keyPrefix;
    this.hashPrefix = hashPrefix;
  }

  async set(item: IItem<T>, score: number): Promise<void> {
    if (await this.hasItem(item.id)) {
      await this.redis.zrem(this.keyPrefix, item.id);
    }
    const buffer = encode(item);

    await Promise.all([
      await this.redis.hset(this.hashPrefix, item.id, Buffer.from(buffer)),
      await this.redis.zadd(this.keyPrefix, score, item.id)
    ]);
  }

  async setItems(items: IItem<T>[], scores: number[]): Promise<void> {
    await Promise.all(
      items.map(item => {
        return this.redis.zrem(this.keyPrefix, item.id);
      })
    );

    await Promise.all(
      items.map((item, index) => {
        const buffer = encode(item);
        return Promise.all([
          this.redis.hset(this.hashPrefix, item.id, Buffer.from(buffer)),
          this.redis.zadd(this.keyPrefix, scores[index], item.id)
        ]);
      })
    );
  }

  async indexOf(id: string): Promise<number | null> {
    return await this.redis.zrank(this.keyPrefix, id);
  }

  async getById(id: string): Promise<IItem<T> | null> {
    const payload = await this.redis.hgetBuffer(this.hashPrefix, id);

    return bufferToItem(payload);
  }

  async getAll(): Promise<IItem<T>[]> {
    const keys = await this.redis.zrange(this.keyPrefix, 0, -1);
    if (keys.length === 0) {
      return [];
    }
    const buffers = await this.redis.hmgetBuffer(this.hashPrefix, ...keys);

    return buffers.map(b => bufferToItem(b) as IItem<T>);
  }

  async getItemScoreById(id: string): Promise<number | null> {
    const score = await this.redis.zscore(this.keyPrefix, id);

    return score ? Number(score) : null;
  }

  async getItemsByScore(min: number, max: number): Promise<IItem<T>[]> {
    const keys = await this.redis.zrangebyscore(this.keyPrefix, min, max);
    if (keys.length === 0) {
      return [];
    }

    const buffers = await this.redis.hmgetBuffer(this.hashPrefix, ...keys);
    const items = buffers.map(b => bufferToItem(b) as IItem<T>);

    return items;
  }

  async getPaginated(page: number, pageSize: number): Promise<IPaginatedItems<T>> {
    const count = await this.redis.zcard(this.keyPrefix);
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    const keys = await this.redis.zrange(this.keyPrefix, start, end);
    if (keys.length === 0) {
      return {
        items: [],
        count: 0
      };
    }

    const buffers = await this.redis.hmgetBuffer(this.hashPrefix, ...keys);
    const items = buffers.map(b => bufferToItem(b) as IItem<T>);

    return {
      items,
      count
    };
  }

  async deletePage(page: number, pageSize: number): Promise<void> {
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    const keys = await this.redis.zrange(this.keyPrefix, start, end);
    if (keys.length > 0) {
      await Promise.all([this.redis.zrem(this.keyPrefix, ...keys), this.redis.hdel(this.hashPrefix, ...keys)]);
    }
  }

  async hasItem(id: string): Promise<boolean> {
    return (await this.redis.hexists(this.hashPrefix, id)) === 1;
  }

  async deleteById(id: string): Promise<void> {
    await Promise.all([this.redis.zrem(this.keyPrefix, id), this.redis.hdel(this.hashPrefix, id)]);
  }

  async count(): Promise<number> {
    const count = await this.redis.zcard(this.keyPrefix);

    return count;
  }

  async deleteAll(): Promise<void> {
    await Promise.all([await this.redis.del(this.hashPrefix), await this.redis.del(this.keyPrefix)]);
  }

  async getFirstNItems(n: number): Promise<IItem<T>[]> {
    const keys = await this.redis.zrange(this.keyPrefix, 0, n - 1);
    if (keys.length === 0) {
      return [];
    }
    const buffers = await this.redis.hmgetBuffer(this.hashPrefix, ...keys);

    return buffers.map(b => bufferToItem(b) as IItem<T>);
  }

  async getLastNItems(n: number): Promise<IItem<T>[]> {
    const keys = await this.redis.zrevrange(this.keyPrefix, 0, n - 1);
    if (keys.length === 0) {
      return [];
    }
    const buffers = await this.redis.hmgetBuffer(this.hashPrefix, ...keys);

    return buffers.map(b => bufferToItem(b) as IItem<T>).reverse();
  }

  async getItemsInRange(start: number, end: number): Promise<IItem<T>[]> {
    const keys = await this.redis.zrange(this.keyPrefix, start, end);
    if (keys.length === 0) {
      return [];
    }
    const buffers = await this.redis.hmgetBuffer(this.hashPrefix, ...keys);

    return buffers.map(b => bufferToItem(b) as IItem<T>);
  }

  async existsInRange(min: number, max: number): Promise<boolean> {
    const count = await this.redis.zcount(this.keyPrefix, min, max);

    return count > 0;
  }

  async getNextNItemsGreaterThanScore(score: number, n: number): Promise<IItem<T>[]> {
    const keys = await this.redis.zrangebyscore(this.keyPrefix, `(${score}`, '+inf', 'LIMIT', 0, n);
    if (keys.length === 0) {
      return [];
    }
    const buffers = await this.redis.hmgetBuffer(this.hashPrefix, ...keys);

    return buffers.map(b => bufferToItem(b) as IItem<T>);
  }
}

export default SortedItemRepository;
