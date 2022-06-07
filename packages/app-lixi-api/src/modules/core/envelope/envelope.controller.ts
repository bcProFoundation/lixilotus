import { Controller, Get, HttpException, HttpStatus, Param } from '@nestjs/common';
import * as _ from 'lodash';
import { Envelope } from '@bcpros/lixi-models';
import { VError } from 'verror';
import { PrismaService } from '../../prisma/prisma.service';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('envelopes')
export class EnvelopeController {
  constructor(private prisma: PrismaService) { }

  @Get(':id')
  async getEnvelope(@Param('id') id: string, @I18n() i18n: I18nContext): Promise<Envelope> {
    try {
      const envelope = await this.prisma.envelope.findUnique({
        where: {
          id: _.toSafeInteger(id)
        }
      });
      if (!envelope) {
        const envelopeNotExist = await i18n.t('claim.messages.envelopeNotExist');
        throw new VError(envelopeNotExist);
      }

      const result = {
        ...envelope
      } as Envelope;
      return result;
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableGetEnvelope = await i18n.t('claim.messages.unableGetEnvelope');
        const error = new VError.WError(err as Error, unableGetEnvelope);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Get()
  async getAll(@I18n() i18n: I18nContext): Promise<Envelope[]> {
    try {
      const envelopes = await this.prisma.envelope.findMany();
      const result = envelopes as Envelope[];
      return result;
    } catch (err: unknown) {
      const unableGetEnvelope = await i18n.t('claim.messages.unableGetEnvelope');
      throw new HttpException(unableGetEnvelope, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
