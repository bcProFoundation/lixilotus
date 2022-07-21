import { IsNotEmpty } from "class-validator";

export class CreatePageCommand {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  title: string;

  description: string;
  avatar: string;
  cover: string;
  parentId?: string;
  address: string;
  website: string;
}