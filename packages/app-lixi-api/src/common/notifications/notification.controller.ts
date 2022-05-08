import { NotificationDto, AccountDto } from '@bcpros/lixi-models';
import { Controller, HttpException, HttpStatus, Param, Get, Headers, Delete, HttpCode, Body, Patch } from '@nestjs/common';
import * as _ from 'lodash';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { VError } from 'verror';

@Controller('notifications')
export class NotificationController {

  constructor(
    private prisma: PrismaService,
  ) { }

  @Get(':id')
  async getNotification(
    @Param('id') id: string,
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
        throw Error('No perimission to get the notification');
      }

      // Get the notification
      const notification = await this.prisma.notification.findUnique({
        where: {
          id: id
        }
      });

      // Check if the user have sufficient permission to get the notification
      if (notification?.recipientId !== account?.id) {
        throw Error('No perimission to get the notification');
      }

      return {
        ...notification
      } as NotificationDto;

    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const error = new VError.WError(err as Error, 'Unable to get the notification.');
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteNotification(
    @Param('id') id: string,
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
        throw Error('No perimission to get the notification');
      }

      // Get the notification
      const notification = await this.prisma.notification.findUnique({
        where: {
          id: id
        }
      });

      // Check if the user have sufficient permission to get the notification
      if (notification?.recipientId !== account?.id) {
        throw Error('No perimission to get the notification');
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
        const error = new VError.WError(err as Error, 'Unable to get the notification.');
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Patch(':id')
  @HttpCode(200)
  async seenNotification(
    @Param('id') id: string,
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
        throw Error('No perimission to get the notification');
      }

      // Get the notification
      const notification = await this.prisma.notification.findUnique({
        where: {
          id: id
        }
      });

      // Check if the user have sufficient permission to get the notification
      if (notification?.recipientId !== account?.id) {
        throw Error('No perimission to get the notification');
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
        const error = new VError.WError(err as Error, 'Unable to get the notification.');
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}