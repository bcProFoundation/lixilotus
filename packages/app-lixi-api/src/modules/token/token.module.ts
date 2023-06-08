import { Logger, Module } from '@nestjs/common';
import { NotificationModule } from 'src/common/modules/notifications/notification.module';
import { AuthModule } from '../auth/auth.module';
import { TokenResolver } from './token.resolver';

@Module({
  imports: [AuthModule, NotificationModule],
  controllers: [],
  providers: [TokenResolver, Logger],
  exports: []
})
export class TokenModule {}
