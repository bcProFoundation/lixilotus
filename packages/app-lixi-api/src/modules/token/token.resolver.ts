import { Account, CreateTokenInput, Token, TokenConnection, TokenOrder } from '@bcpros/lixi-models';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpException, HttpStatus, Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { SkipThrottle } from '@nestjs/throttler';
import { ChronikClient } from 'chronik-client';
import { PubSub } from 'graphql-subscriptions';
import { Redis } from 'ioredis';
import moment from 'moment';
import { I18n, I18nContext, I18nService } from 'nestjs-i18n';
import { connectionFromArraySlice } from 'src/common/custom-graphql-relay/arrayConnection';
import { InjectChronikClient } from 'src/common/modules/chronik/chronik.decorators';
import SortedItemRepository from 'src/common/redis/sorted-repository';
import { GqlHttpExceptionFilter } from 'src/middlewares/gql.exception.filter';
import { GqlJwtAuthGuard } from 'src/modules/auth/guards/gql-jwtauth.guard';
import VError from 'verror';
import { PrismaService } from '../prisma/prisma.service';
import { AccountEntity } from 'src/decorators';
import { FollowCacheService } from '../account/follow-cache.service';

const pubSub = new PubSub();

@SkipThrottle()
@Resolver(() => Token)
@UseFilters(GqlHttpExceptionFilter)
export class TokenResolver {
  private logger: Logger = new Logger(this.constructor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly followCacheService: FollowCacheService,
    @InjectRedis() private readonly redis: Redis,
    @I18n() private readonly i18n: I18nService,
    @InjectChronikClient('xec') private chronik: ChronikClient
  ) {}

  @Subscription(() => Token)
  tokenCreated() {
    return pubSub.asyncIterator('tokenCreated');
  }

  @Query(() => Token)
  @UseGuards(GqlJwtAuthGuard)
  async token(@AccountEntity() account: Account, @Args('tokenId', { type: () => String }) tokenId: string) {
    const tokenInfo = await this.prisma.token.findUnique({
      where: {
        tokenId: tokenId
      }
    });

    const isFollowed = await this.followCacheService.checkIfAccountFollowToken(account.id, tokenId);

    return { ...tokenInfo, isFollowed: isFollowed };
  }

  @Query(() => TokenConnection)
  @UseGuards(GqlJwtAuthGuard)
  async allTokens(
    @AccountEntity() account: Account,
    @Args({
      name: 'orderBy',
      type: () => TokenOrder,
      nullable: true
    })
    orderBy: TokenOrder
  ) {
    const keyPrefix = `tokens:list`;
    const hashPrefix = `tokens:items-data`;
    const tokenRepository = new SortedItemRepository<Token>(keyPrefix, hashPrefix, this.redis);

    const keyExist = await this.redis.exists(keyPrefix);

    if (!keyExist) {
      // caching the token1s
      const tokens = await this.prisma.token.findMany({
        orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined
      });

      const scores = tokens.map(token => token.danaBurnScore);
      await tokenRepository.setItems(tokens, scores);
      await this.redis.expire(keyPrefix, 3600);
    }

    const checkFollowTokens: any[] = await tokenRepository.getAll();
    const result: any[] = [];
    for (const token of checkFollowTokens) {
      const isFollowed = await this.followCacheService.checkIfAccountFollowToken(account.id, token.tokenId);

      result.push({
        ...token,
        isFollowed: isFollowed
      });
    }

    return connectionFromArraySlice(
      result,
      {},
      {
        arrayLength: result.length,
        sliceStart: 0
      }
    );
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Token)
  async createToken(@Args('data') data: CreateTokenInput, @I18n() i18n: I18nContext) {
    const { tokenId } = data;
    if (tokenId) {
      try {
        const keyPrefix = `tokens:list`;
        const hashPrefix = `tokens:items-data`;
        const tokenRepository = new SortedItemRepository<Token>(keyPrefix, hashPrefix, this.redis);
        let token = await tokenRepository.getById(tokenId);

        if (token) {
          throw new VError('Token already exist');
        }

        const tokenInfo = await this.chronik.token(tokenId);

        const tokenToInsert = {
          tokenId: tokenId,
          name: tokenInfo?.slpTxData?.genesisInfo?.tokenName,
          ticker: tokenInfo?.slpTxData?.genesisInfo?.tokenTicker,
          decimals: tokenInfo?.slpTxData?.genesisInfo?.decimals,
          initialTokenQuantity: tokenInfo?.initialTokenQuantity,
          tokenType: tokenInfo?.slpTxData?.slpMeta?.tokenType,
          tokenDocumentUrl: tokenInfo?.slpTxData?.genesisInfo?.tokenDocumentUrl,
          totalBurned: tokenInfo?.tokenStats?.totalBurned,
          totalMinted: tokenInfo?.tokenStats?.totalMinted,
          createdDate: moment(tokenInfo?.block?.timestamp, 'X').toDate(),
          comments: moment().toDate()
        };

        const createdToken = await this.prisma.token.create({
          data: tokenToInsert
        });

        tokenRepository.set(createdToken, createdToken.danaBurnScore);

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
