import { INestApplication, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@bcpros/lixi-prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(
    private logger: Logger
  ) {
    super();
    // super({
    //   log: [
    //     { emit: 'event', level: 'query' },
    //     { emit: 'stdout', level: 'info' },
    //     { emit: 'stdout', level: 'warn' },
    //     { emit: 'stdout', level: 'error' },
    //   ],
    //   errorFormat: 'colorless',
    // });
  }

  async onModuleInit() {
    this.$on<any>('query', async (e: any) => {
      // this.logger.log('Query: ' + e.query)
      // this.logger.log('Params: ' + e.params)
      // this.logger.log('Duration: ' + e.duration + 'ms')
    });

    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
