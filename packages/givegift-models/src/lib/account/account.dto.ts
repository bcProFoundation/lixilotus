export interface CreateAccountCommand {
  name: string;
  encryptedMnemonic: string;
  mnemonicHash: string;
}

export interface ImportAccountCommand {
  mnemonic: string;
  mnemonicHash: string;
}

export interface AccountDto {
  id?: number;
  name: string;
  encryptedMnemonic: string;
  mnemonicHash: string;
  createdAt?: Date;
  updatedAt?: Date;
}