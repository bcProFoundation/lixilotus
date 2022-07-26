import { Controller, Get, HttpException, HttpStatus, Param } from '@nestjs/common';
import * as _ from 'lodash';
import { Country, State } from '@bcpros/lixi-models';
import { VError } from 'verror';
import { PrismaService } from '../../prisma/prisma.service';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('countries')
export class CountryController {
  constructor(private prisma: PrismaService) { }

  @Get
    ()
  async getCountries(@I18n() i18n: I18nContext): Promise<Country[]> {
    try {
      const countries = await this.prisma.country.findMany();
      const result = countries as Country[];
      return result;
    } catch (err: unknown) {
      const unableGetEnvelope = await i18n.t('claim.messages.unableGetEnvelope');
      throw new HttpException(unableGetEnvelope, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/states')
  async getStates(
    @Param('id') id: number | string,
    @I18n() i18n: I18nContext
  ): Promise<State[]> {
    try {
      const states = await this.prisma.state.findMany({
        where: {
          countryId: _.toSafeInteger(id)
        }
      });

      if (!states) {
        const lixiNotExist = await i18n.t('lixi.messages.lixiNotExist');
        throw new VError(lixiNotExist);
      }

      const resultApi = states as State[];
      return resultApi;
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableToGetLixi = await i18n.t('lixi.messages.unableToGetLixi');
        const error = new VError.WError(err as Error, unableToGetLixi);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
