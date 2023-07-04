import axios, { AxiosRequestConfig } from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { CloudflareImagesService } from './cloudflare-images.service';
import { Requests } from 'cloudflare-images';
import { Upload } from '@prisma/client';
import sharp from 'sharp';

@Injectable()
export class CloudflareMigrateService {
  private readonly logger = new Logger(CloudflareMigrateService.name);

  constructor(private readonly prisma: PrismaService, private readonly cfImagesService: CloudflareImagesService) {}

  @Cron('10 * * * * *')
  async handleCron() {
    try {
      const uploads = await this.prisma.upload.findMany({
        where: {
          cfImageId: null,
          cfImageFilename: null
        },
        take: 10
      });
      if (!uploads || uploads.length == 0) {
        this.logger.debug('All images are migrated');
      }

      this.logger.log(`Prepare to migrate ${uploads.length} images`);
      for (const upload of uploads) {
        this.logger.debug(upload);
        const url = upload.bucket ? `${process.env.AWS_ENDPOINT}/${upload.bucket}/${upload.sha}` : upload.url;
        const createImageRequest: Requests.CreateImage = {
          id: upload.sha!,
          fileName: `${upload.originalFilename}.${upload.extension}`,
          metadata: {
            width: upload.width,
            height: upload.height
          },
          requireSignedURLs: false
        };

        let response;
        try {
          response = await this.cfImagesService.createImageFromUrl(createImageRequest, url!);
        } catch (error) {
          this.logger.debug('Need to resize image before uploading');
          const imageResponse = await axios.get(url!, { responseType: 'arraybuffer' });
          let imageBuffer = Buffer.from(imageResponse.data, 'utf-8');
          const metadata = await sharp(imageBuffer).metadata();
          if (Number(metadata?.width) >= 12000 || Number(metadata?.height) >= 12000) {
            const resizedImage = await sharp(imageBuffer)
              .resize(12000, 12000, {
                fit: sharp.fit.inside
              })
              .png({ quality: 100 });
            const resizedMetadata = await resizedImage.metadata();

            const createImageRequest: Requests.CreateImage = {
              id: upload.sha!,
              fileName: `${upload.originalFilename}.${upload.extension}`,
              metadata: resizedMetadata,
              requireSignedURLs: false
            };
            const resizedImageBuffer = await resizedImage.toBuffer();
            response = await this.cfImagesService.createImageFromBuffer(createImageRequest, resizedImageBuffer);
          }
        }
        if (response && response.result) {
          const uploadToUpdate = {
            updatedAt: new Date(),
            cfImageId: response.result.id,
            cfImageFilename: response.result.filename
          };

          const resultImage: Upload = await this.prisma.upload.update({
            where: {
              id: upload.id
            },
            data: uploadToUpdate
          });
          this.logger.debug(`Upload to cloudflare the image ${response.result.id}`);
        }
      }
    } catch (err) {
      this.logger.error({ error: err, operation: 'migrate.image' });
    }
  }
}
