import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UploadDetail {
  @Field(() => ID)
  id: string;

  @Field(() => Upload)
  upload: Upload;
}

@ObjectType()
export class Upload {
  @Field(() => ID)
  id: string;

  originalFilename: string;
  fileSize?: number;
  width?: number;
  height?: number;
  url?: string;
  createdAt?: Date;
  updatedAt?: Date;

  @Field(() => String)
  sha: string;

  extension: string;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  type: string;
  lixiId: number;
  accountId: number;

  @Field(() => String, { nullable: true })
  bucket?: string;
}
