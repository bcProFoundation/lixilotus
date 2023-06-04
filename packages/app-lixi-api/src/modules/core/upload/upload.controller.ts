import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
  Query,
  StreamableFile,
  Post,
  UseGuards,
  Req,
  Body,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { ApiConsumes } from '@nestjs/swagger';
import { VError } from 'verror';
import { I18n, I18nContext } from 'nestjs-i18n';
import { createReadStream } from 'fs';
import { join } from 'path';
import { extname } from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwtauth.guard';
import { hexSha256 } from 'src/utils/encryptionMethods';
import { Upload as UploadDb } from '@prisma/client';
import { FastifyRequest } from 'fastify';
import { PrismaService } from '../../prisma/prisma.service';
import { FileInterceptor, FilesInterceptor } from '@webundsoehne/nest-fastify-file-upload';
import { MulterFile } from '@webundsoehne/nest-fastify-file-upload/dist/interfaces/multer-options.interface';
import { Account } from '@bcpros/lixi-models';
import { PageAccountEntity } from 'src/decorators/pageAccount.decorator';
import { UploadService } from './upload.service';
import _ from 'lodash';
import { PostAccountEntity } from 'src/decorators/postAccount.decorator';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('uploads')
export class UploadFilesController {
  constructor(private prisma: PrismaService, private uploadService: UploadService) {}

  @Get('/:id?')
  async getImage(
    @Param('id') id: string,
    @Query('fileId') fileId: any,
    @I18n() i18n: I18nContext
  ): Promise<StreamableFile> {
    try {
      const path = join(process.cwd(), `public/uploads/${id}/${fileId}`);

      const file = createReadStream(path);
      const stream = new StreamableFile(file);
      stream.options.type = `image/${extname(fileId).substring(1)}`;

      return stream;
    } catch (err) {
      console.log(err);
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableToUpload = await i18n.t('lixi.messages.unableToGet');
        const error = new VError.WError(err as Error, unableToUpload);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

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
      const originalName = file.originalname.replace(/\.[^/.]+$/, '');
      const fileExtension = extname(file.originalname);
      const originalImage = await sharp(file.buffer).metadata();

      const { Key } = await this.uploadService.uploadS3(buffer, fileExtension, bucket);

      const uploadToInsert = {
        originalFilename: originalName,
        createdAt: new Date(),
        updatedAt: new Date(),
        sha: Key,
        extension: fileExtension,
        type: type,
        bucket: bucket,
        width: originalImage.width,
        height: originalImage.height
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
        const numbers = [800, 320, 40];
        const shaArray = numbers.map(async item => {
          const shaThumbnailBuffer = await sharp(file.buffer).resize({ width: item }).png().toBuffer();
          const { Key } = await this.uploadService.uploadS3(shaThumbnailBuffer, fileExtension, bucket);
          return Key;
        });
        const originalName = file.originalname.replace(/\.[^/.]+$/, '');
        const fileExtension = extname(file.originalname);
        const { Key } = await this.uploadService.uploadS3(buffer, fileExtension, bucket);
        const originalImage = await sharp(file.buffer).metadata();

        return {
          originalFilename: originalName,
          createdAt: new Date(),
          updatedAt: new Date(),
          sha: Key,
          sha800: await shaArray[0],
          sha320: await shaArray[1],
          sha40: await shaArray[2],
          extension: fileExtension,
          type: type,
          bucket: bucket,
          width: originalImage.width,
          height: originalImage.height
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

      // Object.assign(resultImage, { awsEndpoint: process.env.AWS_ENDPOINT });

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

  @Post('/')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async upload(
    @PageAccountEntity() account: Account,
    @UploadedFile('file') file: MulterFile,
    @Body() body: any,
    @Req() req: FastifyRequest,
    @I18n() i18n: I18nContext
  ) {
    try {
      const { type } = body;
      if (!account) {
        const couldNotFindAccount = await i18n.t('lixi.messages.couldNotFindAccount');
        throw new Error(couldNotFindAccount);
      }

      const buffer = file.buffer;
      const originalName = file.originalname.replace(/\.[^/.]+$/, '');
      const sha = await hexSha256(buffer);
      const dir = `uploads`;

      const fileExtension = extname(file.originalname);
      const folderName = sha.substring(0, 2);
      const fileUrl = `${dir}/${folderName}/${sha}`;

      //create new folder if there are no existing is founded
      if (!fs.existsSync(`./public/${dir}/${folderName}`)) {
        fs.mkdirSync(`./public/${dir}/${folderName}`);
      }

      //write image file to folder
      const originalImage = await sharp(buffer).toFile(`./public/${fileUrl}${fileExtension}`);
      const thumbnailImage = await sharp(buffer).resize(200).toFile(`./public/${fileUrl}-200${fileExtension}`);

      const uploadToInsert = {
        originalFilename: originalName,
        fileSize: originalImage.size,
        width: originalImage.width,
        height: originalImage.height,
        url: `${process.env.BASE_URL}/api/${dir}/${folderName}?fileId=${sha}${fileExtension}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        sha: sha,
        extension: file.mimetype,
        thumbnailWidth: thumbnailImage.width,
        thumbnailHeight: thumbnailImage.height,
        type: type
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
}
