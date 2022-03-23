import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { VError } from 'verror';
import logger from '../logger';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const error = exception.response;
    const info = VError.info(new Error(error));

    const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    const message = exception instanceof HttpException ? exception.message : 'Internal server error'

    logger.error(error);
    let err = error;
    while (err && (err as any).cause) {
      err = (err as any).cause();
      logger.error(err);
    }

    const devErrorResponse: any = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      errorName: exception?.name,
      message: exception?.message
    };

    const prodErrorResponse: any = {
      statusCode,
      message
    };
    logger.error(`error at request method: ${request.method} request url${request.url}`, JSON.stringify(devErrorResponse));
    response.code(statusCode).send(process.env.NODE_ENV === 'development' ? devErrorResponse : prodErrorResponse);
  }
}