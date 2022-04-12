export interface PageInfo {
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  startCursor: number;
  endCursor: number;
}

export interface PaginationResult<T> {
  data: T[],
  pageInfo: PageInfo,
  totalCount: number;
}