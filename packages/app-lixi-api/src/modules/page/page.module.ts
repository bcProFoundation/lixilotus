import { Logger, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CommentResolver } from './comment.resolver';
import { PageResolver } from './page.resolver';
import { PostResolver } from './post.resolver';
import { MeiliService } from './meili.service';
// import { LixiNftController } from './lixinft.controller';
// import { LixiNftService } from './lixinft.service';

@Module({
  imports: [AuthModule],
  providers: [PageResolver, Logger, PostResolver, MeiliService, CommentResolver],
  exports: [MeiliService]
})
export class PageModule {}
