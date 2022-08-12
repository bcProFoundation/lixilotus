import { Module } from '@nestjs/common';
import { NotificationService } from 'src/common/modules/notifications/notification.service';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { PageController } from './page.controller';
// import { LixiNftController } from './lixinft.controller';
// import { LixiNftService } from './lixinft.service';

@Module({
  imports: [AuthModule],
  controllers: [PageController],
  providers: [],
  exports: []
})
export class PageModule {}
