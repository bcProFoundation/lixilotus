import { IsNotEmpty } from 'class-validator';

export class UpdatePostCommand {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  content: string;

  cover?: string;
}
