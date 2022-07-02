import { Controller, Get, HttpException, HttpStatus, Logger, Param } from '@nestjs/common';
import { I18n, I18nContext } from 'nestjs-i18n';
import { VError } from 'verror';
import { CompanyCommentDTO, CompanyDTO } from '../../../../lixi-models/src/lib/company';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyComment as CompanyCommentDb, Company as CompanyDb } from '@prisma/client';
import _ from 'lodash';

@Controller('company')
export class CompanyController {
  private logger: Logger = new Logger('CompanyController');

  constructor(private prisma: PrismaService) {}

  @Get()
  async getAll(
    @Param('pageSize') pageSize: number,
    @Param('pageNumber') pageNumber: number,
    @I18n() i18n: I18nContext
  ): Promise<CompanyDTO[]> {
    try {
      pageNumber = pageNumber && pageNumber > 0 ? pageNumber : 1;
      pageSize = pageSize && pageSize > 0 ? pageSize : 10;

      let companies: CompanyDb[] = [];

      companies = await this.prisma.company.findMany({
        skip: pageNumber - 1,
        take: pageSize
      });

      const results = companies.map(item => {
        return {
          ...item
        } as unknown as CompanyDTO;
      });

      return results;
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableGetCompanyMessage = await i18n.t('company.messages.unableGetCompanyFromServer');
        const error = new VError.WError(err as Error, unableGetCompanyMessage);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Get(':id')
  async getCompanyComments(
    @Param('id') id: string,
    @Param('pageSize') pageSize: number,
    @Param('pageNumber') pageNumber: number,
    @I18n() i18n: I18nContext
  ): Promise<CompanyCommentDTO[]> {
    try {
      const companyId = _.toSafeInteger(id);
      pageNumber = pageNumber && pageNumber > 0 ? pageNumber : 1;
      pageSize = pageSize && pageSize > 0 ? pageSize : 10;

      let companyComments: CompanyCommentDb[] = [];

      companyComments = await this.prisma.companyComment.findMany({
        where: {
          companyId: { equals: companyId }
        },
        skip: pageNumber - 1,
        take: pageSize
      });

      const results = companyComments.map(item => {
        return {
          ...item
        } as unknown as CompanyCommentDTO;
      });

      return results;
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableGetCompanyMessage = await i18n.t('company.messages.unableGetCompanyFromServer');
        const error = new VError.WError(err as Error, unableGetCompanyMessage);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
