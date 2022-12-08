import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { POSTS } from './constants/meili.constants';
import { MeiliService } from './meili.service';

@Injectable()
export class PostService {
  constructor(private meiliService: MeiliService) {}

  async findAll(limit: number, offset: number, query = ''): Promise<any> {
    const count = await this.meiliService.searchByQueryEstimatedTotalHits(POSTS, query);
    const posts = await this.meiliService.searchByQueryHits(POSTS, query, limit, offset);
    return [posts, count];
  }
}
