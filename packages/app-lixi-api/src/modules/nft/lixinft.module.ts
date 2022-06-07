import { Module } from '@nestjs/common';
import { LixiNftController } from './lixinft.controller';
import { LixiNftService } from './lixinft.service';


@Module({
  imports: [
  ],
  controllers: [LixiNftController],
  providers: [LixiNftService],
  exports: [LixiNftService]
})
export class LixiNftModule { }