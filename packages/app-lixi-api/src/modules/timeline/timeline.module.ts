import { Logger, Module } from '@nestjs/common';
import { TimelineResolver } from './timeline.resolver';
import { TimelineService } from './timeline.service';
import { AuthModule } from '../auth/auth.module';
import { PageModule } from '../page/page.module';

@Module({
  imports: [AuthModule, PageModule],
  providers: [Logger, TimelineService, TimelineResolver],
  exports: []
})
export class TimelineModule {}
