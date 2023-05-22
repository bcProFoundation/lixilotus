import { WebpushSubscribeCommand, WebpushUnsubscribeCommand } from '@bcpros/lixi-models';
import BCHJS from '@bcpros/xpi-js';
import { Body, Controller, HttpException, HttpStatus, Inject, Logger, Post } from '@nestjs/common';
import { verify } from 'bitcoinjs-message';
import * as _ from 'lodash';
import { I18n, I18nService } from 'nestjs-i18n';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { VError } from 'verror';

@Controller('webpush')
export class WebpushController {
  private logger: Logger = new Logger(WebpushController.name);

  constructor(private prisma: PrismaService, @I18n() private i18n: I18nService, @Inject('xpijs') private XPI: BCHJS) {}

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

        if (newSubscribers.length == 0) {
          return 0;
        }

        // Verify the new subscribers
        const verifiedSubscribers = _.filter(newSubscribers, subscriber => {
          const { address, legacyAddress, signature } = subscriber;
          return this.verifySubscriber(address, legacyAddress, signature);
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
        this.logger.error(err);
        if (err instanceof VError) {
          throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          const unableToCreateSubscriber = await this.i18n.t('webpush.unableToSubscribe');
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
      const { addresses, clientAppId, auth, p256dh, endpoint, deviceId } = command;

      // If no addresses or empty addresses, we consider
      // that we subscrbe all addresses with the deviceId and clientAppId
      const isUnsubscribedAll = !(addresses && addresses.length > 0);

      // Delete the stale subscribers
      const count = await this.prisma.webpushSubscriber.deleteMany({
        where: {
          AND: [
            { endpoint: endpoint },
            { p256dh: p256dh },
            { auth: auth },
            { deviceId: deviceId },
            { clientAppId: clientAppId },
            {
              address: isUnsubscribedAll
                ? undefined
                : {
                    in: addresses
                  }
            }
          ]
        }
      });

      return count;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableToCreateSubscriber = await this.i18n.t('webpush.unableToUnsubscribe');
        const error = new VError.WError(err as Error, unableToCreateSubscriber);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  verifySubscriber(message: string, address: string, signature: string): boolean {
    try {
      return verify(message, address, signature);
    } catch (error) {
      return false;
    }
  }
}
