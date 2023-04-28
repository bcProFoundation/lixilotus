export enum FilterType {
  PostsHome = 'postsHome',
  PostsPage = 'postsPage',
  PostsToken = 'postsToken',
  PostsProfile = 'postsProfile'
}

export interface FilterBurnCommand {
  filterForType: FilterType;
  filterValue: number;
}
