export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: any;
  /** An arbitrary-precision Decimal type */
  Decimal: any;
};

export type Account = {
  __typename?: 'Account';
  address: Scalars['String'];
  /** Identifies the date and time when the object was created. */
  createdAt: Scalars['DateTime'];
  encryptedMnemonic?: Maybe<Scalars['String']>;
  encryptedSecret?: Maybe<Scalars['String']>;
  followersCount?: Maybe<Scalars['Int']>;
  followingPagesCount?: Maybe<Scalars['Int']>;
  followingsCount?: Maybe<Scalars['Int']>;
  id: Scalars['ID'];
  language: Scalars['String'];
  mnemonic?: Maybe<Scalars['String']>;
  mnemonicHash?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  page?: Maybe<Page>;
  publicKey?: Maybe<Scalars['String']>;
  secret?: Maybe<Scalars['String']>;
  /** Identifies the date and time when the object was last updated. */
  updatedAt: Scalars['DateTime'];
};

export type AccountEdge = {
  __typename?: 'AccountEdge';
  cursor: Scalars['String'];
  node: Account;
};

export type City = {
  __typename?: 'City';
  country: Country;
  id: Scalars['ID'];
  name: Scalars['String'];
  state: State;
};

export type Comment = {
  __typename?: 'Comment';
  commentAccount: Account;
  commentAccountId?: Maybe<Scalars['Int']>;
  commentByPublicKey?: Maybe<Scalars['String']>;
  commentText: Scalars['String'];
  commentTo: Post;
  commentToId: Scalars['String'];
  content: Scalars['String'];
  /** Identifies the date and time when the object was created. */
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  lotusBurnDown: Scalars['Float'];
  lotusBurnScore: Scalars['Float'];
  lotusBurnUp: Scalars['Float'];
  /** Identifies the date and time when the object was last updated. */
  updatedAt: Scalars['DateTime'];
};

export type CommentConnection = {
  __typename?: 'CommentConnection';
  edges?: Maybe<Array<CommentEdge>>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']>;
};

export type CommentEdge = {
  __typename?: 'CommentEdge';
  cursor: Scalars['String'];
  node: Comment;
};

export type CommentOrder = {
  direction: OrderDirection;
  field: CommentOrderField;
};

/** Properties by which comment connections can be ordered. */
export enum CommentOrderField {
  CreatedAt = 'createdAt',
  Id = 'id',
  LotusBurnScore = 'lotusBurnScore',
  UpdatedAt = 'updatedAt'
}

export type Country = {
  __typename?: 'Country';
  capital: Scalars['String'];
  city: Array<City>;
  id: Scalars['ID'];
  name: Scalars['String'];
  state: Array<State>;
};

export type CreateAccountInput = {
  encryptedMnemonic: Scalars['String'];
  language: Scalars['String'];
  mnemonic: Scalars['String'];
  mnemonicHash: Scalars['String'];
};

export type CreateCommentInput = {
  commentByPublicKey?: InputMaybe<Scalars['String']>;
  commentText: Scalars['String'];
  commentToId: Scalars['String'];
  tipHex?: InputMaybe<Scalars['String']>;
};

export type CreateFollowAccountInput = {
  followerAccountId: Scalars['Int'];
  followingAccountId: Scalars['Int'];
};

export type CreateFollowPageInput = {
  accountId: Scalars['Int'];
  pageId: Scalars['String'];
};

export type CreatePageInput = {
  categoryId?: InputMaybe<Scalars['String']>;
  description: Scalars['String'];
  name: Scalars['String'];
};

export type CreatePostInput = {
  htmlContent: Scalars['String'];
  pageAccountId?: InputMaybe<Scalars['Int']>;
  pageId?: InputMaybe<Scalars['String']>;
  pureContent: Scalars['String'];
  tokenPrimaryId?: InputMaybe<Scalars['String']>;
  uploadCovers?: InputMaybe<Array<Scalars['String']>>;
};

export type CreateTokenInput = {
  tokenId: Scalars['String'];
};

export type CreateWorshipInput = {
  latitude?: InputMaybe<Scalars['Decimal']>;
  location?: InputMaybe<Scalars['String']>;
  longitude?: InputMaybe<Scalars['Decimal']>;
  worshipedAmount: Scalars['Float'];
  worshipedPersonId: Scalars['String'];
};

export type CreateWorshipedPersonInput = {
  avatar?: InputMaybe<Scalars['String']>;
  bio?: InputMaybe<Scalars['String']>;
  cityId?: InputMaybe<Scalars['String']>;
  countryId?: InputMaybe<Scalars['String']>;
  dateOfBirth?: InputMaybe<Scalars['String']>;
  dateOfDeath?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  quote?: InputMaybe<Scalars['String']>;
  stateId?: InputMaybe<Scalars['String']>;
  wikiDataId?: InputMaybe<Scalars['String']>;
};

export type DeleteFollowAccountInput = {
  followerAccountId: Scalars['Int'];
  followingAccountId: Scalars['Int'];
};

export type DeleteFollowPageInput = {
  accountId: Scalars['Int'];
  pageId: Scalars['String'];
};

export type FollowAccount = {
  __typename?: 'FollowAccount';
  /** Identifies the date and time when the object was created. */
  createdAt: Scalars['DateTime'];
  followerAccount?: Maybe<Account>;
  followerAccountId?: Maybe<Scalars['Int']>;
  followingAccount?: Maybe<Account>;
  followingAccountId?: Maybe<Scalars['Int']>;
  id?: Maybe<Scalars['ID']>;
  isFollowed?: Maybe<Scalars['Boolean']>;
  /** Identifies the date and time when the object was last updated. */
  updatedAt: Scalars['DateTime'];
};

export type FollowAccountConnection = {
  __typename?: 'FollowAccountConnection';
  edges?: Maybe<Array<FollowAccountEdge>>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']>;
};

export type FollowAccountEdge = {
  __typename?: 'FollowAccountEdge';
  cursor: Scalars['String'];
  node: FollowAccount;
};

export type FollowAccountOrder = {
  direction: OrderDirection;
  field: FollowAccountOrderField;
};

/** Properties by which follow account connections can be ordered. */
export enum FollowAccountOrderField {
  CreatedAt = 'createdAt',
  FollowerAccountId = 'followerAccountId',
  FollowingAccountId = 'followingAccountId',
  Id = 'id',
  UpdatedAt = 'updatedAt'
}

export type FollowPage = {
  __typename?: 'FollowPage';
  account?: Maybe<Account>;
  accountId?: Maybe<Scalars['Int']>;
  /** Identifies the date and time when the object was created. */
  createdAt: Scalars['DateTime'];
  id?: Maybe<Scalars['ID']>;
  isFollowed?: Maybe<Scalars['Boolean']>;
  page?: Maybe<Page>;
  pageId?: Maybe<Scalars['String']>;
  /** Identifies the date and time when the object was last updated. */
  updatedAt: Scalars['DateTime'];
};

export type FollowPageEdge = {
  __typename?: 'FollowPageEdge';
  cursor: Scalars['String'];
  node: FollowPage;
};

export type ImportAccountInput = {
  language?: InputMaybe<Scalars['String']>;
  mnemonic: Scalars['String'];
  mnemonicHash?: InputMaybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createAccount: Account;
  createComment: Comment;
  createFollowAccount: FollowAccount;
  createFollowPage: FollowPage;
  createPage: Page;
  createPost: Post;
  createToken: Token;
  createWorship: Worship;
  createWorshipedPerson: WorshipedPerson;
  deleteFollowAccount: Scalars['Boolean'];
  deleteFollowPage: Scalars['Boolean'];
  importAccount: Account;
  updatePage: Page;
  updatePost: Post;
};


export type MutationCreateAccountArgs = {
  data: CreateAccountInput;
};


export type MutationCreateCommentArgs = {
  data: CreateCommentInput;
};


export type MutationCreateFollowAccountArgs = {
  data: CreateFollowAccountInput;
};


export type MutationCreateFollowPageArgs = {
  data: CreateFollowPageInput;
};


export type MutationCreatePageArgs = {
  data: CreatePageInput;
};


export type MutationCreatePostArgs = {
  data: CreatePostInput;
};


export type MutationCreateTokenArgs = {
  data: CreateTokenInput;
};


export type MutationCreateWorshipArgs = {
  data: CreateWorshipInput;
};


export type MutationCreateWorshipedPersonArgs = {
  data: CreateWorshipedPersonInput;
};


export type MutationDeleteFollowAccountArgs = {
  data: DeleteFollowAccountInput;
};


export type MutationDeleteFollowPageArgs = {
  data: DeleteFollowPageInput;
};


export type MutationImportAccountArgs = {
  data: ImportAccountInput;
};


export type MutationUpdatePageArgs = {
  data: UpdatePageInput;
};


export type MutationUpdatePostArgs = {
  data: UpdatePostInput;
};

/** Possible directions in which to order a list of items when provided an `orderBy` argument. */
export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export type Page = {
  __typename?: 'Page';
  address?: Maybe<Scalars['String']>;
  avatar?: Maybe<Scalars['String']>;
  categoryId?: Maybe<Scalars['String']>;
  countryId?: Maybe<Scalars['String']>;
  cover?: Maybe<Scalars['String']>;
  /** Identifies the date and time when the object was created. */
  createdAt: Scalars['DateTime'];
  description: Scalars['String'];
  followersCount?: Maybe<Scalars['Int']>;
  id: Scalars['ID'];
  lotusBurnDown: Scalars['Float'];
  lotusBurnScore: Scalars['Float'];
  lotusBurnUp: Scalars['Float'];
  name: Scalars['String'];
  pageAccountId: Scalars['Int'];
  parent?: Maybe<Page>;
  parentId?: Maybe<Scalars['String']>;
  stateId?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  /** The sum of burn amount for every post on page */
  totalBurnForPage?: Maybe<Scalars['Float']>;
  /** Identifies the date and time when the object was last updated. */
  updatedAt: Scalars['DateTime'];
  website?: Maybe<Scalars['String']>;
};

export type PageConnection = {
  __typename?: 'PageConnection';
  edges?: Maybe<Array<PageEdge>>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']>;
};

export type PageEdge = {
  __typename?: 'PageEdge';
  cursor: Scalars['String'];
  node: Page;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
};

export type PageOrder = {
  direction: OrderDirection;
  field: PageOrderField;
};

/** Properties by which page connections can be ordered. */
export enum PageOrderField {
  CreatedAt = 'createdAt',
  Id = 'id',
  LotusBurnScore = 'lotusBurnScore',
  Name = 'name',
  Title = 'title',
  UpdatedAt = 'updatedAt'
}

export type Post = {
  __typename?: 'Post';
  content: Scalars['String'];
  /** Identifies the date and time when the object was created. */
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  lotusBurnDown: Scalars['Float'];
  lotusBurnScore: Scalars['Float'];
  lotusBurnUp: Scalars['Float'];
  page?: Maybe<Page>;
  pageAccount?: Maybe<Account>;
  pageAccountId?: Maybe<Scalars['Int']>;
  pageId?: Maybe<Scalars['String']>;
  postAccount: Account;
  postAccountId: Scalars['Int'];
  token?: Maybe<Token>;
  tokenId?: Maybe<Scalars['String']>;
  totalComments: Scalars['Int'];
  /** Identifies the date and time when the object was last updated. */
  updatedAt: Scalars['DateTime'];
  uploads?: Maybe<Array<UploadDetail>>;
};

export type PostConnection = {
  __typename?: 'PostConnection';
  edges?: Maybe<Array<PostEdge>>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']>;
};

export type PostEdge = {
  __typename?: 'PostEdge';
  cursor: Scalars['String'];
  node: Post;
};

export type PostMeiliEdge = {
  __typename?: 'PostMeiliEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<Post>;
};

export type PostMeiliPageInfo = {
  __typename?: 'PostMeiliPageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
};

export type PostOrder = {
  direction: OrderDirection;
  field: PostOrderField;
};

/** Properties by which post connections can be ordered. */
export enum PostOrderField {
  Content = 'content',
  CreatedAt = 'createdAt',
  Id = 'id',
  LotusBurnScore = 'lotusBurnScore',
  UpdatedAt = 'updatedAt'
}

export type PostResponse = {
  __typename?: 'PostResponse';
  edges?: Maybe<Array<PostMeiliEdge>>;
  pageInfo?: Maybe<PostMeiliPageInfo>;
};

export type Query = {
  __typename?: 'Query';
  allCommentsToPostId: CommentConnection;
  allFollowersByFollowing: FollowAccountConnection;
  allFollowingsByFollower: FollowAccountConnection;
  allOrphanPosts: PostConnection;
  allPages: PageConnection;
  allPosts: PostConnection;
  allPostsByPageId: PostConnection;
  allPostsBySearch: PostResponse;
  allPostsByTokenId: PostConnection;
  allPostsByUserId: PostConnection;
  allTokens: TokenConnection;
  allWorship: WorshipConnection;
  allWorshipedByPersonId: WorshipConnection;
  allWorshipedPerson: WorshipedPersonConnection;
  allWorshipedPersonBySearch: WorshipedPersonConnection;
  allWorshipedPersonByUserId: WorshipedPersonConnection;
  allWorshipedPersonSpecialDate: WorshipedPersonConnection;
  checkIsFollowedAccount: FollowAccount;
  checkIsFollowedPage: FollowPage;
  comment: Comment;
  getAccountByAddress: Account;
  page: Page;
  post: Post;
  token: Token;
  topPages: PageConnection;
  worship: Worship;
  worshipedPerson: WorshipedPerson;
};


export type QueryAllCommentsToPostIdArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  minBurnFilter?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CommentOrder>;
  skip?: InputMaybe<Scalars['Int']>;
};


export type QueryAllFollowersByFollowingArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  followingAccountId?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  minBurnFilter?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<FollowAccountOrder>;
  skip?: InputMaybe<Scalars['Int']>;
};


export type QueryAllFollowingsByFollowerArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  followerAccountId?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  minBurnFilter?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<FollowAccountOrder>;
  skip?: InputMaybe<Scalars['Int']>;
};


export type QueryAllOrphanPostsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  minBurnFilter?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PostOrder>;
  query?: InputMaybe<Scalars['String']>;
  skip?: InputMaybe<Scalars['Int']>;
};


export type QueryAllPagesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  minBurnFilter?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PageOrder>;
  query?: InputMaybe<Scalars['String']>;
  skip?: InputMaybe<Scalars['Int']>;
};


export type QueryAllPostsArgs = {
  accountId?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  minBurnFilter?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PostOrder>;
  skip?: InputMaybe<Scalars['Int']>;
};


export type QueryAllPostsByPageIdArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  minBurnFilter?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PostOrder>;
  skip?: InputMaybe<Scalars['Int']>;
};


export type QueryAllPostsBySearchArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  minBurnFilter?: InputMaybe<Scalars['Int']>;
  query?: InputMaybe<Scalars['String']>;
};


export type QueryAllPostsByTokenIdArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  minBurnFilter?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PostOrder>;
  skip?: InputMaybe<Scalars['Int']>;
};


export type QueryAllPostsByUserIdArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  minBurnFilter?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PostOrder>;
  skip?: InputMaybe<Scalars['Int']>;
};


export type QueryAllTokensArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  minBurnFilter?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenOrder>;
  query?: InputMaybe<Scalars['String']>;
  skip?: InputMaybe<Scalars['Int']>;
};


export type QueryAllWorshipArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  minBurnFilter?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<WorshipOrder>;
  skip?: InputMaybe<Scalars['Int']>;
};


export type QueryAllWorshipedByPersonIdArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  minBurnFilter?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<WorshipOrder>;
  skip?: InputMaybe<Scalars['Int']>;
};


export type QueryAllWorshipedPersonArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  minBurnFilter?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<WorshipedPersonOrder>;
  skip?: InputMaybe<Scalars['Int']>;
};


export type QueryAllWorshipedPersonBySearchArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  query?: InputMaybe<Scalars['String']>;
};


export type QueryAllWorshipedPersonByUserIdArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  minBurnFilter?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<WorshipedPersonOrder>;
  skip?: InputMaybe<Scalars['Int']>;
};


export type QueryAllWorshipedPersonSpecialDateArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  minBurnFilter?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<WorshipedPersonOrder>;
  skip?: InputMaybe<Scalars['Int']>;
};


export type QueryCheckIsFollowedAccountArgs = {
  address: Scalars['String'];
};


export type QueryCheckIsFollowedPageArgs = {
  pageId: Scalars['String'];
};


export type QueryCommentArgs = {
  id: Scalars['String'];
};


export type QueryGetAccountByAddressArgs = {
  address: Scalars['String'];
};


export type QueryPageArgs = {
  id: Scalars['String'];
};


export type QueryPostArgs = {
  id: Scalars['String'];
};


export type QueryTokenArgs = {
  tokenId: Scalars['String'];
};


export type QueryTopPagesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  minBurnFilter?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PageOrder>;
  query?: InputMaybe<Scalars['String']>;
  skip?: InputMaybe<Scalars['Int']>;
};


export type QueryWorshipArgs = {
  id: Scalars['String'];
};


export type QueryWorshipedPersonArgs = {
  id: Scalars['String'];
};

export type State = {
  __typename?: 'State';
  city: Array<City>;
  country: City;
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type Subscription = {
  __typename?: 'Subscription';
  accountCreated: Account;
  commentCreated: Comment;
  followAccountCreated: FollowAccount;
  pageCreated: Page;
  postCreated: Post;
  tokenCreated: Token;
  worshipedPersonCreated: WorshipedPerson;
};

export type Token = {
  __typename?: 'Token';
  /** Identifies the date and time when the object was last comments. */
  comments?: Maybe<Scalars['DateTime']>;
  /** Identifies the date and time when the object was created. */
  createdDate: Scalars['DateTime'];
  decimals: Scalars['Int'];
  id: Scalars['ID'];
  initialTokenQuantity?: Maybe<Scalars['String']>;
  lotusBurnDown: Scalars['Float'];
  lotusBurnScore: Scalars['Float'];
  lotusBurnUp: Scalars['Float'];
  name: Scalars['String'];
  ticker: Scalars['String'];
  tokenDocumentUrl?: Maybe<Scalars['String']>;
  tokenId: Scalars['String'];
  tokenType: Scalars['String'];
  totalBurned?: Maybe<Scalars['String']>;
  totalMinted?: Maybe<Scalars['String']>;
};

export type TokenConnection = {
  __typename?: 'TokenConnection';
  edges?: Maybe<Array<TokenEdge>>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']>;
};

export type TokenEdge = {
  __typename?: 'TokenEdge';
  cursor: Scalars['String'];
  node: Token;
};

export type TokenOrder = {
  direction: OrderDirection;
  field: TokenOrderField;
};

/** Properties by which token connections can be ordered. */
export enum TokenOrderField {
  CreatedDate = 'createdDate',
  Id = 'id',
  LotusBurnDown = 'lotusBurnDown',
  LotusBurnScore = 'lotusBurnScore',
  LotusBurnUp = 'lotusBurnUp',
  Name = 'name',
  Ticker = 'ticker',
  TokenId = 'tokenId'
}

export type UpdatePageInput = {
  address?: InputMaybe<Scalars['String']>;
  avatar?: InputMaybe<Scalars['String']>;
  categoryId?: InputMaybe<Scalars['String']>;
  countryId?: InputMaybe<Scalars['String']>;
  cover?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
  parentId?: InputMaybe<Scalars['String']>;
  stateId?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
  website?: InputMaybe<Scalars['String']>;
};

export type UpdatePostInput = {
  htmlContent: Scalars['String'];
  id: Scalars['ID'];
  pureContent: Scalars['String'];
};

export type Upload = {
  __typename?: 'Upload';
  bucket?: Maybe<Scalars['String']>;
  height?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  sha: Scalars['String'];
  sha40?: Maybe<Scalars['String']>;
  sha320?: Maybe<Scalars['String']>;
  sha800?: Maybe<Scalars['String']>;
  width?: Maybe<Scalars['String']>;
};

export type UploadDetail = {
  __typename?: 'UploadDetail';
  id: Scalars['ID'];
  upload: Upload;
};

export type Worship = {
  __typename?: 'Worship';
  account: Account;
  /** Identifies the date and time when the object was created. */
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  latitude?: Maybe<Scalars['Decimal']>;
  location?: Maybe<Scalars['String']>;
  longitude?: Maybe<Scalars['Decimal']>;
  /** Identifies the date and time when the object was last updated. */
  updatedAt: Scalars['DateTime'];
  worshipedAmount: Scalars['Float'];
  worshipedPerson: WorshipedPerson;
};

export type WorshipConnection = {
  __typename?: 'WorshipConnection';
  edges?: Maybe<Array<WorshipEdge>>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']>;
};

export type WorshipEdge = {
  __typename?: 'WorshipEdge';
  cursor: Scalars['String'];
  node: Worship;
};

export type WorshipOrder = {
  direction: OrderDirection;
  field: WorshipOrderField;
};

/** Properties by which worship connections can be ordered. */
export enum WorshipOrderField {
  CreatedAt = 'createdAt',
  Id = 'id',
  UpdatedAt = 'updatedAt',
  WorshipedAmount = 'worshipedAmount'
}

export type WorshipedPerson = {
  __typename?: 'WorshipedPerson';
  achievement?: Maybe<Scalars['String']>;
  alias?: Maybe<Scalars['String']>;
  avatar?: Maybe<UploadDetail>;
  bio?: Maybe<Scalars['String']>;
  city?: Maybe<City>;
  country?: Maybe<Country>;
  countryOfCitizenship?: Maybe<Scalars['String']>;
  /** Identifies the date and time when the object was created. */
  createdAt?: Maybe<Scalars['DateTime']>;
  dateOfBirth?: Maybe<Scalars['DateTime']>;
  dateOfDeath?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  placeOfBirth?: Maybe<Scalars['String']>;
  placeOfBurial?: Maybe<Scalars['String']>;
  placeOfDeath?: Maybe<Scalars['String']>;
  quote?: Maybe<Scalars['String']>;
  religion?: Maybe<Scalars['String']>;
  state?: Maybe<State>;
  totalWorshipAmount?: Maybe<Scalars['Int']>;
  /** Identifies the date and time when the object was last updated. */
  updatedAt?: Maybe<Scalars['DateTime']>;
  wikiAvatar?: Maybe<Scalars['String']>;
  wikiDataId?: Maybe<Scalars['String']>;
};

export type WorshipedPersonConnection = {
  __typename?: 'WorshipedPersonConnection';
  edges?: Maybe<Array<WorshipedPersonEdge>>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']>;
};

export type WorshipedPersonEdge = {
  __typename?: 'WorshipedPersonEdge';
  cursor: Scalars['String'];
  node: WorshipedPerson;
};

export type WorshipedPersonOrder = {
  direction: OrderDirection;
  field: WorshipedPersonOrderField;
};

/** Properties by which worshiped person connections can be ordered. */
export enum WorshipedPersonOrderField {
  CreatedAt = 'createdAt',
  Id = 'id',
  TotalWorshipAmount = 'totalWorshipAmount',
  UpdatedAt = 'updatedAt'
}
