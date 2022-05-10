import { NotificationDto, AccountDto } from '@bcpros/lixi-models';
import { Controller, HttpException, HttpStatus, Param, Get, Headers, Delete, HttpCode, Body, Patch } from '@nestjs/common';
import * as _ from 'lodash';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { VError } from 'verror';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('notifications')
export class NotificationController {

  constructor(
    private prisma: PrismaService,
  ) { }

  @Get(':id')
  async getNotification(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
    @Headers('mnemonic-hash') mnemonicHash?: string
  ): Promise<NotificationDto> {
    try {

      // Find the associated account
      const account = await this.prisma.account.findFirst({
        where: {
          mnemonicHash: mnemonicHash
        }
      });

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

      // Check if the user have sufficient permission to get the notification
      if (notification?.recipientId !== account?.id) {
        const noPermisson = await i18n.t('notification.messages.noPermisson');
        throw Error(noPermisson);
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
  async deleteNotification(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
    @Headers('mnemonic-hash') mnemonicHash?: string,
  ): Promise<NotificationDto> {
    try {

      // Find the associated account
      const account = await this.prisma.account.findFirst({
        where: {
          mnemonicHash: mnemonicHash
        }
      });

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

      // Check if the user have sufficient permission to get the notification
       if (notification?.recipientId !== account?.id) {
        const noDeletePermisson = await i18n.t('notification.messages.noPermisson');
        throw Error(noDeletePermisson);
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
  async readNotification(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
    @Headers('mnemonic-hash') mnemonicHash?: string,
  ): Promise<NotificationDto> {
    try {

      // Find the associated account
      const account = await this.prisma.account.findFirst({
        where: {
          mnemonicHash: mnemonicHash
        }
      });

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

      // Check if the user have sufficient permission to get the notification
     if (notification?.recipientId !== account?.id) {
        const noPermisson = await i18n.t('notification.messages.noPermisson');
        throw Error(noPermisson);
      }

      // Set readAt to now
      const resultNotification = await this.prisma.notification.update({
        where: {
          id: id
        },
        data: {
          readAt: new Date(),
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