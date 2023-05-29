import { Logger, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { HashtagResolver } from './hashtag.resolver';
import { MeiliService } from '../page/meili.service';
import { HashtagService } from './hashtag.service';

@Module({
  imports: [AuthModule],
  controllers: [],
  providers: [HashtagResolver, Logger, MeiliService, HashtagService],
  exports: [HashtagResolver, Logger, HashtagService]
})
export class HashtagModule {}
