import { Logger, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MessageResolver } from './message.resolver';
import { MeiliService } from '../page/meili.service';
import { PageMessageSessionResolver } from './page-message-session.resolver';
import { NotificationModule } from 'src/common/modules/notifications/notification.module';

@Module({
  imports: [AuthModule, NotificationModule],
  controllers: [],
  providers: [MessageResolver, PageMessageSessionResolver, Logger, MeiliService],
  exports: [MessageResolver, Logger]
})
export class MessageModule {}
