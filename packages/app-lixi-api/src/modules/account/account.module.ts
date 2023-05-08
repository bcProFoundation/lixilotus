import { Logger, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AccountController } from '../core/account/account.controller';
import { AccountResolver } from './account.resolver';
import { FollowResolver } from './follow.resolver';

@Module({
  imports: [AuthModule],
  controllers: [],
  providers: [AccountResolver, FollowResolver, Logger],
  exports: []
})
export class AccountModule {}
