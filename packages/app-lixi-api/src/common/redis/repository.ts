import Redis, { Cluster } from 'ioredis';
import { IItem, IItemRepository, IPaginatedItems } from '../models/redis.model';
import { encode, decode } from '@msgpack/msgpack';

export function bufferToItem<T>(buffer: Buffer | null): IItem<T> | null {
  if (!buffer) return null;

  const item = decode(buffer) as IItem<T>;
  return item;
}

export class ItemRepository<T> implements IItemRepository<T> {
  private readonly keyPrefix: string;

  constructor(public readonly name: string, public readonly redis: Redis | Cluster = new Redis()) {
    this.keyPrefix = `items:${name}:`;
  }

  async set(item: IItem<T>, expirationInSeconds?: number): Promise<void> {
    const key = this.getKey(item.id.toString());
    const buffer = encode(item);
    if (expirationInSeconds != null) {
      await this.redis.setex(key, expirationInSeconds, Buffer.from(buffer));
    } else {
      await this.redis.set(key, Buffer.from(buffer));
    }
  }

  async getById(id: string | number): Promise<IItem<T> | null> {
    const key = this.getKey(id.toString());
    const result = await this.redis.getBuffer(key);

    return bufferToItem(result) as IItem<T>;
  }

  async getPaginated(page: number, pageSize: number): Promise<IPaginatedItems<T>> {
    const keys = await this.redis.keys(this.getKey('*'));
    const count = keys.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    const itemKeys = keys.slice(start, end + 1);
    if (itemKeys.length === 0) {
      return {
        items: [],
        count: 0
      };
    }

    const buffers = await this.redis.mgetBuffer(itemKeys);
    const items = buffers.map(b => bufferToItem(b) as IItem<T>) as IItem<T>[];

    return {
      items,
      count
    };
  }

  async hasItem(id: string | number): Promise<boolean> {
    const key = this.getKey(id.toString());
    return (await this.redis.exists(key)) === 1;
  }

  async deleteById(id: string | number): Promise<void> {
    const key = this.getKey(id.toString());
    await this.redis.del(key);
  }

  async deleteAll(): Promise<void> {
    const keys = await this.redis.keys(this.getKey('*'));
    if (keys.length > 0) {
      await this.redis.del(keys);
    }
  }

  async count(): Promise<number> {
    const keys = await this.redis.keys(this.getKey('*'));

    return keys.length;
  }

  private getKey(id: string | number): string {
    return `${this.keyPrefix}${id.toString()}`;
  }
}

export default ItemRepository;
