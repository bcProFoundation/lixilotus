import { IsNotEmpty } from 'class-validator';

export class CreatePageCommand {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  categoryId?: string;

  description: string;
  avatar?: string;
  cover?: string;
  parentId?: string;
  website: string;
  country?: string;
  state?: string;
  address?: string;
}

export class EditPageCommand {
  id: string;
  name: string;
  title: string;
  description: string;
  avatar?: string;
  cover?: string;
  parentId?: string;
  website: string;
  country?: string;
  state?: string;
  address?: string;
}
