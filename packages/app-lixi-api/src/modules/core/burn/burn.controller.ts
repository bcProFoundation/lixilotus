import { BurnCommand, BurnForType } from '@bcpros/lixi-models';
import BCHJS from '@bcpros/xpi-js';
import { Controller, Inject, Logger, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ChronikClient, Tx } from 'chronik-client';
import { I18n, I18nContext, I18nService } from 'nestjs-i18n';
import { InjectChronikClient } from 'src/common/modules/chronik/chronik.decorators';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { generateBurnOpReturnScript, parseBurnOutput } from 'src/utils/opReturnBurn';
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
  ) {
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
          burnForId: parseResult.burnForId
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

          await this.prisma.post.update({
            where: {
              id: command.burnForId
            },
            data {

          }
          })
      }
    }

      return parseResult;
  } catch(err) {
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