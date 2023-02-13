import { Logger, Module } from '@nestjs/common';
import { TokenResolver } from './token.resolver';
import { AuthModule } from '../auth/auth.module';
import { TokenController } from '../core/token/token.controller';

@Module({
  imports: [AuthModule],
  controllers: [],
  providers: [TokenResolver, Logger],
  exports: []
})
export class TokenModule {}
