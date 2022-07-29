import { NotificationDto } from '@bcpros/lixi-models';
import {
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Request,
  UseGuards
} from '@nestjs/common';
import { Account } from '@prisma/client';
import { FastifyRequest } from 'fastify';
import { I18n, I18nContext } from 'nestjs-i18n';
import { JwtAuthGuard } from 'src/modules/auth/jwtauth.guard';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { VError } from 'verror';

@Controller('notifications')
export class NotificationController {
  private logger: Logger = new Logger(NotificationController.name);

  constructor(private prisma: PrismaService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getNotification(
    @Param('id') id: string,
    @Request() req: FastifyRequest,
    @I18n() i18n: I18nContext
  ): Promise<NotificationDto> {
    try {
      // Find the associated account
      const account = (req as any).account;

      if (!account) {
        const accountNotExist = await i18n.t('account.messages.accountNotExist');
        throw Error(accountNotExist);
      }

      // Get the notification
      const notification = await this.prisma.notification.findUnique({
        where: {
          id: id
        }
      });

      this.logger.log(`Notification Recipient Id: ${notification?.recipientId}`);
      this.logger.log(`Account Id: ${account?.id}`);

      // Check if the user have sufficient permission to get the notification
      if (notification?.recipientId !== account?.id) {
        const noPermission = await i18n.t('notification.messages.noPermission');
        throw Error(noPermission);
      }

      return {
        ...notification
      } as NotificationDto;
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableGetNotification = await i18n.t('notification.messages.unableGetNotification');
        const error = new VError.WError(err as Error, unableGetNotification);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async deleteNotification(
    @Param('id') id: string,
    @Request() req: FastifyRequest,
    @I18n() i18n: I18nContext
  ): Promise<NotificationDto> {
    try {
      // Find the associated account
      const account = (req as any).account;

      if (!account) {
        const accountNotExist = await i18n.t('account.messages.accountNotExist');
        throw Error(accountNotExist);
      }

      // Get the notification
      const notification = await this.prisma.notification.findUnique({
        where: {
          id: id
        }
      });

      this.logger.log(`Notification Recipient Id: ${notification?.recipientId}`);
      this.logger.log(`Account Id: ${account?.id}`);

      // Check if the user have sufficient permission to get the notification
      if (notification?.recipientId !== account?.id) {
        const noDeletePermission = await i18n.t('notification.messages.noDeletePermission');
        throw Error(noDeletePermission);
      }

      // Delete the notification
      await this.prisma.notification.delete({
        where: {
          id: id
        }
      });

      return null as any;
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableGetNotification = await i18n.t('notification.messages.unableGetNotification');
        const error = new VError.WError(err as Error, unableGetNotification);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Patch(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async readNotification(
    @Param('id') id: string,
    @Request() req: FastifyRequest,
    @I18n() i18n: I18nContext
  ): Promise<NotificationDto> {
    try {
      // Find the associated account
      const account: Account = (req as any).account;

      if (!account) {
        const accountNotExist = await i18n.t('account.messages.accountNotExist');
        throw Error(accountNotExist);
      }

      // Get the notification
      const notification = await this.prisma.notification.findUnique({
        where: {
          id: id
        }
      });

      this.logger.log(`Notification Recipient Id: ${notification?.recipientId}`);
      this.logger.log(`Account Id: ${account?.id}`);

      // Check if the user have sufficient permission to get the notification
      if (notification?.recipientId !== account?.id) {
        const noReadPermission = await i18n.t('notification.messages.noReadPermission');
        throw Error(noReadPermission);
      }

      // Set readAt to now
      const resultNotification = await this.prisma.notification.update({
        where: {
          id: id
        },
        data: {
          readAt: new Date()
        }
      });

      return resultNotification;
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableGetNotification = await i18n.t('notification.messages.unableGetNotification');
        const error = new VError.WError(err as Error, unableGetNotification);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
