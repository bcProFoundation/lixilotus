import { WebpushSubscribeCommand, WebpushUnsubscribeCommand } from '@bcpros/lixi-models';
import { Body, Controller, HttpException, HttpStatus, Logger, Post } from '@nestjs/common';
import { verify } from 'bitcoinjs-message';
import * as _ from 'lodash';
import { I18n, I18nService } from 'nestjs-i18n';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { VError } from 'verror';

@Controller('webpush')
export class WebpushController {
  private logger: Logger = new Logger(WebpushController.name);

  constructor(private prisma: PrismaService, @I18n() private i18n: I18nService) {}

  @Post('subscribe')
  async subscribe(@Body() command: WebpushSubscribeCommand): Promise<any> {
    if (command && command.subscribers) {
      const { subscribers, clientAppId, auth, p256dh, endpoint, deviceId } = command;
      try {
        // Get the current subscribe
        const existedSubscribers = await this.prisma.webpushSubscriber.findMany({
          where: {
            AND: [
              { endpoint: endpoint },
              { p256dh: p256dh },
              { auth: auth },
              { deviceId: deviceId },
              { clientAppId: clientAppId }
            ]
          }
        });

        // Detect any subscribers which is new and not in the existedSubscribers
        const newSubscribers = subscribers.filter(subscriber => {
          return !existedSubscribers.some(existedSubscriber => {
            return existedSubscriber.accountId === subscriber.accountId;
          });
        });

        // Verify the new subscribers
        const verifiedSubscribers = _.filter(newSubscribers, subscriber => {
          const { address, signature } = subscriber;
          return this.verifySubscriber(address, signature);
        });

        // Insert the new subscribers to the datababase
        const subscribersToInsert = verifiedSubscribers.map(subscriber => {
          const { address, accountId } = subscriber;
          return {
            clientAppId,
            auth,
            p256dh,
            endpoint,
            deviceId,
            accountId,
            address
          };
        });

        const createdSubscribers = await this.prisma.webpushSubscriber.createMany({
          data: subscribersToInsert
        });

        return createdSubscribers.count;
      } catch (err) {
        if (err instanceof VError) {
          throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          const unableToCreateSubscriber = await this.i18n.t('notification.messages.unableToSubscribe');
          const error = new VError.WError(err as Error, unableToCreateSubscriber);
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    }

    return 0;
  }

  @Post('unsubscribe')
  async unsubscribe(@Body() command: WebpushUnsubscribeCommand) {
    try {
      const { clientAppId, auth, p256dh, endpoint, deviceId } = command;

      // Delete the stale subscribers
      const count = await this.prisma.webpushSubscriber.deleteMany({
        where: {
          AND: [
            { endpoint: endpoint },
            { p256dh: p256dh },
            { auth: auth },
            { deviceId: deviceId },
            { clientAppId: clientAppId }
          ]
        }
      });

      return count;
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableToCreateSubscriber = await this.i18n.t('notification.messages.unableToUnsubscribe');
        const error = new VError.WError(err as Error, unableToCreateSubscriber);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  verifySubscriber(address: string, signature: string): boolean {
    try {
      const message = address;
      return verify(message, address, signature);
    } catch (error) {
      return false;
    }
  }
}
