import { NotificationDto as Notification, SocketUserOnline } from '@bcpros/lixi-models';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis, DEFAULT_REDIS_NAMESPACE } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

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

  constructor(
    @InjectRedis() private readonly redis: Redis
  ) { }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  afterInit(server: Server) {
    this.logger.log('Notification gateway initialized');
  }

  @SubscribeMessage('user_online')
  handleUserOnline(@MessageBody() users: SocketUserOnline[], @ConnectedSocket() client: Socket): WsResponse<string> {

    return {
      event: 'subscribe',
      data: client.id
    };
  }

  sendNotification(room: string, notification: Notification) {
    this.server.to(room).emit('notification', notification);
  }
}
