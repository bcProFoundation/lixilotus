import { Logger, Module } from '@nestjs/common';
import { NotificationModule } from 'src/common/modules/notifications/notification.module';
import { AuthModule } from '../auth/auth.module';
import { AccountResolver } from './account.resolver';
import { FollowCacheService } from './follow-cache.service';
import { FollowResolver } from './follow.resolver';

@Module({
  imports: [AuthModule, NotificationModule],
  controllers: [],
  providers: [AccountResolver, FollowResolver, Logger, FollowCacheService],
  exports: []
})
export class AccountModule {}
