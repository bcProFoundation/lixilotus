export interface CreateAccountCommand {
  mnemonic: string;
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

export interface DeleteAccountCommand {
  id: number;
  mnemonic: string;
}

export interface AccountDto {
  id?: number;
  name: string;
  mnemonic?: string;
  encryptedMnemonic: string;
  mnemonicHash: string;
  createdAt?: Date;
  updatedAt?: Date;
  address: string;
}