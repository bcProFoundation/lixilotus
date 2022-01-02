export interface CreateAccountCommand {
  name: string;
  encryptedMnemonic: string;
  mnemonicHash: string;
}

export interface ImportAccountCommand {
  mnemonic: string;
  mnemonicHash: string;
}

export interface RenameAccountCommand {
  id: number;
  mnemonic: string;
  name: string;
}

export interface AccountDto {
  id?: number;
  name: string;
  mnemonic?: string;
  encryptedMnemonic: string;
  mnemonicHash: string;
  createdAt?: Date;
  updatedAt?: Date;
}