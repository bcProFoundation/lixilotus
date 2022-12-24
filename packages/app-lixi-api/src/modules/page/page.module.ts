import { Logger, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CommentResolver } from './comment.resolver';
import { PageController } from './page.controller';
import { PageResolver } from './page.resolver';
import { PostResolver } from './post.resolver';
import { MeiliService } from './meili.service';
import { PostService } from './post.service';
// import { LixiNftController } from './lixinft.controller';
// import { LixiNftService } from './lixinft.service';

@Module({
  imports: [AuthModule],
  controllers: [PageController],
  providers: [PageResolver, Logger, PostResolver, MeiliService, PostService, CommentResolver],
  exports: [MeiliService, PostService]
})
export class PageModule {}
