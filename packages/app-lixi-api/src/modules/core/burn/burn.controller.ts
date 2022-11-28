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

      const testScript = generateBurnOpReturnScript(
        0x01, true, BurnForType.Post, '22d04d2588f8270de54b1edbd19768756734602b', 'claz8iluk0068pwtwx8bn1bhl'
      );
      return parseResult;
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