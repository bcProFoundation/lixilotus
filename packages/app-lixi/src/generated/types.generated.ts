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
};

export type Account = {
  __typename?: 'Account';
  address: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
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

export type CreateCommentInput = {
  commentByPublicKey?: InputMaybe<Scalars['String']>;
  commentText: Scalars['String'];
  commentToId: Scalars['String'];
};

export type CreatePageInput = {
  address: Scalars['String'];
  avatar: Scalars['String'];
  country: Scalars['String'];
  cover: Scalars['String'];
  description: Scalars['String'];
  name: Scalars['String'];
  parentId?: InputMaybe<Scalars['String']>;
  state: Scalars['String'];
  title: Scalars['String'];
  website: Scalars['String'];
};

export type CreatePostInput = {
  htmlContent: Scalars['String'];
  pageAccountId?: InputMaybe<Scalars['Int']>;
  pageId?: InputMaybe<Scalars['String']>;
  pureContent: Scalars['String'];
  tokenPrimaryId?: InputMaybe<Scalars['String']>;
  uploadCovers?: InputMaybe<Array<Scalars['String']>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createComment: Comment;
  createPage: Page;
  createPost: Post;
  updatePage: Page;
};

export type MutationCreateCommentArgs = {
  data: CreateCommentInput;
};

export type MutationCreatePageArgs = {
  data: CreatePageInput;
};

export type MutationCreatePostArgs = {
  data: CreatePostInput;
};

export type MutationUpdatePageArgs = {
  data: UpdatePageInput;
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
  country?: Maybe<Scalars['String']>;
  cover?: Maybe<Scalars['String']>;
  /** Identifies the date and time when the object was created. */
  createdAt: Scalars['DateTime'];
  description: Scalars['String'];
  id: Scalars['ID'];
  lotusBurnDown: Scalars['Float'];
  lotusBurnScore: Scalars['Float'];
  lotusBurnUp: Scalars['Float'];
  name: Scalars['String'];
  pageAccountId: Scalars['Int'];
  parent?: Maybe<Page>;
  parentId?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  title: Scalars['String'];
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
  pageAccount: Account;
  pageAccountId: Scalars['Int'];
  pageId?: Maybe<Scalars['String']>;
  postAccount: Account;
  postAccountId: Scalars['Int'];
  token?: Maybe<Token>;
  tokenId?: Maybe<Scalars['String']>;
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
  allPages: PageConnection;
  allPosts: PostConnection;
  allPostsByPageId: PostConnection;
  allPostsBySearch: PostResponse;
  allPostsByTokenId: PostConnection;
  allPostsByUserId: PostConnection;
  comment: Comment;
  page: Page;
  post: Post;
};

export type QueryAllCommentsToPostIdArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CommentOrder>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type QueryAllPagesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PageOrder>;
  query?: InputMaybe<Scalars['String']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type QueryAllPostsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PostOrder>;
  query?: InputMaybe<Scalars['String']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type QueryAllPostsByPageIdArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PostOrder>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type QueryAllPostsBySearchArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  query?: InputMaybe<Scalars['String']>;
};

export type QueryAllPostsByTokenIdArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PostOrder>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type QueryAllPostsByUserIdArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PostOrder>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type QueryCommentArgs = {
  id: Scalars['String'];
};

export type QueryPageArgs = {
  id: Scalars['String'];
};

export type QueryPostArgs = {
  id: Scalars['String'];
};

export type Subscription = {
  __typename?: 'Subscription';
  commentCreated: Comment;
  pageCreated: Page;
  postCreated: Post;
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

export type TokenEdge = {
  __typename?: 'TokenEdge';
  cursor: Scalars['String'];
  node: Token;
};

export type UpdatePageInput = {
  address?: InputMaybe<Scalars['String']>;
  avatar?: InputMaybe<Scalars['String']>;
  country?: InputMaybe<Scalars['String']>;
  cover?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
  parentId?: InputMaybe<Scalars['String']>;
  state?: InputMaybe<Scalars['String']>;
  title: Scalars['String'];
  website?: InputMaybe<Scalars['String']>;
};

export type Upload = {
  __typename?: 'Upload';
  bucket?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  sha: Scalars['String'];
};

export type UploadDetail = {
  __typename?: 'UploadDetail';
  id: Scalars['ID'];
  upload: Upload;
};
