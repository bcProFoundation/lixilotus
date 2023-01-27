import { IsNotEmpty } from 'class-validator';

export class UpdatePageCommand {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  category: string;

  title?: string;

  description: string;
  website: string;
  avatar?: string;
  cover?: string;
  country?: string;
  state?: string;
  address?: string;
}
