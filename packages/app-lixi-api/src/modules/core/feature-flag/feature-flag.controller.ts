import { FeatureFlag } from '@bcpros/lixi-prisma';
import { Controller, Get, HttpException, HttpStatus, Logger, Param } from '@nestjs/common';
import _ from 'lodash';
import { I18n, I18nContext } from 'nestjs-i18n';
import { VError } from 'verror';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('features')
export class FeatureFlagController {
  private logger: Logger = new Logger(FeatureFlagController.name);

  constructor(private prisma: PrismaService) {}

  @Get(':name')
  async getFeature(@Param('name') name: string, @I18n() i18n: I18nContext): Promise<FeatureFlag | null> {
    try {
      const feature = await this.prisma.featureFlag.findUnique({
        where: {
          name: name
        }
      });

      return feature;
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableToFindFeature = i18n.t('feature.messages.couldNotFindFeature');
        const error = new VError.WError(err as Error, unableToFindFeature);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Get('/')
  async getFeatures(@I18n() i18n: I18nContext): Promise<FeatureFlag[] | null> {
    try {
      const features = await this.prisma.featureFlag.findMany({});

      return features;
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableToFindFeature = i18n.t('feature.messages.couldNotFindFeature');
        const error = new VError.WError(err as Error, unableToFindFeature);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
