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
  lotusBurnUp: number;
  lotusBurnDown: number;
  lotusBurnScore: number;
  decimals: number;
  comments?: Nullable<Date>;
  createdDate: Date;

  constructor(partial: Partial<TokenDto>) {
    Object.assign(this, partial);
  }
}
