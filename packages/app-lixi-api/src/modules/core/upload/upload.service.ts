import { Injectable } from '@nestjs/common';
import { InjectS3, S3 } from 'nestjs-s3';
import { hexSha256 } from 'src/utils/encryptionMethods';

@Injectable()
export class UploadService {
  constructor(@InjectS3() private readonly s3: S3) {}

  async uploadS3(file: Buffer, mimetype: string, bucket?: string) {
    const sha = await hexSha256(file);

    const params = {
      Bucket: bucket!,
      Key: sha,
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
