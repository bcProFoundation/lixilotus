import { Controller, Get, HttpException, HttpStatus, Param } from '@nestjs/common';
import * as _ from 'lodash';
import { PrismaService } from '../../prisma/prisma.service';
import Redis from 'ioredis';

@Controller('healthcheck')
export class HeathController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check(): Promise<any> {
    const defaultHost = process.env.REDIS_HOST || 'localhost';
    const defaultPort = parseInt(process.env.REDIS_PORT!) || 6379;
    const version = process.env.npm_package_version;

    const existedRedeems = await this.prisma.$queryRaw`SELECT 1`;
    if (!existedRedeems) {
      throw new HttpException('Database is shuting down', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    //check connection to redis
    const redis = new Redis({
      port: defaultPort,
      host: defaultHost,
      family: 4,
      password: '',
      db: 0
    });

    const redisPing = await redis.ping();
    if (redisPing !== 'PONG') {
      throw new HttpException('Redis is shuting down', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return {
      status: true,
      version: version
    };
  }
}
