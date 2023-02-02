import { IsNotEmpty } from 'class-validator';

export class CreatePageCommand {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  categoryId?: string;

  description: string;
  parentId?: string;
}

export class EditPageCommand {
  id: string;
  name: string;
  categoryId: string;
  title: string;
  description: string;
  avatar?: string;
  cover?: string;
  parentId?: string;
  website: string;
  countryId?: string;
  stateId?: string;
  address?: string;
}
