import { Config } from './config.interface';

const config: Config = {
  nest: {
    port: 4800
  },
  cors: {
    enabled: true
  },
  swagger: {
    enabled: true,
    title: 'Nestjs FTW',
    description: 'The nestjs API description',
    version: '1.5',
    path: 'api'
  },
  graphql: {
    playgroundEnabled: true,
    debug: true,
    schemaDestination: './schema.graphql',
    sortSchema: true
  },
  prisma: {
    log: ['query']
  },
  security: {
    expiresIn: '2m',
    refreshIn: '7d',
    bcryptSaltOrRound: 10
  }
};

export default (): Config => config;
