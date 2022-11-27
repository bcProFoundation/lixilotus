import _ from 'lodash';
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { CHRONIK_CLIENTS, CHRONIK_MODULE_OPTIONS, CHRONIK_SUPPORT_COINS } from './chronik.constants';
import { ChronikClients, ChronikModuleAsyncOptions, ChronikModuleOptions } from './chronik.interfaces';
import { createAsyncProviders, createConnectionFactory } from './chronik.providers';

@Global()
@Module({})
export class ChronikModule {
  public static forRoot(options: ChronikModuleOptions, isGlobal = true): DynamicModule {
    const chronikOptions: Provider = {
      provide: CHRONIK_MODULE_OPTIONS,
      useValue: options
    };

    const connectionProvider: Provider = {
      provide: CHRONIK_CLIENTS,
      useFactory: async () => await createConnectionFactory(options)
    };

    const childrenProviders: Provider[] = [];
    for (const network of options.networks) {
      childrenProviders.push({
        provide: `${CHRONIK_CLIENTS}_${network}`,
        inject: [CHRONIK_CLIENTS],
        useFactory: (clients: ChronikClients) => clients[network]
      });
    }

    return {
      module: ChronikModule,
      providers: [chronikOptions, connectionProvider, ...childrenProviders],
      exports: [connectionProvider, ...childrenProviders]
    };
  }

  public static forRootAsync(options: ChronikModuleAsyncOptions, isGlobal = true): DynamicModule {
    const connectionProvider: Provider = {
      provide: CHRONIK_CLIENTS,
      useFactory: async (chronikOptions: ChronikModuleOptions) => await createConnectionFactory(chronikOptions),
      inject: [CHRONIK_MODULE_OPTIONS]
    };

    const asyncProviders = createAsyncProviders(options);

    let childrenProviders: Provider[] = [];
    for (const network of CHRONIK_SUPPORT_COINS) {
      childrenProviders.push({
        provide: `${CHRONIK_CLIENTS}_${network}`,
        inject: [CHRONIK_CLIENTS, CHRONIK_MODULE_OPTIONS],
        useFactory: (clients: ChronikClients, chronikOptions: ChronikModuleOptions) => {
          if (chronikOptions.networks.includes(network)) {
            return clients[network];
          }
        }
      });
    }

    return {
      global: isGlobal,
      module: ChronikModule,
      imports: options.imports || [],
      providers: [...asyncProviders, connectionProvider, ..._.compact(childrenProviders)],
      exports: [connectionProvider, ..._.compact(childrenProviders)]
    };
  }
}
