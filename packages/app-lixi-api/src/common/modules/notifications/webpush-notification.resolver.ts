import { WebpushSubscribeInput, WebpushSubscriber } from '@bcpros/lixi-models';
import { HttpCode, HttpException, HttpStatus, Injectable, Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { Account } from '@prisma/client';
import { PubSub } from 'graphql-subscriptions';
import { I18n, I18nService } from 'nestjs-i18n';
import { AccountEntity } from 'src/decorators';
import { GqlHttpExceptionFilter } from 'src/middlewares/gql.exception.filter';
import { GqlJwtAuthGuardByPass } from 'src/modules/auth/guards/gql-jwtauth.guard';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { VError } from 'verror';

const pubSub = new PubSub();

@Injectable()
@Resolver(() => WebpushSubscriber)
@UseFilters(GqlHttpExceptionFilter)
export class WebpushNotificationResolver {
  private logger: Logger = new Logger(WebpushNotificationResolver.name);

  constructor(private prisma: PrismaService, @I18n() private i18n: I18nService) { }

  @Query(() => WebpushSubscriber)
  async subscriber(@Args('id', { type: () => String }) id: string) {
    return this.prisma.webpushSubscriber.findUnique({
      where: { id: id }
    });
  }

  @UseGuards(GqlJwtAuthGuardByPass)
  @Mutation(() => [WebpushSubscriber])
  async subscribe(@AccountEntity() account: Account, @Args('data') data: WebpushSubscribeInput) {
    const { clientAppId, auth, p256dh, endpoint, deviceId, subscribers } = data;

    // Find the old subsribers and delete them
    // Then insert the new one
  }

  @UseGuards(GqlJwtAuthGuardByPass)
  @Mutation(() => WebpushSubscriber)
  @HttpCode(200)
  async createWebpushSubscriber(@AccountEntity() account: Account, @Args('data') data: CreateWebpushSubscriberInput) {
    try {
      const { clientAppId, auth, p256dh, endpoint, deviceId, accountId, address } = data;
      const subscriberToSave = {
        data: {
          clientAppId,
          auth,
          p256dh,
          endpoint,
          deviceId,
          accountId,
          address
        }
      };

      const createdSubscriber = await this.prisma.webpushSubscriber.create({
        ...subscriberToSave
      });

      pubSub.publish('webpushSubscriberCreated', { postCreated: createdSubscriber });
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableToCreateSubscriber = await this.i18n.t('notification.messages.unableToCreateSubscriber');
        const error = new VError.WError(err as Error, unableToCreateSubscriber);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @UseGuards(GqlJwtAuthGuardByPass)
  @Mutation(() => WebpushSubscriber)
  @HttpCode(200)
  async updateWebpushSubscriber(@AccountEntity() account: Account, @Args('data') data: UpdateWebpushSubscriberInput) {
    if (!account) {
      const couldNotFindAccount = await this.i18n.t('post.messages.couldNotFindAccount');
      throw new Error(couldNotFindAccount);
    }

    try {
      const { id, clientAppId, auth, p256dh, endpoint, deviceId, accountId, address } = data;

      const subscriber = await this.prisma.webpushSubscriber.findFirst({
        where: {
          id
        }
      });

      if (!subscriber) {
        const couldNotFindSubscriber = await this.i18n.t('notification.messages.couldNotFindSubscriber');
        throw new Error(couldNotFindSubscriber);
      }

      if (subscriber.accountId !== account.id) {
        const noPermission = await this.i18n.t('notification.messages.noUpdateSubscriberPermission');
        throw new Error(noPermission);
      }

      const updatedSubscriber = await this.prisma.webpushSubscriber.update({
        where: {
          id
        },
        data: {
          clientAppId,
          auth,
          p256dh,
          endpoint,
          deviceId,
          updatedAt: new Date()
        }
      });

      pubSub.publish('webpushSubscriberUpdated', { postCreated: updatedSubscriber });

      return updatedSubscriber;
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableToCreateSubscriber = await this.i18n.t('notification.messages.unableToCreateSubscriber');
        const error = new VError.WError(err as Error, unableToCreateSubscriber);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
