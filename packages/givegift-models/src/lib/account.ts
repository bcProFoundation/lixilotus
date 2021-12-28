export interface GenerateAccountDto {
    name: string;
    mnemonicHash: string;
}

export interface CreateAccountDto {
    name: string;
    encryptedMnemonic: string;
}

export interface AccountDto {
    id?: number;
    name: string;
    encryptedMnemonic: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Account {
    id: number;
    name: string;
    encryptedMnemonic: string;
    createdAt?: Date;
    updatedAt?: Date;
    mnemonicHash: string;
}

export interface ImportAccountDto {
    encryptedMnemonic: string;
}