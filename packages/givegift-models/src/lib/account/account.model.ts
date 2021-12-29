
export interface Account {
    id: number;
    name: string;
    mnemonic: string;
    encryptedMnemonic: string;
    createdAt?: Date;
    updatedAt?: Date;
    mnemonicHash: string;
}

