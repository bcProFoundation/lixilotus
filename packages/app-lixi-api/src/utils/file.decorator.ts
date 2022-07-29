import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

declare global {
  namespace Storage {
    interface MultipartFile {
      toBuffer: () => Promise<Buffer>;
      file: NodeJS.ReadableStream;
      filepath: string;
      fieldname: string;
      filename: string;
      encoding: string;
      mimetype: string;
      fields: import('@fastify/multipart').MultipartFields;
    }
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    incomingFile: Storage.MultipartFile;
  }
}

export const File = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest() as FastifyRequest;
  const file = req.incomingFile;
  return file;
});
