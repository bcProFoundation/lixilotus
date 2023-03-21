import { Account, Burn, BurnCommand, BurnForType, BurnType, fromSmallestDenomination } from '@bcpros/lixi-models';
import BCHJS from '@bcpros/xpi-js';
import { Body, Controller, HttpException, HttpStatus, Inject, Logger, Post, UseGuards } from '@nestjs/common';
import { ChronikClient } from 'chronik-client';
import { I18n, I18nService } from 'nestjs-i18n';
import { InjectChronikClient } from 'src/common/modules/chronik/chronik.decorators';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { parseBurnOutput } from 'src/utils/opReturnBurn';
import { VError } from 'verror';
import _ from 'lodash';
import { NotificationService } from 'src/common/modules/notifications/notification.service';
import { GqlJwtAuthGuard } from 'src/modules/auth/guards/gql-jwtauth.guard';
import { PostAccountEntity } from 'src/decorators/postAccount.decorator';
import { NOTIFICATION_TYPES } from 'src/common/modules/notifications/notification.constants';
import { NotificationLevel } from '@bcpros/lixi-prisma';

@Controller('burn')
export class BurnController {
  private logger: Logger = new Logger(BurnController.name);
  constructor(
    private prisma: PrismaService,
    private readonly notificationService: NotificationService,
    @I18n() private i18n: I18nService,
    @InjectChronikClient('xpi') private chronik: ChronikClient,
    @Inject('xpijs') private XPI: BCHJS
  ) {}

  @Post()
  async burn(
    @Body() command: BurnCommand
    ): Promise<Burn> {
    try {
      const txData: any = await this.XPI.RawTransactions.decodeRawTransaction(command.txHex);
      if (!txData) {
        throw new Error('Unable to burn');
      }
      const { scriptPubKey, value } = txData['vout'][0];
      const parseResult = parseBurnOutput(scriptPubKey.hex);

      // In case of burn for token, burnForId is BurnForTokenId
      if (command.burnForType === BurnForType.Token) {
        const tokenCheck = await this.prisma.token.findUnique({
          where: {
            tokenId: parseResult.burnForId
          }
        });

        // Compare parse result with the command
        if (
          command.burnForId !== tokenCheck?.id ||
          command.burnForType !== parseResult.burnForType ||
          command.burnType !== parseResult.burnType ||
          command.burnedBy !== parseResult.burnedBy ||
          _.toNumber(command.burnValue) != value
        ) {
          throw new Error('Unable to burn');
        }
      } else {
        // Compare parse result with the command
        if (
          command.burnForId !== parseResult.burnForId ||
          command.burnForType !== parseResult.burnForType ||
          command.burnType !== parseResult.burnType ||
          command.burnedBy !== parseResult.burnedBy ||
          _.toNumber(command.burnValue) != value
        ) {
          throw new Error('Unable to burn');
        }
      }

      const savedBurn = await this.prisma.$transaction(async prisma => {
        const broadcastResponse = await this.chronik.broadcastTx(command.txHex);
        const { txid } = broadcastResponse;
        const burnRecordToInsert = {
          txid,
          burnType: parseResult.burnType ? true : false,
          burnForType: parseResult.burnForType,
          burnedBy: Buffer.from(parseResult.burnedBy, 'hex'),
          burnForId: parseResult.burnForId,
          burnedValue: value
        };
        const createdBurn = prisma.burn.create({
          data: burnRecordToInsert
        });
        return createdBurn;
      });

      if (savedBurn) {
        if (command.burnForType === BurnForType.Post) {
          const post = await this.prisma.post.findFirst({
            where: {
              id: command.burnForId
            }
          });

          let lotusBurnUp = post?.lotusBurnUp ?? 0;
          let lotusBurnDown = post?.lotusBurnDown ?? 0;
          const xpiValue = value;

          if (command.burnType == BurnType.Up) {
            lotusBurnUp = lotusBurnUp + xpiValue;
          } else {
            lotusBurnDown = lotusBurnDown + xpiValue;
          }
          const lotusBurnScore = lotusBurnUp - lotusBurnDown;

          await this.prisma.post.update({
            where: {
              id: command.burnForId
            },
            data: {
              lotusBurnDown,
              lotusBurnUp,
              lotusBurnScore
            }
          });
        } else if (command.burnForType === BurnForType.Token) {
          const token = await this.prisma.token.findFirst({
            where: {
              id: command.burnForId
            }
          });

          let lotusBurnUp = token?.lotusBurnUp ?? 0;
          let lotusBurnDown = token?.lotusBurnDown ?? 0;
          const xpiValue = value;

          if (command.burnType == BurnType.Up) {
            lotusBurnUp = lotusBurnUp + xpiValue;
          } else {
            lotusBurnDown = lotusBurnDown + xpiValue;
          }
          const lotusBurnScore = lotusBurnUp - lotusBurnDown;

          await this.prisma.token.update({
            where: {
              id: command.burnForId
            },
            data: {
              lotusBurnDown,
              lotusBurnUp,
              lotusBurnScore
            }
          });
        } else if (command.burnForType === BurnForType.Comment) {
          const comment = await this.prisma.comment.findFirst({
            where: {
              id: command.burnForId
            }
          });

          let lotusBurnUp = comment?.lotusBurnUp ?? 0;
          let lotusBurnDown = comment?.lotusBurnDown ?? 0;
          const xpiValue = value;

          if (command.burnType == BurnType.Up) {
            lotusBurnUp = lotusBurnUp + xpiValue;
          } else {
            lotusBurnDown = lotusBurnDown + xpiValue;
          }
          const lotusBurnScore = lotusBurnUp - lotusBurnDown;

          await this.prisma.comment.update({
            where: {
              id: command.burnForId
            },
            data: {
              lotusBurnDown,
              lotusBurnUp,
              lotusBurnScore
            }
          });
        }
      }

      // prepare data sender
      const legacyAddress = this.XPI.Address.hash160ToLegacy(command.burnedBy)
      const accountAddress = this.XPI.Address.toXAddress(legacyAddress);
      const sender = await this.prisma.account.findFirst({
        where: {
          address: accountAddress
        }
      })
      if (!sender) {
        const accountNotExistMessage = await this.i18n.t('account.messages.accountNotExist');
        throw new VError(accountNotExistMessage);
      }

      // prepare data recipient
      let commentAccountId;
      let commentPostId;
      if (command.burnForType == BurnForType.Comment) {
        const comment = await this.prisma.comment.findFirst({
          where: {id: command.burnForId}
        })

        commentAccountId = comment?.commentAccountId;
        commentPostId = comment?.commentToId;
      };

      const postId = command.burnForType == BurnForType.Comment ? commentPostId : command.burnForId;
      const post = await this.prisma.post.findFirst({
          where: {id: postId},
          include: {
            postAccount: true,
            page: true
          }
        }) 

      // get burnForType key
      const typeValuesArr = Object.values(BurnForType);
      const burnForTypeString = Object.keys(BurnForType)[typeValuesArr.indexOf(command.burnForType as unknown as BurnForType)];

      // BurnValue + tip + fee
      let tip = Number(command.burnValue)*0.04;
      let fee = Number(command.burnValue)*0.04;
      

      // create Notifications Burn
      const createNotifBurn = {
        senderId: sender.id,
        recipientId: post?.postAccountId as number,
        notificationTypeId: NOTIFICATION_TYPES.BURN,
        level: NotificationLevel.INFO,
        url: '/post/' + post?.id,
        additionalData: {
          senderName: sender.name,
          BurnForType: burnForTypeString,          
          xpiBurn: command.burnValue,
        }
      };
      await this.notificationService.createNotification(createNotifBurn);

      // create Notifications Fee
      const createNotifBurnFee = {
        senderId: sender.id,
        recipientId: post?.pageId ? post.page?.pageAccountId as number : post?.postAccountId,
        notificationTypeId: NOTIFICATION_TYPES.RECEIVE_BURN_FEE,
        level: NotificationLevel.INFO,
        url: '/post/' + post?.id,
        additionalData: {
          senderName: sender.name,
          pageName: post?.page?.name,
          BurnForType: burnForTypeString,
          xpiBurn: command.burnValue,
          xpiFee: fee
        }
      };
      await this.notificationService.createNotification(createNotifBurnFee);

      // create Notifications Tip
      if (command.burnType == BurnType.Up) {
        const createNotifBurnTip = {
          senderId: sender.id,
          recipientId: command.burnForType == BurnForType.Comment ? Number(commentAccountId): Number(postId),
          notificationTypeId: NOTIFICATION_TYPES.RECEIVE_BURN_TIP as number,
          level: NotificationLevel.INFO,
          url: '/post/' + post?.id,
          additionalData: {
            senderName: sender.name,
            BurnForType: burnForTypeString,
            xpiBurn: command.burnValue,
            xpiTip: tip
          }
        };
        await this.notificationService.createNotification(createNotifBurnTip);
      }

      const result: Burn = {
        ...savedBurn,
        burnType: savedBurn.burnType ? BurnType.Up : BurnType.Down,
        burnedBy: savedBurn.burnedBy.toString('hex')
      };

      return result;
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableToUpdateLixi = await this.i18n.t('burn.messages.unableToBurn');
        const error = new VError.WError(err as Error, unableToUpdateLixi);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
