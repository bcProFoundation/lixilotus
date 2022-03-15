import { Controller, Get, HttpException, HttpStatus, Param } from '@nestjs/common';
import * as _ from 'lodash';
import { PrismaService } from '../services/prisma/prisma.service';

@Controller('healthcheck')
export class HeathController {

  constructor(private prisma: PrismaService) {
  }

  @Get()
  async check(): Promise<any> {
    const existedRedeems = await this.prisma.$queryRaw`SELECT 1`;
    if (!existedRedeems) {
      throw new HttpException('Database is shuting down', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return { status: true };
  }
}
