export interface Account {
  id: number;
  name: string;
  mnemonic: string;
  encryptedMnemonic: string;
  encryptedSecret: string;
  secret?: string;
  createdAt?: Date;
  updatedAt?: Date;
  mnemonicHash: string;
  address: string;
  balance?: number;
  language?: string;
}
