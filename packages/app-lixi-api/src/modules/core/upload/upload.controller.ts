import { Account } from '@bcpros/lixi-models';
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiConsumes } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Upload as UploadDb } from '@prisma/client';
import { FileInterceptor, FilesInterceptor } from '@webundsoehne/nest-fastify-file-upload';
import { MulterFile } from '@webundsoehne/nest-fastify-file-upload/dist/interfaces/multer-options.interface';
import { Requests } from 'cloudflare-images';
import { I18n, I18nContext } from 'nestjs-i18n';
import { extname } from 'path';
import sharp from 'sharp';
import { PostAccountEntity } from 'src/decorators/postAccount.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwtauth.guard';
import { VError } from 'verror';
import { CloudflareImagesService } from '../../../common/modules/cloudflare/cloudflare-images.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from './upload.service';
import { hexSha256 } from '../../../utils/encryptionMethods';

@SkipThrottle()
@Controller('uploads')
export class UploadFilesController {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
    private readonly cloudflareService: CloudflareImagesService
  ) {}

  @Post('/s3')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async uploadS3(
    @UploadedFile('file') file: MulterFile,
    @PostAccountEntity() account: Account,
    @I18n() i18n: I18nContext,
    @Body() body: any
  ) {
    try {
      const { type } = body;
      if (!account) {
        const couldNotFindAccount = await i18n.t('lixi.messages.couldNotFindAccount');
        throw new Error(couldNotFindAccount);
      }

      const bucket = process.env.AWS_PUBLIC_BUCKET_NAME;
      const buffer = file.buffer;
      const sha = await hexSha256(buffer);
      const originalName = file.originalname.replace(/\.[^/.]+$/, '');
      const fileExtension = extname(file.originalname);
      const metadata = await sharp(file.buffer).metadata();

      const createImageRequest: Requests.CreateImage = {
        fileName: file.originalname,
        metadata: {
          width: metadata.width,
          height: metadata.height
        },
        requireSignedURLs: false
      };
      const createImageResponse = await this.cloudflareService.createImageFromBuffer(createImageRequest, buffer);

      const uploadToInsert = {
        sha: sha,
        originalFilename: originalName,
        createdAt: new Date(),
        updatedAt: new Date(),
        extension: fileExtension,
        type: type,
        bucket: bucket,
        width: metadata.width,
        height: metadata.height,
        cfImageId: createImageResponse.result.id,
        cfImageFilename: createImageResponse.result.filename
      };

      const resultImage: UploadDb = await this.prisma.upload.create({
        data: uploadToInsert
      });

      await this.prisma.uploadDetail.create({
        data: {
          account: { connect: { id: account.id } },
          upload: { connect: { id: resultImage.id } }
        }
      });

      return resultImage;
    } catch (err) {
      console.log(err);
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableToUpload = await i18n.t('lixi.messages.unableToUpload');
        const error = new VError.WError(err as Error, unableToUpload);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post('/s3-multiple')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  async uploadS3Multiple(
    @UploadedFile('files') files: Array<Express.Multer.File>,
    @PostAccountEntity() account: Account,
    @I18n() i18n: I18nContext,
    @Body() body: any
  ) {
    try {
      const { type } = body;
      if (!account) {
        const couldNotFindAccount = await i18n.t('lixi.messages.couldNotFindAccount');
        throw new Error(couldNotFindAccount);
      }

      const bucket = process.env.AWS_PUBLIC_BUCKET_NAME;
      let uploads = [];

      const promises = files.map(async (file: MulterFile) => {
        const buffer = file.buffer;
        const sha = await hexSha256(buffer);
        const originalName = file.originalname.replace(/\.[^/.]+$/, '');
        const fileExtension = extname(file.originalname);
        const metadata = await sharp(file.buffer).metadata();
        const createImageRequest: Requests.CreateImage = {
          fileName: file.originalname,
          metadata: {
            width: metadata.width,
            height: metadata.height
          },
          requireSignedURLs: false
        };
        const createImageResponse = await this.cloudflareService.createImageFromBuffer(createImageRequest, buffer);

        return {
          sha: sha,
          originalFilename: originalName,
          createdAt: new Date(),
          updatedAt: new Date(),
          extension: fileExtension,
          type: type,
          bucket: bucket,
          width: metadata.width,
          height: metadata.height,
          cfImageId: createImageResponse.result.id,
          cfImageFilename: createImageResponse.result.filename
        };
      });

      uploads = await Promise.all(promises);

      //Bypass because prisma doesn't return records after create many
      //https://github.com/prisma/prisma/issues/8131
      const resultImages = await this.prisma.$transaction(
        uploads.map(upload => this.prisma.upload.create({ data: upload }))
      );

      await this.prisma.$transaction(
        resultImages.map(image =>
          this.prisma.uploadDetail.create({
            data: {
              account: { connect: { id: account.id } },
              upload: { connect: { id: image.id } }
            }
          })
        )
      );

      return resultImages;
    } catch (err) {
      console.log(err);
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableToUpload = await i18n.t('lixi.messages.unableToUpload');
        const error = new VError.WError(err as Error, unableToUpload);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
