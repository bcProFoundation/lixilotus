import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/jwtauth.guard';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@ApiTags('email-templates')
@UseGuards(JwtAuthGuard)
@Controller('email-templates')
export class EmailTemplateController {
  private logger: Logger = new Logger(EmailTemplateController.name);

  constructor(private readonly prisma: PrismaService) {}
}
