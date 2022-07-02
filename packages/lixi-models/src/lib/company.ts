export interface CompanyDTO {
  id: number;
  name: string;
  description: string;
  mnemonicHash: string;
  category: string;
  totalVote: number;
  companyComments?: CompanyCommentDTO[];
}

export interface CompanyCommentDTO {
  id: number;
  header: string;
  comment: string;
  companyId?: number;
  totalVote: number;
}
