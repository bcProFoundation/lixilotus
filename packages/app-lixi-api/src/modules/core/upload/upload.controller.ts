import {
  Controller,
  Get,
  Res,
  Param,
  HttpException,
  HttpStatus,
  Query,
  StreamableFile,
  Header,
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
import { JwtAuthGuard } from 'src/modules/auth/jwtauth.guard';
import { hexSha256 } from 'src/utils/encryptionMethods';
import { Upload as UploadDb } from '@prisma/client';
import { FastifyRequest } from 'fastify';
import { PrismaService } from '../../prisma/prisma.service';
import { FileInterceptor } from '@webundsoehne/nest-fastify-file-upload';
import { MulterFile } from '@webundsoehne/nest-fastify-file-upload/dist/interfaces/multer-options.interface';

@Controller('uploads')
export class UploadFilesController {
  constructor(private prisma: PrismaService) {}

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

  @Post('/')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async upload(
    @UploadedFile('file') file: MulterFile,
    @Body() body: any,
    @Req() req: FastifyRequest,
    @I18n() i18n: I18nContext
  ) {
    try {
      const { type } = body;
      const account = (req as any).account;
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
