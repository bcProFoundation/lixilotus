export enum FilterType {
  PostsHome = 'postsHome',
  PostsPage = 'postsPage',
  PostsToken = 'postsToken'
}

export interface FilterBurnCommand {
  filterForType: FilterType;
  filterValue: number;
}
