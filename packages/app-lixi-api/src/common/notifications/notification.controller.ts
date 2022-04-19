import { NotificationDto } from '@bcpros/lixi-models';
import { Controller, HttpException, HttpStatus, Param, Get } from '@nestjs/common';
import * as _ from 'lodash';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { VError } from 'verror';

@Controller('notifications')
export class NotificationController {

  constructor(
    private prisma: PrismaService,
  ) { }

  @Get(':id')
  async getNotification(@Param('id') id: string): Promise<NotificationDto> {
    try {
      const notification = await this.prisma.notification.findUnique({
        where: {
          id: id
        },
        include: {
          notificationType: true
        }
      });

      return {
        id: notification?.id,
        ...notification,
        notificationType: ...notification?.notificationType,
      };
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