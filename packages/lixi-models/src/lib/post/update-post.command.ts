import { IsNotEmpty } from 'class-validator';

export class UpdatePostCommand {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;

  cover?: string;
}
