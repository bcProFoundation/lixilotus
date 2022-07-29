import { Controller, Get, Res, Param, HttpException, HttpStatus, Query } from '@nestjs/common';
import { VError } from 'verror';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('uploads')
export class UploadFilesController {
  @Get('/:id?')
  async getImage(@Param('id') id: string, @Res() res: any, @Query('fileId') fileId: any, @I18n() i18n: I18nContext) {
    try {
      res.sendFile(fileId, { root: `public/uploads/${id}` });
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
