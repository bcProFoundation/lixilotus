import { Logger, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WorshipResolver } from './worship.resolver';
// import { LixiNftController } from './lixinft.controller';
// import { LixiNftService } from './lixinft.service';

@Module({
  imports: [AuthModule],
  controllers: [],
  providers: [WorshipResolver, Logger],
  exports: []
})
export class WorshipModule {}
