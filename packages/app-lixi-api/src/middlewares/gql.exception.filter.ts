import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { I18n, I18nService } from 'nestjs-i18n';
import VError from 'verror';
import { HttpExceptionFilter } from './exception.filter';

@Catch()
export class GqlHttpExceptionFilter implements GqlExceptionFilter {
  constructor(@I18n() private i18n: I18nService) {}
  private logger: Logger = new Logger(HttpExceptionFilter.name);

  async catch(exception: any, host: ArgumentsHost): Promise<any> {
    const ctx = GqlArgumentsHost.create(host);
    const request = (ctx as any).req;
    const response = (ctx as any).reply;
    let error = exception.response ?? exception;

    const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!(error instanceof VError)) {
      const unableToGetPage = await this.i18n.t('common.messages.unexpectedErrorOccurs');
      this.logger.error(error);
      error = new VError.WError(error as Error, unableToGetPage);
    }

    this.logger.error(error);
    let err = error;
    while (err && (err as any).cause) {
      const logStack = err?.stack ? ` - stack: ${err?.stack} ` : '';
      this.logger.error(err.message + logStack);
      err = (err as any).cause();
    }

    const devErrorResponse: any = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.path,
      queryName: request.fieldName,
      errorName: exception?.name,
      message: error,
      stack: exception?.stack
    };

    this.logger.error(
      `error at request method:${request.path.typename} ${request.path.key}`,
      JSON.stringify(devErrorResponse)
    );
    return new HttpException(error, statusCode);
  }
}
