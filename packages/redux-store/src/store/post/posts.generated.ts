/**
 *
 * THIS FILE IS AUTOGENERATED, DO NOT EDIT IT!
 *
 * instead, edit one of the `.graphql` files in this project and run
 *
 * yarn graphql-codegen
 *
 * for this file to be re-created
 */

import * as Types from '../../generated/types.generated';

import {
  PageInfoFieldsFragmentDoc,
  PostMeiliPageInfoFieldsFragmentDoc
} from '../../graphql/fragments/page-info-fields.fragment.generated';
import { api } from 'src/api/baseApi';
export type PostQueryVariables = Types.Exact<{
  id: Types.Scalars['String'];
}>;

export type PostQuery = {
  __typename?: 'Query';
  post: {
    __typename?: 'Post';
    id: string;
    content: string;
    lotusBurnUp: number;
    lotusBurnDown: number;
    lotusBurnScore: number;
    totalComments: number;
    createdAt: any;
    updatedAt: any;
    isFollow?: boolean | null;
    uploads?: Array<{
      __typename?: 'UploadDetail';
      id: string;
      upload: {
        __typename?: 'Upload';
        id: string;
        sha: string;
        bucket?: string | null;
        width?: string | null;
        height?: string | null;
        sha800?: string | null;
        sha320?: string | null;
        sha40?: string | null;
      };
    }> | null;
    postAccount: { __typename?: 'Account'; address: string; id: string; name: string };
    page?: {
      __typename?: 'Page';
      avatar?: string | null;
      name: string;
      id: string;
      createCommentFee: string;
      pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
    } | null;
    token?: { __typename?: 'Token'; id: string; name: string; tokenId: string } | null;
  };
};

export type PostsQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']>;
  before?: Types.InputMaybe<Types.Scalars['String']>;
  first?: Types.InputMaybe<Types.Scalars['Int']>;
  last?: Types.InputMaybe<Types.Scalars['Int']>;
  orderBy?: Types.InputMaybe<Types.PostOrder>;
  skip?: Types.InputMaybe<Types.Scalars['Int']>;
  accountId?: Types.InputMaybe<Types.Scalars['Int']>;
  minBurnFilter?: Types.InputMaybe<Types.Scalars['Int']>;
  isTop?: Types.InputMaybe<Types.Scalars['Boolean']>;
}>;

export type PostsQuery = {
  __typename?: 'Query';
  allPosts: {
    __typename?: 'PostConnection';
    totalCount?: number | null;
    edges?: Array<{
      __typename?: 'PostEdge';
      cursor: string;
      node: {
        __typename?: 'Post';
        id: string;
        content: string;
        lotusBurnUp: number;
        lotusBurnDown: number;
        lotusBurnScore: number;
        totalComments: number;
        createdAt: any;
        updatedAt: any;
        isFollow?: boolean | null;
        uploads?: Array<{
          __typename?: 'UploadDetail';
          id: string;
          upload: {
            __typename?: 'Upload';
            id: string;
            sha: string;
            bucket?: string | null;
            width?: string | null;
            height?: string | null;
            sha800?: string | null;
            sha320?: string | null;
            sha40?: string | null;
          };
        }> | null;
        postAccount: { __typename?: 'Account'; address: string; id: string; name: string };
        page?: {
          __typename?: 'Page';
          avatar?: string | null;
          name: string;
          id: string;
          createCommentFee: string;
          pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
        } | null;
        token?: { __typename?: 'Token'; id: string; name: string; tokenId: string } | null;
      };
    }> | null;
    pageInfo: {
      __typename?: 'PageInfo';
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    };
  };
};

export type OrphanPostsQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']>;
  before?: Types.InputMaybe<Types.Scalars['String']>;
  first?: Types.InputMaybe<Types.Scalars['Int']>;
  last?: Types.InputMaybe<Types.Scalars['Int']>;
  orderBy?: Types.InputMaybe<Types.PostOrder>;
  query?: Types.InputMaybe<Types.Scalars['String']>;
  skip?: Types.InputMaybe<Types.Scalars['Int']>;
  minBurnFilter?: Types.InputMaybe<Types.Scalars['Int']>;
}>;

export type OrphanPostsQuery = {
  __typename?: 'Query';
  allOrphanPosts: {
    __typename?: 'PostConnection';
    totalCount?: number | null;
    edges?: Array<{
      __typename?: 'PostEdge';
      cursor: string;
      node: {
        __typename?: 'Post';
        id: string;
        content: string;
        lotusBurnUp: number;
        lotusBurnDown: number;
        lotusBurnScore: number;
        totalComments: number;
        createdAt: any;
        updatedAt: any;
        isFollow?: boolean | null;
        uploads?: Array<{
          __typename?: 'UploadDetail';
          id: string;
          upload: {
            __typename?: 'Upload';
            id: string;
            sha: string;
            bucket?: string | null;
            width?: string | null;
            height?: string | null;
            sha800?: string | null;
            sha320?: string | null;
            sha40?: string | null;
          };
        }> | null;
        postAccount: { __typename?: 'Account'; address: string; id: string; name: string };
        page?: {
          __typename?: 'Page';
          avatar?: string | null;
          name: string;
          id: string;
          createCommentFee: string;
          pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
        } | null;
        token?: { __typename?: 'Token'; id: string; name: string; tokenId: string } | null;
      };
    }> | null;
    pageInfo: {
      __typename?: 'PageInfo';
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    };
  };
};

export type PostsByPageIdQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']>;
  before?: Types.InputMaybe<Types.Scalars['String']>;
  first?: Types.InputMaybe<Types.Scalars['Int']>;
  last?: Types.InputMaybe<Types.Scalars['Int']>;
  orderBy?: Types.InputMaybe<Types.PostOrder>;
  id?: Types.InputMaybe<Types.Scalars['String']>;
  skip?: Types.InputMaybe<Types.Scalars['Int']>;
  minBurnFilter?: Types.InputMaybe<Types.Scalars['Int']>;
}>;

export type PostsByPageIdQuery = {
  __typename?: 'Query';
  allPostsByPageId: {
    __typename?: 'PostConnection';
    totalCount?: number | null;
    edges?: Array<{
      __typename?: 'PostEdge';
      cursor: string;
      node: {
        __typename?: 'Post';
        id: string;
        content: string;
        lotusBurnUp: number;
        lotusBurnDown: number;
        lotusBurnScore: number;
        totalComments: number;
        createdAt: any;
        updatedAt: any;
        isFollow?: boolean | null;
        uploads?: Array<{
          __typename?: 'UploadDetail';
          id: string;
          upload: {
            __typename?: 'Upload';
            id: string;
            sha: string;
            bucket?: string | null;
            width?: string | null;
            height?: string | null;
            sha800?: string | null;
            sha320?: string | null;
            sha40?: string | null;
          };
        }> | null;
        postAccount: { __typename?: 'Account'; address: string; id: string; name: string };
        page?: {
          __typename?: 'Page';
          avatar?: string | null;
          name: string;
          id: string;
          createCommentFee: string;
          pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
        } | null;
        token?: { __typename?: 'Token'; id: string; name: string; tokenId: string } | null;
      };
    }> | null;
    pageInfo: {
      __typename?: 'PageInfo';
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    };
  };
};

export type PostsByUserIdQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']>;
  before?: Types.InputMaybe<Types.Scalars['String']>;
  first?: Types.InputMaybe<Types.Scalars['Int']>;
  last?: Types.InputMaybe<Types.Scalars['Int']>;
  orderBy?: Types.InputMaybe<Types.PostOrder>;
  id?: Types.InputMaybe<Types.Scalars['String']>;
  skip?: Types.InputMaybe<Types.Scalars['Int']>;
  minBurnFilter?: Types.InputMaybe<Types.Scalars['Int']>;
}>;

export type PostsByUserIdQuery = {
  __typename?: 'Query';
  allPostsByUserId: {
    __typename?: 'PostConnection';
    totalCount?: number | null;
    edges?: Array<{
      __typename?: 'PostEdge';
      cursor: string;
      node: {
        __typename?: 'Post';
        id: string;
        content: string;
        lotusBurnUp: number;
        lotusBurnDown: number;
        lotusBurnScore: number;
        totalComments: number;
        createdAt: any;
        updatedAt: any;
        isFollow?: boolean | null;
        uploads?: Array<{
          __typename?: 'UploadDetail';
          id: string;
          upload: {
            __typename?: 'Upload';
            id: string;
            sha: string;
            bucket?: string | null;
            width?: string | null;
            height?: string | null;
            sha800?: string | null;
            sha320?: string | null;
            sha40?: string | null;
          };
        }> | null;
        postAccount: { __typename?: 'Account'; address: string; id: string; name: string };
        page?: {
          __typename?: 'Page';
          avatar?: string | null;
          name: string;
          id: string;
          createCommentFee: string;
          pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
        } | null;
        token?: { __typename?: 'Token'; id: string; name: string; tokenId: string } | null;
      };
    }> | null;
    pageInfo: {
      __typename?: 'PageInfo';
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    };
  };
};

export type PostsByHashtagIdQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']>;
  before?: Types.InputMaybe<Types.Scalars['String']>;
  first?: Types.InputMaybe<Types.Scalars['Int']>;
  last?: Types.InputMaybe<Types.Scalars['Int']>;
  orderBy?: Types.InputMaybe<Types.PostOrder>;
  id?: Types.InputMaybe<Types.Scalars['String']>;
  skip?: Types.InputMaybe<Types.Scalars['Int']>;
  minBurnFilter?: Types.InputMaybe<Types.Scalars['Int']>;
}>;

export type PostsByHashtagIdQuery = {
  __typename?: 'Query';
  allPostsByHashtagId: {
    __typename?: 'PostConnection';
    totalCount?: number | null;
    edges?: Array<{
      __typename?: 'PostEdge';
      cursor: string;
      node: {
        __typename?: 'Post';
        id: string;
        content: string;
        lotusBurnUp: number;
        lotusBurnDown: number;
        lotusBurnScore: number;
        totalComments: number;
        createdAt: any;
        updatedAt: any;
        isFollow?: boolean | null;
        uploads?: Array<{
          __typename?: 'UploadDetail';
          id: string;
          upload: {
            __typename?: 'Upload';
            id: string;
            sha: string;
            bucket?: string | null;
            width?: string | null;
            height?: string | null;
            sha800?: string | null;
            sha320?: string | null;
            sha40?: string | null;
          };
        }> | null;
        postAccount: { __typename?: 'Account'; address: string; id: string; name: string };
        page?: {
          __typename?: 'Page';
          avatar?: string | null;
          name: string;
          id: string;
          createCommentFee: string;
          pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
        } | null;
        token?: { __typename?: 'Token'; id: string; name: string; tokenId: string } | null;
      };
    }> | null;
    pageInfo: {
      __typename?: 'PageInfo';
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    };
  };
};

export type PostsByTokenIdQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']>;
  before?: Types.InputMaybe<Types.Scalars['String']>;
  first?: Types.InputMaybe<Types.Scalars['Int']>;
  last?: Types.InputMaybe<Types.Scalars['Int']>;
  orderBy?: Types.InputMaybe<Types.PostOrder>;
  id?: Types.InputMaybe<Types.Scalars['String']>;
  skip?: Types.InputMaybe<Types.Scalars['Int']>;
  minBurnFilter?: Types.InputMaybe<Types.Scalars['Int']>;
}>;

export type PostsByTokenIdQuery = {
  __typename?: 'Query';
  allPostsByTokenId: {
    __typename?: 'PostConnection';
    totalCount?: number | null;
    edges?: Array<{
      __typename?: 'PostEdge';
      cursor: string;
      node: {
        __typename?: 'Post';
        id: string;
        content: string;
        lotusBurnUp: number;
        lotusBurnDown: number;
        lotusBurnScore: number;
        totalComments: number;
        createdAt: any;
        updatedAt: any;
        isFollow?: boolean | null;
        uploads?: Array<{
          __typename?: 'UploadDetail';
          id: string;
          upload: {
            __typename?: 'Upload';
            id: string;
            sha: string;
            bucket?: string | null;
            width?: string | null;
            height?: string | null;
            sha800?: string | null;
            sha320?: string | null;
            sha40?: string | null;
          };
        }> | null;
        postAccount: { __typename?: 'Account'; address: string; id: string; name: string };
        page?: {
          __typename?: 'Page';
          avatar?: string | null;
          name: string;
          id: string;
          createCommentFee: string;
          pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
        } | null;
        token?: { __typename?: 'Token'; id: string; name: string; tokenId: string } | null;
      };
    }> | null;
    pageInfo: {
      __typename?: 'PageInfo';
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    };
  };
};

export type PostsBySearchQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']>;
  before?: Types.InputMaybe<Types.Scalars['String']>;
  first?: Types.InputMaybe<Types.Scalars['Int']>;
  last?: Types.InputMaybe<Types.Scalars['Int']>;
  query?: Types.InputMaybe<Types.Scalars['String']>;
  minBurnFilter?: Types.InputMaybe<Types.Scalars['Int']>;
}>;

export type PostsBySearchQuery = {
  __typename?: 'Query';
  allPostsBySearch: {
    __typename?: 'PostResponse';
    edges?: Array<{
      __typename?: 'PostMeiliEdge';
      cursor?: string | null;
      node?: {
        __typename?: 'Post';
        id: string;
        content: string;
        lotusBurnUp: number;
        lotusBurnDown: number;
        lotusBurnScore: number;
        totalComments: number;
        createdAt: any;
        updatedAt: any;
        isFollow?: boolean | null;
        uploads?: Array<{
          __typename?: 'UploadDetail';
          id: string;
          upload: {
            __typename?: 'Upload';
            id: string;
            sha: string;
            bucket?: string | null;
            width?: string | null;
            height?: string | null;
            sha800?: string | null;
            sha320?: string | null;
            sha40?: string | null;
          };
        }> | null;
        postAccount: { __typename?: 'Account'; address: string; id: string; name: string };
        page?: {
          __typename?: 'Page';
          avatar?: string | null;
          name: string;
          id: string;
          createCommentFee: string;
          pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
        } | null;
        token?: { __typename?: 'Token'; id: string; name: string; tokenId: string } | null;
      } | null;
    }> | null;
    pageInfo?: {
      __typename?: 'PostMeiliPageInfo';
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    } | null;
  };
};

export type PostsBySearchWithHashtagQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']>;
  before?: Types.InputMaybe<Types.Scalars['String']>;
  first?: Types.InputMaybe<Types.Scalars['Int']>;
  last?: Types.InputMaybe<Types.Scalars['Int']>;
  query?: Types.InputMaybe<Types.Scalars['String']>;
  orderBy?: Types.InputMaybe<Types.PostOrder>;
  minBurnFilter?: Types.InputMaybe<Types.Scalars['Int']>;
  hashtags?: Types.InputMaybe<Array<Types.Scalars['String']> | Types.Scalars['String']>;
}>;

export type PostsBySearchWithHashtagQuery = {
  __typename?: 'Query';
  allPostsBySearchWithHashtag: {
    __typename?: 'PostResponse';
    edges?: Array<{
      __typename?: 'PostMeiliEdge';
      cursor?: string | null;
      node?: {
        __typename?: 'Post';
        id: string;
        content: string;
        lotusBurnUp: number;
        lotusBurnDown: number;
        lotusBurnScore: number;
        totalComments: number;
        createdAt: any;
        updatedAt: any;
        isFollow?: boolean | null;
        uploads?: Array<{
          __typename?: 'UploadDetail';
          id: string;
          upload: {
            __typename?: 'Upload';
            id: string;
            sha: string;
            bucket?: string | null;
            width?: string | null;
            height?: string | null;
            sha800?: string | null;
            sha320?: string | null;
            sha40?: string | null;
          };
        }> | null;
        postAccount: { __typename?: 'Account'; address: string; id: string; name: string };
        page?: {
          __typename?: 'Page';
          avatar?: string | null;
          name: string;
          id: string;
          createCommentFee: string;
          pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
        } | null;
        token?: { __typename?: 'Token'; id: string; name: string; tokenId: string } | null;
      } | null;
    }> | null;
    pageInfo?: {
      __typename?: 'PostMeiliPageInfo';
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    } | null;
  };
};

export type PostsBySearchWithHashtagAtPageQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']>;
  before?: Types.InputMaybe<Types.Scalars['String']>;
  first?: Types.InputMaybe<Types.Scalars['Int']>;
  last?: Types.InputMaybe<Types.Scalars['Int']>;
  query?: Types.InputMaybe<Types.Scalars['String']>;
  orderBy?: Types.InputMaybe<Types.PostOrder>;
  minBurnFilter?: Types.InputMaybe<Types.Scalars['Int']>;
  hashtags?: Types.InputMaybe<Array<Types.Scalars['String']> | Types.Scalars['String']>;
  pageId?: Types.InputMaybe<Types.Scalars['String']>;
}>;

export type PostsBySearchWithHashtagAtPageQuery = {
  __typename?: 'Query';
  allPostsBySearchWithHashtagAtPage: {
    __typename?: 'PostResponse';
    edges?: Array<{
      __typename?: 'PostMeiliEdge';
      cursor?: string | null;
      node?: {
        __typename?: 'Post';
        id: string;
        content: string;
        lotusBurnUp: number;
        lotusBurnDown: number;
        lotusBurnScore: number;
        totalComments: number;
        createdAt: any;
        updatedAt: any;
        isFollow?: boolean | null;
        uploads?: Array<{
          __typename?: 'UploadDetail';
          id: string;
          upload: {
            __typename?: 'Upload';
            id: string;
            sha: string;
            bucket?: string | null;
            width?: string | null;
            height?: string | null;
            sha800?: string | null;
            sha320?: string | null;
            sha40?: string | null;
          };
        }> | null;
        postAccount: { __typename?: 'Account'; address: string; id: string; name: string };
        page?: {
          __typename?: 'Page';
          avatar?: string | null;
          name: string;
          id: string;
          createCommentFee: string;
          pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
        } | null;
        token?: { __typename?: 'Token'; id: string; name: string; tokenId: string } | null;
      } | null;
    }> | null;
    pageInfo?: {
      __typename?: 'PostMeiliPageInfo';
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    } | null;
  };
};

export type PostsBySearchWithHashtagAtTokenQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']>;
  before?: Types.InputMaybe<Types.Scalars['String']>;
  first?: Types.InputMaybe<Types.Scalars['Int']>;
  last?: Types.InputMaybe<Types.Scalars['Int']>;
  query?: Types.InputMaybe<Types.Scalars['String']>;
  orderBy?: Types.InputMaybe<Types.PostOrder>;
  minBurnFilter?: Types.InputMaybe<Types.Scalars['Int']>;
  hashtags?: Types.InputMaybe<Array<Types.Scalars['String']> | Types.Scalars['String']>;
  tokenId?: Types.InputMaybe<Types.Scalars['String']>;
}>;

export type PostsBySearchWithHashtagAtTokenQuery = {
  __typename?: 'Query';
  allPostsBySearchWithHashtagAtToken: {
    __typename?: 'PostResponse';
    edges?: Array<{
      __typename?: 'PostMeiliEdge';
      cursor?: string | null;
      node?: {
        __typename?: 'Post';
        id: string;
        content: string;
        lotusBurnUp: number;
        lotusBurnDown: number;
        lotusBurnScore: number;
        totalComments: number;
        createdAt: any;
        updatedAt: any;
        isFollow?: boolean | null;
        uploads?: Array<{
          __typename?: 'UploadDetail';
          id: string;
          upload: {
            __typename?: 'Upload';
            id: string;
            sha: string;
            bucket?: string | null;
            width?: string | null;
            height?: string | null;
            sha800?: string | null;
            sha320?: string | null;
            sha40?: string | null;
          };
        }> | null;
        postAccount: { __typename?: 'Account'; address: string; id: string; name: string };
        page?: {
          __typename?: 'Page';
          avatar?: string | null;
          name: string;
          id: string;
          createCommentFee: string;
          pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
        } | null;
        token?: { __typename?: 'Token'; id: string; name: string; tokenId: string } | null;
      } | null;
    }> | null;
    pageInfo?: {
      __typename?: 'PostMeiliPageInfo';
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    } | null;
  };
};

export type PostFieldsFragment = {
  __typename?: 'Post';
  id: string;
  content: string;
  lotusBurnUp: number;
  lotusBurnDown: number;
  lotusBurnScore: number;
  totalComments: number;
  createdAt: any;
  updatedAt: any;
  isFollow?: boolean | null;
  uploads?: Array<{
    __typename?: 'UploadDetail';
    id: string;
    upload: {
      __typename?: 'Upload';
      id: string;
      sha: string;
      bucket?: string | null;
      width?: string | null;
      height?: string | null;
      sha800?: string | null;
      sha320?: string | null;
      sha40?: string | null;
    };
  }> | null;
  postAccount: { __typename?: 'Account'; address: string; id: string; name: string };
  page?: {
    __typename?: 'Page';
    avatar?: string | null;
    name: string;
    id: string;
    createCommentFee: string;
    pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
  } | null;
  token?: { __typename?: 'Token'; id: string; name: string; tokenId: string } | null;
};

export type PostMeiliFieldsFragment = {
  __typename?: 'Post';
  id: string;
  content: string;
  lotusBurnUp: number;
  lotusBurnDown: number;
  lotusBurnScore: number;
  totalComments: number;
  createdAt: any;
  updatedAt: any;
  isFollow?: boolean | null;
  uploads?: Array<{
    __typename?: 'UploadDetail';
    id: string;
    upload: {
      __typename?: 'Upload';
      id: string;
      sha: string;
      bucket?: string | null;
      width?: string | null;
      height?: string | null;
      sha800?: string | null;
      sha320?: string | null;
      sha40?: string | null;
    };
  }> | null;
  postAccount: { __typename?: 'Account'; address: string; id: string; name: string };
  page?: {
    __typename?: 'Page';
    avatar?: string | null;
    name: string;
    id: string;
    createCommentFee: string;
    pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
  } | null;
  token?: { __typename?: 'Token'; id: string; name: string; tokenId: string } | null;
};

export type CreatePostMutationVariables = Types.Exact<{
  input: Types.CreatePostInput;
}>;

export type CreatePostMutation = {
  __typename?: 'Mutation';
  createPost: {
    __typename?: 'Post';
    id: string;
    content: string;
    lotusBurnUp: number;
    lotusBurnDown: number;
    lotusBurnScore: number;
    totalComments: number;
    createdAt: any;
    updatedAt: any;
    isFollow?: boolean | null;
    uploads?: Array<{
      __typename?: 'UploadDetail';
      id: string;
      upload: {
        __typename?: 'Upload';
        id: string;
        sha: string;
        bucket?: string | null;
        width?: string | null;
        height?: string | null;
        sha800?: string | null;
        sha320?: string | null;
        sha40?: string | null;
      };
    }> | null;
    postAccount: { __typename?: 'Account'; address: string; id: string; name: string };
    page?: {
      __typename?: 'Page';
      avatar?: string | null;
      name: string;
      id: string;
      createCommentFee: string;
      pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
    } | null;
    token?: { __typename?: 'Token'; id: string; name: string; tokenId: string } | null;
  };
};

export type UpdatePostMutationVariables = Types.Exact<{
  input: Types.UpdatePostInput;
}>;

export type UpdatePostMutation = {
  __typename?: 'Mutation';
  updatePost: {
    __typename?: 'Post';
    id: string;
    content: string;
    lotusBurnUp: number;
    lotusBurnDown: number;
    lotusBurnScore: number;
    totalComments: number;
    createdAt: any;
    updatedAt: any;
    isFollow?: boolean | null;
    uploads?: Array<{
      __typename?: 'UploadDetail';
      id: string;
      upload: {
        __typename?: 'Upload';
        id: string;
        sha: string;
        bucket?: string | null;
        width?: string | null;
        height?: string | null;
        sha800?: string | null;
        sha320?: string | null;
        sha40?: string | null;
      };
    }> | null;
    postAccount: { __typename?: 'Account'; address: string; id: string; name: string };
    page?: {
      __typename?: 'Page';
      avatar?: string | null;
      name: string;
      id: string;
      createCommentFee: string;
      pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
    } | null;
    token?: { __typename?: 'Token'; id: string; name: string; tokenId: string } | null;
  };
};

export const PostFieldsFragmentDoc = `
    fragment PostFields on Post {
  id
  content
  uploads {
    id
    upload {
      id
      sha
      bucket
      width
      height
      sha800
      sha320
      sha40
    }
  }
  postAccount {
    address
    id
    name
  }
  page {
    avatar
    name
    id
    createCommentFee
    pageAccount {
      id
      name
      address
    }
  }
  token {
    id
    name
    tokenId
  }
  lotusBurnUp
  lotusBurnDown
  lotusBurnScore
  totalComments
  createdAt
  updatedAt
  isFollow
}
    `;
export const PostMeiliFieldsFragmentDoc = `
    fragment PostMeiliFields on Post {
  id
  content
  uploads {
    id
    upload {
      id
      sha
      bucket
      width
      height
      sha800
      sha320
      sha40
    }
  }
  postAccount {
    address
    id
    name
  }
  page {
    avatar
    name
    id
    createCommentFee
    pageAccount {
      id
      name
      address
    }
  }
  token {
    id
    name
    tokenId
  }
  token {
    id
    name
    tokenId
  }
  lotusBurnUp
  lotusBurnDown
  lotusBurnScore
  totalComments
  createdAt
  updatedAt
  isFollow
}
    `;
export const PostDocument = `
    query Post($id: String!) {
  post(id: $id) {
    ...PostFields
  }
}
    ${PostFieldsFragmentDoc}`;
export const PostsDocument = `
    query Posts($after: String, $before: String, $first: Int = 20, $last: Int, $orderBy: PostOrder, $skip: Int, $accountId: Int, $minBurnFilter: Int, $isTop: Boolean) {
  allPosts(
    after: $after
    before: $before
    first: $first
    last: $last
    orderBy: $orderBy
    skip: $skip
    accountId: $accountId
    minBurnFilter: $minBurnFilter
    isTop: $isTop
  ) {
    totalCount
    edges {
      cursor
      node {
        ...PostFields
      }
    }
    pageInfo {
      ...PageInfoFields
    }
  }
}
    ${PostFieldsFragmentDoc}
${PageInfoFieldsFragmentDoc}`;
export const OrphanPostsDocument = `
    query OrphanPosts($after: String, $before: String, $first: Int = 20, $last: Int, $orderBy: PostOrder, $query: String, $skip: Int, $minBurnFilter: Int) {
  allOrphanPosts(
    after: $after
    before: $before
    first: $first
    last: $last
    orderBy: $orderBy
    query: $query
    skip: $skip
    minBurnFilter: $minBurnFilter
  ) {
    totalCount
    edges {
      cursor
      node {
        ...PostFields
      }
    }
    pageInfo {
      ...PageInfoFields
    }
  }
}
    ${PostFieldsFragmentDoc}
${PageInfoFieldsFragmentDoc}`;
export const PostsByPageIdDocument = `
    query PostsByPageId($after: String, $before: String, $first: Int = 20, $last: Int, $orderBy: PostOrder, $id: String, $skip: Int, $minBurnFilter: Int) {
  allPostsByPageId(
    after: $after
    before: $before
    first: $first
    last: $last
    orderBy: $orderBy
    id: $id
    skip: $skip
    minBurnFilter: $minBurnFilter
  ) {
    totalCount
    edges {
      cursor
      node {
        ...PostFields
      }
    }
    pageInfo {
      ...PageInfoFields
    }
  }
}
    ${PostFieldsFragmentDoc}
${PageInfoFieldsFragmentDoc}`;
export const PostsByUserIdDocument = `
    query PostsByUserId($after: String, $before: String, $first: Int = 20, $last: Int, $orderBy: PostOrder, $id: String, $skip: Int, $minBurnFilter: Int) {
  allPostsByUserId(
    after: $after
    before: $before
    first: $first
    last: $last
    orderBy: $orderBy
    id: $id
    skip: $skip
    minBurnFilter: $minBurnFilter
  ) {
    totalCount
    edges {
      cursor
      node {
        ...PostFields
      }
    }
    pageInfo {
      ...PageInfoFields
    }
  }
}
    ${PostFieldsFragmentDoc}
${PageInfoFieldsFragmentDoc}`;
export const PostsByHashtagIdDocument = `
    query PostsByHashtagId($after: String, $before: String, $first: Int = 20, $last: Int, $orderBy: PostOrder, $id: String, $skip: Int, $minBurnFilter: Int) {
  allPostsByHashtagId(
    after: $after
    before: $before
    first: $first
    last: $last
    orderBy: $orderBy
    id: $id
    skip: $skip
    minBurnFilter: $minBurnFilter
  ) {
    totalCount
    edges {
      cursor
      node {
        ...PostFields
      }
    }
    pageInfo {
      ...PageInfoFields
    }
  }
}
    ${PostFieldsFragmentDoc}
${PageInfoFieldsFragmentDoc}`;
export const PostsByTokenIdDocument = `
    query PostsByTokenId($after: String, $before: String, $first: Int = 20, $last: Int, $orderBy: PostOrder, $id: String, $skip: Int, $minBurnFilter: Int) {
  allPostsByTokenId(
    after: $after
    before: $before
    first: $first
    last: $last
    orderBy: $orderBy
    id: $id
    skip: $skip
    minBurnFilter: $minBurnFilter
  ) {
    totalCount
    edges {
      cursor
      node {
        ...PostFields
      }
    }
    pageInfo {
      ...PageInfoFields
    }
  }
}
    ${PostFieldsFragmentDoc}
${PageInfoFieldsFragmentDoc}`;
export const PostsBySearchDocument = `
    query PostsBySearch($after: String, $before: String, $first: Int, $last: Int, $query: String, $minBurnFilter: Int) {
  allPostsBySearch(
    after: $after
    before: $before
    first: $first
    last: $last
    query: $query
    minBurnFilter: $minBurnFilter
  ) {
    edges {
      cursor
      node {
        ...PostMeiliFields
      }
    }
    pageInfo {
      ...PostMeiliPageInfoFields
    }
  }
}
    ${PostMeiliFieldsFragmentDoc}
${PostMeiliPageInfoFieldsFragmentDoc}`;
export const PostsBySearchWithHashtagDocument = `
    query PostsBySearchWithHashtag($after: String, $before: String, $first: Int, $last: Int, $query: String, $orderBy: PostOrder, $minBurnFilter: Int, $hashtags: [String!]) {
  allPostsBySearchWithHashtag(
    after: $after
    before: $before
    first: $first
    last: $last
    query: $query
    orderBy: $orderBy
    minBurnFilter: $minBurnFilter
    hashtags: $hashtags
  ) {
    edges {
      cursor
      node {
        ...PostMeiliFields
      }
    }
    pageInfo {
      ...PostMeiliPageInfoFields
    }
  }
}
    ${PostMeiliFieldsFragmentDoc}
${PostMeiliPageInfoFieldsFragmentDoc}`;
export const PostsBySearchWithHashtagAtPageDocument = `
    query PostsBySearchWithHashtagAtPage($after: String, $before: String, $first: Int, $last: Int, $query: String, $orderBy: PostOrder, $minBurnFilter: Int, $hashtags: [String!], $pageId: String) {
  allPostsBySearchWithHashtagAtPage(
    after: $after
    before: $before
    first: $first
    last: $last
    query: $query
    orderBy: $orderBy
    minBurnFilter: $minBurnFilter
    hashtags: $hashtags
    pageId: $pageId
  ) {
    edges {
      cursor
      node {
        ...PostMeiliFields
      }
    }
    pageInfo {
      ...PostMeiliPageInfoFields
    }
  }
}
    ${PostMeiliFieldsFragmentDoc}
${PostMeiliPageInfoFieldsFragmentDoc}`;
export const PostsBySearchWithHashtagAtTokenDocument = `
    query PostsBySearchWithHashtagAtToken($after: String, $before: String, $first: Int, $last: Int, $query: String, $orderBy: PostOrder, $minBurnFilter: Int, $hashtags: [String!], $tokenId: String) {
  allPostsBySearchWithHashtagAtToken(
    after: $after
    before: $before
    first: $first
    last: $last
    query: $query
    orderBy: $orderBy
    minBurnFilter: $minBurnFilter
    hashtags: $hashtags
    tokenId: $tokenId
  ) {
    edges {
      cursor
      node {
        ...PostMeiliFields
      }
    }
    pageInfo {
      ...PostMeiliPageInfoFields
    }
  }
}
    ${PostMeiliFieldsFragmentDoc}
${PostMeiliPageInfoFieldsFragmentDoc}`;
export const CreatePostDocument = `
    mutation createPost($input: CreatePostInput!) {
  createPost(data: $input) {
    ...PostFields
  }
}
    ${PostFieldsFragmentDoc}`;
export const UpdatePostDocument = `
    mutation updatePost($input: UpdatePostInput!) {
  updatePost(data: $input) {
    ...PostFields
  }
}
    ${PostFieldsFragmentDoc}`;

const injectedRtkApi = api.injectEndpoints({
  endpoints: build => ({
    Post: build.query<PostQuery, PostQueryVariables>({
      query: variables => ({ document: PostDocument, variables })
    }),
    Posts: build.query<PostsQuery, PostsQueryVariables | void>({
      query: variables => ({ document: PostsDocument, variables })
    }),
    OrphanPosts: build.query<OrphanPostsQuery, OrphanPostsQueryVariables | void>({
      query: variables => ({ document: OrphanPostsDocument, variables })
    }),
    PostsByPageId: build.query<PostsByPageIdQuery, PostsByPageIdQueryVariables | void>({
      query: variables => ({ document: PostsByPageIdDocument, variables })
    }),
    PostsByUserId: build.query<PostsByUserIdQuery, PostsByUserIdQueryVariables | void>({
      query: variables => ({ document: PostsByUserIdDocument, variables })
    }),
    PostsByHashtagId: build.query<PostsByHashtagIdQuery, PostsByHashtagIdQueryVariables | void>({
      query: variables => ({ document: PostsByHashtagIdDocument, variables })
    }),
    PostsByTokenId: build.query<PostsByTokenIdQuery, PostsByTokenIdQueryVariables | void>({
      query: variables => ({ document: PostsByTokenIdDocument, variables })
    }),
    PostsBySearch: build.query<PostsBySearchQuery, PostsBySearchQueryVariables | void>({
      query: variables => ({ document: PostsBySearchDocument, variables })
    }),
    PostsBySearchWithHashtag: build.query<PostsBySearchWithHashtagQuery, PostsBySearchWithHashtagQueryVariables | void>(
      {
        query: variables => ({ document: PostsBySearchWithHashtagDocument, variables })
      }
    ),
    PostsBySearchWithHashtagAtPage: build.query<
      PostsBySearchWithHashtagAtPageQuery,
      PostsBySearchWithHashtagAtPageQueryVariables | void
    >({
      query: variables => ({ document: PostsBySearchWithHashtagAtPageDocument, variables })
    }),
    PostsBySearchWithHashtagAtToken: build.query<
      PostsBySearchWithHashtagAtTokenQuery,
      PostsBySearchWithHashtagAtTokenQueryVariables | void
    >({
      query: variables => ({ document: PostsBySearchWithHashtagAtTokenDocument, variables })
    }),
    createPost: build.mutation<CreatePostMutation, CreatePostMutationVariables>({
      query: variables => ({ document: CreatePostDocument, variables })
    }),
    updatePost: build.mutation<UpdatePostMutation, UpdatePostMutationVariables>({
      query: variables => ({ document: UpdatePostDocument, variables })
    })
  })
});

export { injectedRtkApi as api };
export const {
  usePostQuery,
  useLazyPostQuery,
  usePostsQuery,
  useLazyPostsQuery,
  useOrphanPostsQuery,
  useLazyOrphanPostsQuery,
  usePostsByPageIdQuery,
  useLazyPostsByPageIdQuery,
  usePostsByUserIdQuery,
  useLazyPostsByUserIdQuery,
  usePostsByHashtagIdQuery,
  useLazyPostsByHashtagIdQuery,
  usePostsByTokenIdQuery,
  useLazyPostsByTokenIdQuery,
  usePostsBySearchQuery,
  useLazyPostsBySearchQuery,
  usePostsBySearchWithHashtagQuery,
  useLazyPostsBySearchWithHashtagQuery,
  usePostsBySearchWithHashtagAtPageQuery,
  useLazyPostsBySearchWithHashtagAtPageQuery,
  usePostsBySearchWithHashtagAtTokenQuery,
  useLazyPostsBySearchWithHashtagAtTokenQuery,
  useCreatePostMutation,
  useUpdatePostMutation
} = injectedRtkApi;
