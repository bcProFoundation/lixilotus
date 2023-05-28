import { Logger, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { HashtagResolver } from './hashtag.resolver';
import { MeiliService } from '../page/meili.service';

@Module({
  imports: [AuthModule],
  controllers: [],
  providers: [HashtagResolver, Logger, MeiliService],
  exports: [HashtagResolver, Logger]
})
export class HashtagModule {}
