export enum SearchBoxType {
  SearchPosts = 'searchPosts',
  SearchPage = 'searchPage',
  SearchToken = 'searchToken'
}

interface SearchConfig {
  searchValue: string;
  hashtags: Array<any>;
}

export interface SearchBoxCommand {
  searchType: string;
  searchValue: SearchConfig;
}
