import { CreateTokenInput, PaginationArgs, Token, TokenConnection, TokenOrder } from '@bcpros/lixi-models';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { HttpException, HttpStatus, Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { SkipThrottle } from '@nestjs/throttler';
import { ChronikClient } from 'chronik-client';
import { PubSub } from 'graphql-subscriptions';
import moment from 'moment';
import { I18n, I18nContext, I18nService } from 'nestjs-i18n';
import { InjectChronikClient } from 'src/common/modules/chronik/chronik.decorators';
import { GqlHttpExceptionFilter } from 'src/middlewares/gql.exception.filter';
import { GqlJwtAuthGuard } from 'src/modules/auth/guards/gql-jwtauth.guard';
import VError from 'verror';
import { PrismaService } from '../prisma/prisma.service';

const pubSub = new PubSub();

@SkipThrottle()
@Resolver(() => Token)
@UseFilters(GqlHttpExceptionFilter)
export class TokenResolver {
  constructor(
    private logger: Logger,
    private prisma: PrismaService,
    @I18n() private i18n: I18nService,
    @InjectChronikClient('xec') private chronik: ChronikClient
  ) {}

  @Subscription(() => Token)
  tokenCreated() {
    return pubSub.asyncIterator('tokenCreated');
  }

  @Query(() => Token)
  async token(@Args('tokenId', { type: () => String }) tokenId: string) {
    const tokenInfo = await this.prisma.token.findUnique({
      where: {
        tokenId: tokenId
      }
    });

    return tokenInfo;
  }

  @Query(() => TokenConnection)
  async allTokens(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'query', type: () => String, nullable: true })
    query: string,
    @Args({
      name: 'orderBy',
      type: () => TokenOrder,
      nullable: true
    })
    orderBy: TokenOrder
  ) {
    const result = await findManyCursorConnection(
      paginationArgs =>
        this.prisma.token.findMany({
          where: {
            OR: !query
              ? undefined
              : {
                  name: { contains: query || '' }
                }
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...paginationArgs
        }),
      () =>
        this.prisma.token.count({
          where: {
            OR: !query
              ? undefined
              : {
                  name: { contains: query || '' }
                }
          }
        }),
      { first, last, before, after }
    );
    return result;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Token)
  async createToken(@Args('data') data: CreateTokenInput, @I18n() i18n: I18nContext) {
    const { tokenId } = data;
    if (tokenId) {
      try {
        const tokenExist = await this.prisma.token.findUnique({
          where: {
            tokenId: tokenId
          }
        });

        if (tokenExist) {
          throw new VError('Token already exist');
        }

        const token = await this.chronik.token(tokenId);

        const tokenToInsert = {
          tokenId: tokenId,
          name: token?.slpTxData?.genesisInfo?.tokenName,
          ticker: token?.slpTxData?.genesisInfo?.tokenTicker,
          decimals: token?.slpTxData?.genesisInfo?.decimals,
          initialTokenQuantity: token?.initialTokenQuantity,
          tokenType: token?.slpTxData?.slpMeta?.tokenType,
          tokenDocumentUrl: token?.slpTxData?.genesisInfo?.tokenDocumentUrl,
          totalBurned: token?.tokenStats?.totalBurned,
          totalMinted: token?.tokenStats?.totalMinted,
          createdDate: moment(token?.block?.timestamp, 'X').toDate(),
          comments: moment().toDate()
        };

        const createdToken = await this.prisma.token.create({
          data: tokenToInsert
        });

        const resultApi = { ...createdToken };

        return resultApi;
      } catch (err) {
        if (err instanceof VError) {
          throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          const unableCreateToken = await i18n.t('token.messages.unableCreateToken');
          const error = new VError.WError(err as Error, unableCreateToken);
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    }
    return null as any;
  }
}
