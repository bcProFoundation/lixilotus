import { ModuleMetadata, Provider, Type } from '@nestjs/common';
import { ChronikClient } from 'chronik-client';

export interface ChronikModuleOptions {
  host: string;
  networks: string[];
}

export interface ChronikClients {
  [network: string]: ChronikClient;
}

export interface ChronikModuleOptionsFactory {
  createChronikOptions(): Promise<ChronikModuleOptions> | ChronikModuleOptions;
}

export interface ChronikModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<ChronikModuleOptionsFactory>;
  useClass?: Type<ChronikModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<ChronikModuleOptions> | ChronikModuleOptions;
  inject?: any[];
  extraProviders?: Provider[];
}
