import { NotificationDto as Notification } from '@bcpros/lixi-models';
import { WorshipedPerson } from '@bcpros/lixi-prisma';
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
@WebSocketGateway({ namespace: 'ws/worship', cors: true })
export class WorshipGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private logger: Logger = new Logger('WorshipGateway');
  constructor() {}

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  afterInit(server: Server) {
    this.logger.log('Worship gateway initialized');
  }

  @SubscribeMessage('subscribe')
  handleSubscription(@MessageBody() mnemonicHash: string, @ConnectedSocket() client: Socket): WsResponse<string> {
    client.join('public');

    return {
      event: 'subscribe',
      data: client.id
    };
  }

  publishWorship(worshipedPerson: any) {
    this.server.to('public').emit('publishWorship', worshipedPerson);
  }
}
