import { Module } from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { AuthModule } from '../auth/auth.module';
import { EventsAnalyticProcessor } from './events-analytic.processor';
import { PageModule } from '../page/page.module';

@Module({
  imports: [AuthModule, AccountModule, PageModule],
  controllers: [],
  providers: [EventsAnalyticProcessor],
  exports: [EventsAnalyticProcessor]
})
export class EventsAnalyticModule {}
