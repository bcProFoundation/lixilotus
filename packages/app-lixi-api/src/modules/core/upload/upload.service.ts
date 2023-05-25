import { Injectable } from '@nestjs/common';
import { InjectS3, S3 } from 'nestjs-s3';
import { hexSha256 } from 'src/utils/encryptionMethods';

@Injectable()
export class UploadService {
  constructor(@InjectS3() private readonly s3: S3) {}

  async uploadS3(file: Buffer, mimetype: string, bucket?: string) {
    const sha = await hexSha256(file);

    const Bucket = bucket!;
    const Key = sha;

    const params = {
      Bucket,
      Key,
      Body: file,
      ACL: 'public-read',
      ContentType: mimetype,
      ContentDisposition: 'inline'
    };

    const result = await this.s3.putObject(params);

    return {
      Key,
      Bucket
    };
  }
}
