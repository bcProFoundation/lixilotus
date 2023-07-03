import { Module } from '@nestjs/common';
import { CloudflareImagesService } from './cloudflare-images.service';
import { CloudflareMigrateService } from './cloudflare-migrate.service';

@Module({
  imports: [],
  controllers: [],
  providers: [CloudflareImagesService, CloudflareMigrateService],
  exports: [CloudflareImagesService]
})
export class CloudflareModule {}
