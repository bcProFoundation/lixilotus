import { IsNotEmpty } from "class-validator";

export class UpdatePageCommand {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  title: string;

  description: string;
  address: string;
  website: string;
}