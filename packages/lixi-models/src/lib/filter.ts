export enum FilterType {
  postsHome = 'postsHome',
  postsPage = 'postsPage',
  postsToken = 'postsToken',
}

export interface FilterBurnCommand {
  filterForType: FilterType;
  filterValue: number;
}