import { BurnCommand } from '@bcpros/lixi-models';
import BCHJS from '@bcpros/xpi-js';
import { Controller, Inject, Logger, Post, Body } from '@nestjs/common';
import { ChronikClient } from 'chronik-client';
import { I18n, I18nContext, I18nService } from 'nestjs-i18n';
import { InjectChronikClient } from 'src/common/modules/chronik/chronik.decorators';
import { PrismaService } from 'src/modules/prisma/prisma.service';

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
    console.log(command);
    return command;
  }
}