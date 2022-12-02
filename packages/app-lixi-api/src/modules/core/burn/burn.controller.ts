import { Burn, BurnCommand, BurnForType, BurnType, fromSmallestDenomination } from '@bcpros/lixi-models';
import { Prisma } from '@bcpros/lixi-prisma';
import BCHJS from '@bcpros/xpi-js';
import { Body, Controller, HttpException, HttpStatus, Inject, Logger, Post } from '@nestjs/common';
import { ChronikClient } from 'chronik-client';
import { I18n, I18nService } from 'nestjs-i18n';
import { InjectChronikClient } from 'src/common/modules/chronik/chronik.decorators';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { parseBurnOutput } from 'src/utils/opReturnBurn';
import { VError } from 'verror';

@Controller('burn')
export class BurnController {
  private logger: Logger = new Logger(BurnController.name);
  constructor(
    private prisma: PrismaService,
    @I18n() private i18n: I18nService,
    @InjectChronikClient('xpi') private chronik: ChronikClient,
    @Inject('xpijs') private XPI: BCHJS
  ) {
  }

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

      // Compare parse result with the command
      if (
        command.burnForId !== parseResult.burnForId ||
        command.burnForType !== parseResult.burnForType ||
        command.burnType !== parseResult.burnType ||
        command.burnedBy !== parseResult.burnedBy
      ) {
        throw new Error('Unable to burn');
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
        }
        const createdBurn = prisma.burn.create({
          data: burnRecordToInsert
        })
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

          await this.prisma.post.update({
            where: {
              id: command.burnForId
            },
            data: {
              lotusBurnDown,
              lotusBurnUp
            }
          });
        }
      }

      const result: Burn = {
        ...savedBurn,
        burnType: savedBurn.burnType ? BurnType.Up : BurnType.Down,
        burnedBy: savedBurn.burnedBy.toString('hex'),
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