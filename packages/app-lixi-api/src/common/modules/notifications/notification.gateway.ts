import { NotificationDto as Notification, SocketUser } from '@bcpros/lixi-models';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import * as _ from 'lodash';

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
import io, { Server, Socket } from 'socket.io';

// https://build.diligent.com/message-queues-in-database-transactions-f830718f4f12
// https://cloudificationzone.com/2021/08/13/notification-system-design/
// https://towardsdatascience.com/designing-notification-system-with-message-queues-c30a2c9046de

@Injectable()
@WebSocketGateway({ namespace: 'ws/notifications', cors: true })
export class NotificationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private logger: Logger = new Logger('NotificationGateway');

  constructor(@InjectRedis() private readonly redis: Redis) { }

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

  sendNotification(room: string, notification: Notification) {
    this.server.to(room).emit('notification', notification);
  }
}
