export class TokenDto {
  id: string;
  tokenId: string;
  name: string;
  ticker: string;
  tokenType: string;
  tokenDocumentUrl: string;
  totalBurned: string;
  totalMinted: string;
  initialTokenQuantity: string;
  lotusBurnUp?: string;
  lotusBurnDown?: string;
  decimals: number;
  comments?: Date;
  createdDate: Date;

  constructor(partial: Partial<TokenDto>) {
    Object.assign(this, partial);
  }
}
