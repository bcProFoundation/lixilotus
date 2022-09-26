export class LocalUserAccount {
  name: string;
  address: string;
  mnemonic: string;
  language?: string;
  balance?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class RenameLocalUserAccountCommand {
  name: string;
  address: string;
}
