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
  content?: InputMaybe<Scalars['String']>;
  cover: Scalars['String'];
  pageId: Scalars['String'];
  title: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createPage: Page;
  createPost: Post;
  updatePage: Page;
  updatePost: Post;
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
  country?: Maybe<Scalars['String']>;
  cover?: Maybe<Scalars['String']>;
  /** Identifies the date and time when the object was created. */
  createdAt: Scalars['DateTime'];
  description: Scalars['String'];
  id: Scalars['ID'];
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
  postInfo: PostInfo;
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
  Name = 'name',
  Title = 'title',
  UpdatedAt = 'updatedAt'
}

export type Post = {
  __typename?: 'Post';
  content: Scalars['String'];
  cover?: Maybe<Scalars['String']>;
  /** Identifies the date and time when the object was created. */
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  page?: Maybe<Page>;
  pageAccountId: Scalars['Int'];
  pageId?: Maybe<Scalars['String']>;
  title: Scalars['String'];
  /** Identifies the date and time when the object was last updated. */
  updatedAt: Scalars['DateTime'];
};

export type PostConnection = {
  __typename?: 'PostConnection';
  edges?: Maybe<Array<PostEdge>>;
  pageInfo: PageInfo;
  postInfo: PostInfo;
  totalCount?: Maybe<Scalars['Int']>;
};

export type PostEdge = {
  __typename?: 'PostEdge';
  cursor: Scalars['String'];
  node: Post;
};

export type PostInfo = {
  __typename?: 'PostInfo';
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
  Title = 'title',
  UpdatedAt = 'updatedAt'
}

export type Query = {
  __typename?: 'Query';
  allPages: PageConnection;
  allPosts: PostConnection;
  page: Page;
  post: Post;
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


export type QueryPageArgs = {
  id: Scalars['String'];
};


export type QueryPostArgs = {
  id: Scalars['String'];
};

export type Subscription = {
  __typename?: 'Subscription';
  pageCreated: Page;
  postCreated: Post;
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
  title?: InputMaybe<Scalars['String']>;
  website?: InputMaybe<Scalars['String']>;
};

export type UpdatePostInput = {
  content: Scalars['String'];
  cover: Scalars['String'];
  id: Scalars['ID'];
  title: Scalars['String'];
};
