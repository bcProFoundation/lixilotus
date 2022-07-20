import { CreatePageCommand, PageDto, PaginationResult, UpdatePageCommand } from '@bcpros/lixi-models';
import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import * as _ from 'lodash';
import { I18n, I18nContext, I18nService } from 'nestjs-i18n';
import { NotificationService } from 'src/common/modules/notifications/notification.service';
import { VError } from 'verror';
import { JwtAuthGuard } from '../auth/jwtauth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('pages')
@Injectable()
export class PageController {
  private logger: Logger = new Logger(this.constructor.name);

  constructor(private prisma: PrismaService, @I18n() private i18n: I18nService) {}

  @Get(':id')
  async get(@Param('id') id: string): Promise<PageDto> {
    try {
      const page = await this.prisma.page.findUnique({
        where: {
          id: id
        },
        include: {
          children: true
        }
      });

      if (!page) {
        const pageNotExist = await this.i18n.t('page.messages.pageNotExist');
        throw new VError(pageNotExist);
      }

      return new PageDto(page);
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableToGetPage = await this.i18n.t('page.messages.unableToGetPage');
        const error = new VError.WError(err as Error, unableToGetPage);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Get('address/:address')
  async getByAddress(@Param('address') address: string): Promise<PageDto> {
    try {
      const account = await this.prisma.account.findFirst({
        where: {
          address: address
        }
      });

      if (!account) {
        const couldNotFindAccount = await this.i18n.t('page.messages.couldNotFindAccount');
        throw new Error(couldNotFindAccount);
      }
      const page = await this.prisma.page.findFirst({
        where: {
          pageAccountId: account?.id
        }
      });

      if (!page) {
        const pageNotExist = await this.i18n.t('page.messages.pageNotExist');
        throw new VError(pageNotExist);
      }
      return new PageDto(page);
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableToGetPage = await this.i18n.t('page.messages.unableToGetPage');
        const error = new VError.WError(err as Error, unableToGetPage);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Get(':id/children')
  async getSubPage(
    @Param('id') id: string,
    @Query('startId') startId: string,
    @Query('limit') limit: number,
    @Headers('account-secret') accountSecret: string,
    @I18n() i18n: I18nContext
  ): Promise<PaginationResult<PageDto>> {
    const pageId = id;
    const take = limit ? _.toSafeInteger(limit) : 10;
    const cursor = startId ? startId : null;

    try {
      const count = await this.prisma.page.count({
        where: {
          parentId: pageId
        }
      });

      const subPages = cursor
        ? await this.prisma.page.findMany({
            take: take,
            skip: 1,
            where: {
              parentId: pageId
            },
            cursor: {
              id: cursor
            }
          })
        : await this.prisma.page.findMany({
            take: take,
            where: {
              parentId: pageId
            }
          });

      const childrenApiResult: PageDto[] = [];

      for (let item of subPages) {
        childrenApiResult.push(new PageDto(item));
      }

      const startCursor = childrenApiResult.length > 0 ? _.first(childrenApiResult)?.id : null;
      const endCursor = childrenApiResult.length > 0 ? _.last(childrenApiResult)?.id : null;
      const countAfter = !endCursor
        ? 0
        : await this.prisma.page.count({
            where: {
              parentId: pageId
            },
            cursor: {
              id: endCursor
            },
            skip: 1
          });

      const hasNextPage = countAfter > 0;

      return {
        data: childrenApiResult ?? [],
        pageInfo: {
          hasNextPage,
          startCursor,
          endCursor
        },
        totalCount: count
      } as PaginationResult<PageDto>;
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableToGetLixi = await this.i18n.t('page.messages.unableToGetLixi');
        const error = new VError.WError(err as Error, unableToGetLixi);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Get(':id/subPage')
  async getSubPageByAccountId(@Param('id') id: string): Promise<PaginationResult<PageDto>> {
    const pageAccountId = Number(id);
    const take = 10;
    const cursor = null;

    try {
      const count = await this.prisma.page.count({
        where: {
          pageAccountId: pageAccountId
        }
      });

      const subPages = cursor
        ? await this.prisma.page.findMany({
            take: take,
            skip: 1,
            where: {
              pageAccountId: pageAccountId
            },
            cursor: {
              id: cursor
            }
          })
        : await this.prisma.page.findMany({
            take: take,
            where: {
              pageAccountId: pageAccountId
            }
          });

      const childrenApiResult: PageDto[] = [];

      for (let item of subPages) {
        childrenApiResult.push(new PageDto(item));
      }

      const startCursor = childrenApiResult.length > 0 ? _.first(childrenApiResult)?.id : null;
      const endCursor = childrenApiResult.length > 0 ? _.last(childrenApiResult)?.id : null;
      const countAfter = !endCursor
        ? 0
        : await this.prisma.page.count({
            where: {
              pageAccountId: pageAccountId
            },
            cursor: {
              id: endCursor
            },
            skip: 1
          });

      const hasNextPage = countAfter > 0;

      return {
        data: childrenApiResult ?? [],
        pageInfo: {
          hasNextPage,
          startCursor,
          endCursor
        },
        totalCount: count
      } as PaginationResult<PageDto>;
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableToGetLixi = await this.i18n.t('page.messages.unableToGetLixi');
        const error = new VError.WError(err as Error, unableToGetLixi);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() command: CreatePageCommand, @Request() req: FastifyRequest, @I18n() i18n: I18nContext) {
    const account = (req as any).account;

    if (!account) {
      const couldNotFindAccount = await this.i18n.t('page.messages.couldNotFindAccount');
      throw new Error(couldNotFindAccount);
    }

    try {
      const createdPage = await this.prisma.page.create({
        data: {
          ..._.omit(command, 'parentId', 'handleId'),
          pageAccount: { connect: { id: account.id } },
          parent: { connect: { id: command.parentId } },
          handle: { connect: { id: command.handleId } }
        }
      });
      return new PageDto(createdPage);
    } catch (err) {
      this.logger.error('**********' + JSON.stringify(err));
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableCreatePage = await this.i18n.t('lixi.messages.unableCreatePage');
        const error = new VError.WError(err as Error, unableCreatePage);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() command: UpdatePageCommand,
    @Request() req: FastifyRequest,
    @I18n() i18n: I18nContext
  ) {
    const account = (req as any).account;

    if (!account) {
      const couldNotFindAccount = await this.i18n.t('page.messages.couldNotFindAccount');
      throw new Error(couldNotFindAccount);
    }

    try {
      const updatedPage = await this.prisma.page.update({
        where: {
          id: id
        },
        data: {
          ...command
        }
      });

      return new PageDto(updatedPage);
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableCreatePage = await this.i18n.t('lixi.messages.unableCreatePage');
        const error = new VError.WError(err as Error, unableCreatePage);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
