import { Controller, Get, HttpException, HttpStatus, Param } from '@nestjs/common';
import * as _ from 'lodash';
import { Envelope } from '@bcpros/lixi-models';
import { VError } from 'verror';
import { PrismaService } from '../services/prisma/prisma.service';

@Controller('envelopes')
export class EnvelopeController {

  constructor(private prisma: PrismaService) {
  }

  @Get(':id')
  async getEnvelope(@Param('id') id: string): Promise<Envelope> {
    try {
      const envelope = await this.prisma.envelope.findUnique({
        where: {
          id: _.toSafeInteger(id)
        }
      });
      if (!envelope)
        throw new VError('The envelope does not exist in the database.');

      const result = {
        ...envelope,
      } as Envelope;
      return result;
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const error = new VError.WError(err as Error, 'Unable to get the envelope.');
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Get()
  async getAll(): Promise<Envelope[]> {
    try {
      const envelopes = await this.prisma.envelope.findMany();
      const result = envelopes as Envelope[];
      return result;
    } catch (err: unknown) {
      throw new HttpException('Unable to get the envelopes.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
