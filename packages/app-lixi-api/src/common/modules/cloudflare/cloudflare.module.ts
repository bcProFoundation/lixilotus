import { Module } from '@nestjs/common';
import { CloudflareImagesService } from './cloudflare-images.service';

@Module({
  imports: [],
  controllers: [],
  providers: [CloudflareImagesService],
  exports: [CloudflareImagesService]
})
export class CloudflareModule {}
