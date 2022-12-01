import { IsNotEmpty } from 'class-validator';

export class CreatePostCommand {
  @IsNotEmpty()
  content: string;
  pageId?: string;
  tokenId?: string;
  cover?: string;
}

export class EditPostCommand {
  @IsNotEmpty()
  id: string;

  pageId?: string;

  @IsNotEmpty()
  content: string;

  cover?: string;
}
