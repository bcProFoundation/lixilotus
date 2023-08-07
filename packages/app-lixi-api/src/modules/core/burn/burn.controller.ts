import { TRANSLATION_REQUIRE_AMOUNT } from '@bcpros/lixi-models';
import { Burn, BurnCommand, BurnForType, BurnType } from '@bcpros/lixi-models';
import { NotificationLevel, Token } from '@bcpros/lixi-prisma';
import BCHJS from '@bcpros/xpi-js';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Body, Controller, HttpException, HttpStatus, Inject, Logger, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import axios from 'axios';
import { ChronikClient } from 'chronik-client';
import { Redis } from 'ioredis';
import _ from 'lodash';
import { I18n, I18nService } from 'nestjs-i18n';
import { InjectChronikClient } from 'src/common/modules/chronik/chronik.decorators';
import { NOTIFICATION_TYPES } from 'src/common/modules/notifications/notification.constants';
import { NotificationService } from 'src/common/modules/notifications/notification.service';
import SortedItemRepository from 'src/common/redis/sorted-repository';
import { POSTS } from 'src/modules/page/constants/meili.constants';
import { MeiliService } from 'src/modules/page/meili.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { parseBurnOutput } from 'src/utils/opReturnBurn';
import { stripHtml } from 'string-strip-html';
import { VError } from 'verror';
import { TranslateProvider } from '../translate/translate.constant';
import { TranslateService } from '../translate/translate.service';

@SkipThrottle()
@Controller('burn')
export class BurnController {
  private logger: Logger = new Logger(BurnController.name);
  constructor(
    private prisma: PrismaService,
    private readonly notificationService: NotificationService,
    @InjectRedis() private readonly redis: Redis,
    @I18n() private i18n: I18nService,
    @InjectChronikClient('xpi') private chronik: ChronikClient,
    @Inject('xpijs') private XPI: BCHJS,
    private translateService: TranslateService
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
          command.burnForId !== tokenCheck?.tokenId ||
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
            },
            include: {
              page: true
            }
          });

          const postHashtags = await this.prisma.postHashtag.findMany({
            where: {
              postId: post!.id
            },
            include: {
              hashtag: true
            }
          });

          let danaBurnUp = post?.danaBurnUp ?? 0;
          let danaBurnDown = post?.danaBurnDown ?? 0;
          const xpiValue = value;

          if (command.burnType == BurnType.Up) {
            danaBurnUp = danaBurnUp + xpiValue;
          } else {
            danaBurnDown = danaBurnDown + xpiValue;
          }
          const danaBurnScore = danaBurnUp - danaBurnDown;

          await this.prisma.post.update({
            where: {
              id: command.burnForId
            },
            data: {
              danaBurnDown,
              danaBurnUp,
              danaBurnScore
            }
          });

          //Translate if danaBurnScore >= TRANSLATION_REQUIRE_AMOUNT and hasnt been translate before
          //For now, the code below only support 2 langs (vi - en), need to rework code if support more than 2 langs
          if (danaBurnScore >= TRANSLATION_REQUIRE_AMOUNT && post?.originalLanguage === null) {
            await this.translateService.translatePostAndSave(TranslateProvider.AZURE, post?.content, post.id);
          }

          if (post && post.page) {
            await this.prisma.$transaction(async prisma => {
              let totalPostsBurnUp = post?.page?.totalPostsBurnUp ?? 0;
              let totalPostsBurnDown = post?.page?.totalPostsBurnDown ?? 0;

              if (command.burnType == BurnType.Up) {
                totalPostsBurnUp = totalPostsBurnUp + xpiValue;
              } else {
                totalPostsBurnDown = totalPostsBurnDown + xpiValue;
              }
              const totalPostsBurnScore = totalPostsBurnUp - totalPostsBurnDown;

              await prisma.page.update({
                where: {
                  id: post.pageId as string
                },
                data: {
                  totalPostsBurnUp,
                  totalPostsBurnDown,
                  totalPostsBurnScore
                }
              });
            });
          }

          if (postHashtags.length > 0) {
            const hashtagBurnValue = xpiValue / postHashtags.length;
            await this.prisma.$transaction(
              postHashtags.map(postHashtag => {
                let hashtagDanaBurnUp = postHashtag.hashtag.danaBurnUp ?? 0;
                let hashtagDanaBurnDown = postHashtag.hashtag.danaBurnDown ?? 0;

                if (command.burnType == BurnType.Up) {
                  hashtagDanaBurnUp = hashtagDanaBurnUp + hashtagBurnValue;
                } else {
                  hashtagDanaBurnDown = hashtagDanaBurnDown + hashtagBurnValue;
                }
                const hashTagDanaBurnScore = hashtagDanaBurnUp - hashtagDanaBurnDown;
                return this.prisma.hashtag.update({
                  where: {
                    id: postHashtag?.hashtag.id
                  },
                  data: {
                    danaBurnUp: hashtagDanaBurnUp,
                    danaBurnDown: hashtagDanaBurnDown,
                    danaBurnScore: hashTagDanaBurnScore
                  }
                });
              })
            );
          }
        } else if (command.burnForType === BurnForType.Token) {
          const token = await this.prisma.token.findFirst({
            where: {
              tokenId: command.burnForId
            }
          });

          let danaBurnUp = token?.danaBurnUp ?? 0;
          let danaBurnDown = token?.danaBurnDown ?? 0;
          const xpiValue = value;

          if (command.burnType == BurnType.Up) {
            danaBurnUp = danaBurnUp + xpiValue;
          } else {
            danaBurnDown = danaBurnDown + xpiValue;
          }
          const danaBurnScore = danaBurnUp - danaBurnDown;

          const updatedToken = await this.prisma.token.update({
            where: {
              tokenId: command.burnForId
            },
            data: {
              danaBurnDown,
              danaBurnUp,
              danaBurnScore
            }
          });

          // Update the cache for the token:
          const keyPrefix = `tokens:list`;
          const hashPrefix = `tokens:items-data`;
          const tokenRepository = new SortedItemRepository<Token>(keyPrefix, hashPrefix, this.redis);
          await tokenRepository.set(updatedToken, danaBurnScore);
        } else if (command.burnForType === BurnForType.Comment) {
          const comment = await this.prisma.comment.findFirst({
            where: {
              id: command.burnForId
            }
          });

          let danaBurnUp = comment?.danaBurnUp ?? 0;
          let danaBurnDown = comment?.danaBurnDown ?? 0;
          const xpiValue = value;

          if (command.burnType == BurnType.Up) {
            danaBurnUp = danaBurnUp + xpiValue;
          } else {
            danaBurnDown = danaBurnDown + xpiValue;
          }
          const danaBurnScore = danaBurnUp - danaBurnDown;

          await this.prisma.comment.update({
            where: {
              id: command.burnForId
            },
            data: {
              danaBurnDown,
              danaBurnUp,
              danaBurnScore
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
        },
        include: {
          avatar: {
            include: {
              upload: true
            }
          }
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
            page: {
              include: {
                pageAccount: true
              }
            }
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
        let fee = Number(command.burnValue) * 0.04;

        // create Notifications Burn
        let url;
        if (sender.avatar) {
          const { upload } = sender.avatar;
          const cfUrl = `${process.env.CF_IMAGES_DELIVERY_URL}/${process.env.CF_ACCOUNT_HASH}/${upload.cfImageId}/public`;
          url = upload.cfImageId ? cfUrl : upload.url;
        }

        const createNotifBurnAndTip = {
          senderId: sender.id,
          recipientId: post.page ? post.page.pageAccountId : (post?.postAccountId as number),
          notificationTypeId: post.page
            ? NOTIFICATION_TYPES.RECEIVE_BURN_PAGE
            : command.burnForType == BurnForType.Comment
            ? NOTIFICATION_TYPES.RECEIVE_BURN_COMMENT_ACCOUNT
            : NOTIFICATION_TYPES.RECEIVE_BURN_ACCOUNT,
          level: NotificationLevel.INFO,
          url:
            command.burnForType == BurnForType.Comment
              ? `/post/${post.id}?comment=${command.burnForId}`
              : '/post/' + post?.id,
          additionalData: {
            senderName: sender.name,
            senderAddress: sender.address,
            senderAvatar: url,
            pageName: post.page && post.page.name,
            burnType: command.burnType == BurnType.Up ? 'upvoted' : 'downvoted',
            burnForType: burnForTypeString.toLowerCase(),
            xpiBurn: command.burnValue,
            xpiFee: fee
          }
        };

        createNotifBurnAndTip.senderId !== createNotifBurnAndTip.recipientId &&
          (await this.notificationService.saveAndDispatchNotification(createNotifBurnAndTip));
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
