import { PageCategory } from '@bcpros/lixi-models';
import { Controller, Get, HttpException, HttpStatus, UseInterceptors } from '@nestjs/common';
import * as _ from 'lodash';
import { I18n, I18nContext } from 'nestjs-i18n';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller('categories')
export class CategoryController {
  constructor(private prisma: PrismaService) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(120000)
  @Get()
  async getCategories(@I18n() i18n: I18nContext): Promise<PageCategory[]> {
    try {
      const categories = await this.prisma.category.findMany();
      const result = categories as PageCategory[];
      return result;
    } catch (err: unknown) {
      const unableGetEnvelope = await i18n.t('category.messages.unableToGetCategories');
      throw new HttpException(unableGetEnvelope, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
