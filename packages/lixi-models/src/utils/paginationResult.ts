export interface PageInfo {
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  startCursor: number | string;
  endCursor: number | string;
}

export interface PaginationResult<T> {
  data: T[];
  pageInfo: PageInfo;
  totalCount: number;
}
