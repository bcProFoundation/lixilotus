import { IsNotEmpty } from "class-validator";

export class CreatePageCommand {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  title: string;

  description: string;
  avatar?: string;
  cover?: string;
  parentId?: string;
  walletAddress: string;
  website: string;
  country?: string;
  state?: string;
  address?: string
}