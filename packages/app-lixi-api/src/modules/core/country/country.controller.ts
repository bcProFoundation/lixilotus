import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, Headers, HttpException, HttpStatus, Param, Query, UseInterceptors } from '@nestjs/common';
import geoip from 'geoip-country';
import * as _ from 'lodash';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ReqSocket } from 'src/decorators/req.socket.decorator';
import { VError } from 'verror';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('countries')
export class CountryController {
  constructor(private prisma: PrismaService) {}

  @CacheTTL(600000)
  @Get()
  async getCountries(@I18n() i18n: I18nContext): Promise<any> {
    try {
      const countries = await this.prisma.country.findMany();
      const result = countries;
      return result;
    } catch (err: unknown) {
      const unableGetEnvelope = await i18n.t('country.messages.unableToGetCountries');
      throw new HttpException(unableGetEnvelope, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(600000)
  @Get(':id/states')
  async getStates(@Param('id') id: number | string, @I18n() i18n: I18nContext): Promise<any> {
    try {
      const states = await this.prisma.state.findMany({
        where: {
          countryId: _.toSafeInteger(id)
        }
      });

      const resultApi = states;
      return resultApi;
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableToGetLixi = await i18n.t('country.messages.unableToGetState');
        const error = new VError.WError(err as Error, unableToGetLixi);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(600000)
  @Get(':id/cities')
  async getCities(
    @Query('countryId') countryId: number,
    @Query('stateId') stateId: number,
    @I18n() i18n: I18nContext
  ): Promise<any> {
    try {
      const cities = await this.prisma.city.findMany({
        where: {
          AND: [
            {
              countryId: _.toSafeInteger(countryId)
            },
            {
              stateId: _.toSafeInteger(stateId)
            }
          ]
        }
      });

      const resultApi = cities;
      return resultApi;
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableToGetLixi = await i18n.t('country.messages.unableToGetState');
        const error = new VError.WError(err as Error, unableToGetLixi);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Get('ipaddr')
  async getCountryFromIpAddress(@Headers('x-forwarded-for') headerIp: string, @ReqSocket() socket: any): Promise<any> {
    try {
      const ip = (headerIp || socket.remoteAddress) as string;
      const geolocation = geoip.lookup(ip);
      if (geolocation) {
        return geolocation?.country;
      }
      throw Error('Unable to detect ip address');
    } catch (err) {
      throw err;
    }
  }
}
