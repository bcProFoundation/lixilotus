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

  @Field(() => String, { nullable: true })
  width?: number;

  @Field(() => String, { nullable: true })
  height?: number;

  url?: string;
  createdAt?: Date;
  updatedAt?: Date;

  @Field(() => String)
  sha: string;

  @Field(() => String, { nullable: true })
  sha800?: string;

  @Field(() => String, { nullable: true })
  sha320?: string;

  @Field(() => String, { nullable: true })
  sha40: string;

  extension: string;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  type: string;
  lixiId: number;
  accountId: number;

  @Field(() => String, { nullable: true })
  bucket?: string;
}
