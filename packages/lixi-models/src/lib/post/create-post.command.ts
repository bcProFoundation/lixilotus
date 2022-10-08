import { IsNotEmpty } from 'class-validator';

export class CreatePostCommand {
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  content: string;
  @IsNotEmpty()
  pageId: string;
  cover?: string;
}

export class EditPostCommand {
  id: string;
  pageId: string;
  title: string;
  content: string;
  cover?: string;
}
