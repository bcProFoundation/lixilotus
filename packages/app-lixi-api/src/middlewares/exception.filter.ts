import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { VError } from 'verror';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger: Logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const error = exception.response;
    const info = VError.info(new Error(error));

    const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException ? exception.message : 'Internal server error';

    this.logger.error(error);
    let err = error;
    while (err && (err as any).cause) {
      err = (err as any).cause();
      this.logger.error(err);
    }

    const devErrorResponse: any = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      errorName: exception?.name,
      message: exception?.message,
      stack: exception?.stack
    };

    const prodErrorResponse: any = {
      statusCode,
      message
    };
    this.logger.error(devErrorResponse, 'HttpExceptionFilter');
    response.code(statusCode).send(process.env.NODE_ENV === 'development' ? devErrorResponse : prodErrorResponse);
  }
}
