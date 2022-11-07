import { Injectable } from '@nestjs/common';
import { InjectS3, S3 } from 'nestjs-s3';

@Injectable()
export class UploadService {
  constructor(@InjectS3() private readonly s3: S3) {}

  async uploadPublicFile(file: Buffer, filename: string, mimetype: string) {
    const params = {
      Bucket: process.env.AWS_PUBLIC_BUCKET_NAME!,
      Key: `${filename}`,
      Body: file,
      ACL: 'public-read',
      ContentType: mimetype,
      ContentDisposition: 'inline'
    };

    const { Key, Bucket } = await this.s3.upload(params).promise();

    return {
      Key,
      Bucket
    };
  }
}
