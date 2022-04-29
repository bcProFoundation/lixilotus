
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Cluster } from "ioredis";
import * as io from 'socket.io';

export class RedisIoAdapter extends IoAdapter {

  protected ioServer: io.Server;

  constructor(app: NestFastifyApplication) {
    super();
    let httpServer = app.getHttpServer();
    this.ioServer = new io.Server(httpServer);
  }

  createIOServer(port: number, options?: io.ServerOptions): any {
    let server;
    //same port with main application
    if (port == 0 || port == parseInt(process.env.PORT || '4800'))
      server = this.ioServer;
    //different port with main application
    else
      server = super.createIOServer(port, options);

    const pub = new Cluster([{
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379')
    }]);
    const sub = pub.duplicate();

    const redisAdapter = createAdapter(pub, sub);
    server.adapter(redisAdapter);
    return server;
  }
}