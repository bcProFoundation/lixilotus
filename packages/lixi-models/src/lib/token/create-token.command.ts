export class CreateTokenCommand {
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
  comments?: String;
  createdDate: String;
}
