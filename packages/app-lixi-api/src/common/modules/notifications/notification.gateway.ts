import { AnalyticEvent, NotificationDto as Notification, SessionAction, SocketUser } from '@bcpros/lixi-models';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import Redis from 'ioredis';

import { Account, PageMessageSessionStatus } from '@bcpros/lixi-prisma';
import { InjectQueue } from '@nestjs/bullmq';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse
} from '@nestjs/websockets';
import { Queue } from 'bullmq';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { WsAuthGuardByPass } from '../../../modules/auth/guards/wsauth.guard';
import { EVENTS_ANALYTIC_QUEUE } from '../../../modules/events-analytic/events-analytic.constants';

// https://build.diligent.com/message-queues-in-database-transactions-f830718f4f12
// https://cloudificationzone.com/2021/08/13/notification-system-design/
// https://towardsdatascience.com/designing-notification-system-with-message-queues-c30a2c9046de

@Injectable()
@WebSocketGateway({ namespace: 'ws/notifications', cors: true })
export class NotificationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private logger: Logger = new Logger('NotificationGateway');

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly prisma: PrismaService,
    @InjectQueue(EVENTS_ANALYTIC_QUEUE) private readonly eventsAnalyticQueue: Queue
  ) {}

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Get the current user associated to the client id
    const address = await this.redis.hget(`client:${client.id}`, 'address');
    const deviceId = await this.redis.hget(`client:${client.id}`, 'deviceId');
    if (address && deviceId) {
      await this.redis.srem(`online:user:${address}`, deviceId);
      await this.redis.scard(`online:user:${address}`, async (error, count) => {
        if (error) {
          this.logger.error('Redis error:', error);
          return;
        }
        if (count === 0) {
          await this.redis.del(`online:user:${address}`);
        }
      });
    }

    await this.redis.del(`client:${client.id}`);
  }

  afterInit(server: Server) {
    this.logger.log('Notification gateway initialized');
  }

  @SubscribeMessage('user_online')
  async handleUserOnline(@MessageBody() user: SocketUser, @ConnectedSocket() client: Socket) {
    const { address, deviceId } = user;
    const deviceRoomName = `device:${deviceId}`;
    client.join(deviceRoomName);
    this.redis.sadd(`online:user:${address}`, deviceId);
    this.redis.expire(`online:user:${address}`, 604800);

    this.redis.hset(`client:${client.id}`, 'address', address);
    this.redis.hset(`client:${client.id}`, 'deviceId', deviceId);
    this.redis.expire(`client:${client.id}`, 86400);

    // We need to store the map between the client id (which is unique)
    // and when the user is disconnected, we need to remove the mapping
    // also remove the associated record in Redis set
    return {
      event: 'user_online',
      data: client.id
    };
  }

  @SubscribeMessage('user_offline')
  async handleUserOffline(@MessageBody() user: SocketUser, @ConnectedSocket() socket: Socket) {
    const { address, deviceId } = user;
    const deviceRoomName = `device:${deviceId}`;
    socket.leave(deviceRoomName);
    await this.redis.srem(`online:user:${address}`, deviceId);
    await this.redis.scard(`online:user:${address}`, (error, count) => {
      if (error) {
        this.logger.error('Redis error:', error);
        return;
      }
      if (count === 0) {
        this.redis.del(`online:user:${address}`);
      }
    });
    return true;
  }

  @SubscribeMessage('subscribePageMessageSession')
  handleSubscriptionToMessageSession(
    @MessageBody() pageMessageSessionId: string,
    @ConnectedSocket() client: Socket
  ): WsResponse<string> {
    //Check if already join a room
    const joinedRoom = Array.from(client.rooms).find(room => {
      return room === pageMessageSessionId;
    });

    if (!joinedRoom) {
      client.join(pageMessageSessionId);
      this.logger.log(
        '🚀 ~ file: message.gateway.ts:47 ~ MessageGateway ~ pageMessageSessionId:',
        pageMessageSessionId
      );

      return {
        event: 'subscribePageMessageSession',
        data: client.id
      };
    } else {
      return {
        event: '',
        data: client.id
      };
    }
  }

  @SubscribeMessage('subscribeMultiPageMessageSession')
  async handleSubscriptionToMultiPageMessageSession(
    @MessageBody() accountId: number,
    @ConnectedSocket() client: Socket
  ): Promise<WsResponse<string>> {
    const pageMessageSessionIds = await this.prisma.pageMessageSession.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                page: {
                  pageAccountId: accountId
                }
              },
              {
                accountId: accountId
              }
            ]
          },
          {
            OR: [
              {
                status: PageMessageSessionStatus.OPEN
              },
              {
                status: PageMessageSessionStatus.PENDING
              }
            ]
          }
        ]
      }
    });

    if (pageMessageSessionIds.length > 0) {
      client.join(pageMessageSessionIds.map(pageMessageSession => pageMessageSession.id));

      return {
        event: 'subscribeMultiPageMessageSession',
        data: client.id
      };
    } else {
      return {
        event: '',
        data: client.id
      };
    }
  }

  //Code below is for page owner listening for new PageMessageSession
  @SubscribeMessage('subscribePageChannel')
  handlePageMessageSessionSubscription(
    @MessageBody() pageChannelId: string,
    @ConnectedSocket() client: Socket
  ): WsResponse<string> {
    //Check if already join a room
    const joinedRoom = Array.from(client.rooms).find(room => {
      return room === pageChannelId;
    });

    if (!joinedRoom) {
      client.join(pageChannelId);
      this.logger.log('🚀 ~ file: message.gateway.ts:47 ~ MessageGateway ~ pageChannelId:', pageChannelId);

      return {
        event: 'pageChannelId',
        data: client.id
      };
    } else {
      return {
        event: '',
        data: client.id
      };
    }
  }

  @SubscribeMessage('subscribeAddressChannel')
  handleAddressChannelSubscription(
    @MessageBody() userAddress: string,
    @ConnectedSocket() client: Socket
  ): WsResponse<string> {
    //Check if already join a room
    const joinedRoom = Array.from(client.rooms).find(room => {
      return room === userAddress;
    });

    if (!joinedRoom) {
      client.join(userAddress);

      return {
        event: 'userAddress',
        data: client.id
      };
    } else {
      return {
        event: '',
        data: client.id
      };
    }
  }

  sendNotification(room: string, notification: Notification) {
    this.server.to(room).emit('notification', notification);
  }

  sendNewPostEvent(room: string, data: any) {
    this.server.to(room).emit('newpost', data);
  }

  publishMessage(pageMessageSessionId: string, message: any) {
    this.server.to(pageMessageSessionId).emit('publishMessage', message);
  }

  publishPageChannel(pageChannelId: string, message: any) {
    this.server.to(pageChannelId).emit('publishPageChannel', message);
  }

  publishAddressChannel(address: string, message: any) {
    this.server.to(address).emit('publishAddressChannel', message);
  }

  publishSessionAction(pageMessageSessionId: string, message: SessionAction) {
    this.server.to(pageMessageSessionId).emit('sessionAction', message);
  }

  /// Analytic events
  @UseGuards(WsAuthGuardByPass)
  @SubscribeMessage('analyticEvents')
  handleAnalyticEvents(@MessageBody() events: AnalyticEvent[], @ConnectedSocket() client: Socket) {
    const account: Account = client.data.account;
    const payload = account
      ? {
          events,
          accountId: account.id
        }
      : {
          events
        };

    this.eventsAnalyticQueue.add(EVENTS_ANALYTIC_QUEUE, payload);
    return {
      event: 'analyticEvents',
      data: client.id
    };
  }
}
