import { NotificationDto as Notification } from '@bcpros/lixi-models';
import { Injectable, Logger } from '@nestjs/common';
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
  constructor() {}

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  afterInit(server: Server) {
    this.logger.log('Notification gateway initialized');
  }

  @SubscribeMessage('subscribe')
  handleSubscription(@MessageBody() mnemonicHash: string, @ConnectedSocket() client: Socket): WsResponse<string> {
    client.join(mnemonicHash);

    return {
      event: 'subscribe',
      data: client.id
    };
  }

  sendNotification(room: string, notification: Notification) {
    this.server.to(room).emit('notification', notification);
  }
}
