import { Burn, BurnCommand, BurnForType, BurnType } from '@bcpros/lixi-models';
import { NotificationLevel } from '@bcpros/lixi-prisma';
import BCHJS from '@bcpros/xpi-js';
import { Body, Controller, HttpException, HttpStatus, Inject, Logger, Post } from '@nestjs/common';
import { ChronikClient } from 'chronik-client';
import _ from 'lodash';
import { I18n, I18nService } from 'nestjs-i18n';
import { InjectChronikClient } from 'src/common/modules/chronik/chronik.decorators';
import { NOTIFICATION_TYPES } from 'src/common/modules/notifications/notification.constants';
import { NotificationService } from 'src/common/modules/notifications/notification.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { parseBurnOutput } from 'src/utils/opReturnBurn';
import { VError } from 'verror';

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
  async burn(@Body() command: BurnCommand): Promise<Burn> {
    try {
      const txData: any = await this.XPI.RawTransactions.decodeRawTransaction(command.txHex);
      if (!txData) {
        throw new Error('Tx Data fail');
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
        const broadcastResponse = await this.chronik.broadcastTx(command.txHex).catch(async err => {
          const updatingWalletFund = await this.i18n.t('burn.messages.updatingWalletFund');
          throw new VError(updatingWalletFund);
        });
        const { txid } = broadcastResponse;
        const prevTxIdExist = await this.prisma.burn.findFirst({
          where: {
            txid: txid
          }
        });

        if (prevTxIdExist) {
          const burningCanceled = this.i18n.t('burn.messages.burningCanceled');
          throw new VError(burningCanceled);
        }
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
      const legacyAddress = this.XPI.Address.hash160ToLegacy(command.burnedBy);
      const accountAddress = this.XPI.Address.toXAddress(legacyAddress);
      const sender = await this.prisma.account.findFirst({
        where: {
          address: accountAddress
        }
      });
      if (!sender) {
        const accountNotExistMessage = await this.i18n.t('account.messages.accountNotExist');
        throw new VError(accountNotExistMessage);
      }

      //Need to remove BurnForType.Worship becasue we dont have notification YET on lotus-temple
      //TODO: Remove line below to handle BurnForType.Worship notification
      if (command.burnForType !== BurnForType.Token && command.burnForType !== BurnForType.Worship) {
        // prepare data recipient
        let commentAccountId;
        let commentPostId;
        let commentAccount;
        if (command.burnForType == BurnForType.Comment) {
          const comment = await this.prisma.comment.findFirst({
            where: { id: command.burnForId }
          });

          commentAccountId = comment?.commentAccountId;
          commentPostId = comment?.commentToId;
          commentAccount = await this.prisma.account.findFirst({
            where: {
              id: _.toSafeInteger(commentAccountId)
            }
          });
        }

        const postId = command.burnForType == BurnForType.Comment ? commentPostId : command.burnForId;
        const post = await this.prisma.post.findFirst({
          where: { id: postId },
          include: {
            postAccount: true,
            page: true
          }
        });

        if (!post) {
          const accountNotExistMessage = await this.i18n.t('post.messages.postNotExist');
          throw new VError(accountNotExistMessage);
        }

        const recipientPostAccount = await this.prisma.account.findFirst({
          where: {
            id: _.toSafeInteger(post?.postAccountId)
          }
        });

        if (!recipientPostAccount) {
          const accountNotExistMessage = await this.i18n.t('account.messages.accountNotExist');
          throw new VError(accountNotExistMessage);
        }

        // get burnForType key
        const typeValuesArr = Object.values(BurnForType);
        const burnForTypeString =
          Object.keys(BurnForType)[typeValuesArr.indexOf(command.burnForType as unknown as BurnForType)];

        // BurnValue + tip + fee
        let tip = Number(command.burnValue) * 0.04;
        let fee = Number(command.burnValue) * 0.04;

        // create Notifications Burn
        const calcTip = await this.notificationService.calcTip(post, recipientPostAccount, command);
        const createNotifBurnAndTip = {
          senderId: sender.id,
          recipientId:
            command.burnForType == BurnForType.Comment ? commentAccount?.id : (post?.postAccountId as number),
          notificationTypeId: calcTip != 0 ? NOTIFICATION_TYPES.RECEIVE_BURN_TIP : NOTIFICATION_TYPES.BURN,
          level: NotificationLevel.INFO,
          url:
            command.burnForType == BurnForType.Comment
              ? `/post/${post.id}?comment=${command.burnForId}`
              : '/post/' + post?.id,
          additionalData: {
            senderName: sender.name,
            senderAddress: sender.address,
            burnType: command.burnType == BurnType.Up ? 'upvoted' : 'downvoted',
            burnForType: burnForTypeString.toLowerCase(),
            xpiBurn: command.burnValue,
            xpiTip: calcTip
          }
        };
        const jobDataBurnAndTip = {
          room: recipientPostAccount.mnemonicHash,
          notification: createNotifBurnAndTip
        };
        createNotifBurnAndTip.senderId !== createNotifBurnAndTip.recipientId &&
          (await this.notificationService.saveAndDispatchNotification(
            jobDataBurnAndTip.room,
            jobDataBurnAndTip.notification
          ));
        // create Notifications Fee
        let recipientPageAccount;
        if (post?.pageId && post.page?.pageAccountId != recipientPostAccount.id) {
          const page = await this.prisma.page.findFirst({
            where: {
              id: post.pageId
            }
          });

          recipientPageAccount = await this.prisma.account.findFirst({
            where: {
              id: _.toSafeInteger(page?.pageAccountId)
            }
          });

          const createNotifBurnFee = {
            senderId: sender.id,
            recipientId: post?.pageId ? (post.page?.pageAccountId as number) : post?.postAccountId,
            notificationTypeId: NOTIFICATION_TYPES.RECEIVE_BURN_FEE,
            level: NotificationLevel.INFO,
            url: '/post/' + post?.id,
            additionalData: {
              senderName: sender.name,
              senderAddress: sender.address,
              pageName: post?.page?.name,
              burnType: command.burnType == BurnType.Up ? 'upvoted' : 'downvoted',
              BurnForType: burnForTypeString,
              xpiBurn: command.burnValue,
              xpiFee: fee
            }
          };

          const jobDataBurnFee = {
            room: post?.pageId ? (recipientPageAccount?.mnemonicHash as string) : recipientPostAccount?.mnemonicHash,
            notification: createNotifBurnFee
          };
          jobDataBurnFee.room !== recipientPageAccount?.mnemonicHash &&
            (await this.notificationService.saveAndDispatchNotification(
              jobDataBurnFee.room,
              jobDataBurnFee.notification
            ));
        }
      }

      const result: Burn = {
        ...savedBurn,
        burnType: savedBurn.burnType ? BurnType.Up : BurnType.Down,
        burnedBy: savedBurn.burnedBy.toString('hex')
      };

      return result;
    } catch (err: any) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableToUpdateLixi = err?.message || this.i18n.t('burn.messages.unableToBurn');
        const error = new VError.WError(err as Error, unableToUpdateLixi);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
