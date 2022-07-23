import { Controller, Get, Res, Param, HttpException, HttpStatus, Query, StreamableFile, Header } from '@nestjs/common';
import { VError } from 'verror';
import { I18n, I18nContext } from 'nestjs-i18n';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('uploads')
export class UploadFilesController {
    @Get('/:id?')
    @Header('Content-Type', 'image/png')
    async getImage(
        @Param('id') id: string,
        @Res({ passthrough: true }) res: StreamableFile,
        @Query('fileId') fileId: any,
        @I18n() i18n: I18nContext,
    ) {
        try {
            const path = join(process.cwd(), `public/uploads/${id}/${fileId}`);
            const file = createReadStream(path);

            return new StreamableFile(file);
        } catch (err) {
            if (err instanceof VError) {
                throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
            } else {
                const unableToUpload = await i18n.t('lixi.messages.unableToGet');
                const error = new VError.WError(err as Error, unableToUpload);
                throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
}