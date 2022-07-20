export interface Upload {
    id: string;
    originalFilename: string;
    fileSize: number;
    width: number;
    height: number;
    url: string;
    createdAt?: Date;
    updatedAt?: Date;
    sha: string;
    extension: string;
    thumbnailWidth: number;
    thumbnailHeight: number;
    type: string;
    lixiId: number;
    accountId: number;
}