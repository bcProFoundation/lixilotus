/* eslint-disable */ /**
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

import { PageInfoFieldsFragmentDoc } from '../../graphql/fragments/page-info-fields.fragment.generated';
import { api } from 'src/api/baseApi';
export type CommentQueryVariables = Types.Exact<{
  id: Types.Scalars['String'];
}>;

export type CommentQuery = {
  __typename?: 'Query';
  comment: {
    __typename?: 'Comment';
    id: string;
    commentText: string;
    commentByPublicKey?: string | null;
    commentToId: string;
    lotusBurnUp: number;
    lotusBurnDown: number;
    lotusBurnScore: number;
    createdAt: any;
    updatedAt: any;
    commentAccount: { __typename?: 'Account'; address: string; id: string; name: string };
  };
};

export type CommentsToPostIdQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']>;
  before?: Types.InputMaybe<Types.Scalars['String']>;
  first?: Types.InputMaybe<Types.Scalars['Int']>;
  last?: Types.InputMaybe<Types.Scalars['Int']>;
  orderBy?: Types.InputMaybe<Types.CommentOrder>;
  id?: Types.InputMaybe<Types.Scalars['String']>;
  skip?: Types.InputMaybe<Types.Scalars['Int']>;
}>;

export type CommentsToPostIdQuery = {
  __typename?: 'Query';
  allCommentsToPostId: {
    __typename?: 'CommentConnection';
    totalCount?: number | null;
    edges?: Array<{
      __typename?: 'CommentEdge';
      cursor: string;
      node: {
        __typename?: 'Comment';
        id: string;
        commentText: string;
        commentByPublicKey?: string | null;
        commentToId: string;
        lotusBurnUp: number;
        lotusBurnDown: number;
        lotusBurnScore: number;
        createdAt: any;
        updatedAt: any;
        commentAccount: { __typename?: 'Account'; address: string; id: string; name: string };
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

export type CommentFieldsFragment = {
  __typename?: 'Comment';
  id: string;
  commentText: string;
  commentByPublicKey?: string | null;
  commentToId: string;
  lotusBurnUp: number;
  lotusBurnDown: number;
  lotusBurnScore: number;
  createdAt: any;
  updatedAt: any;
  commentAccount: { __typename?: 'Account'; address: string; id: string; name: string };
};

export type CreateCommentMutationVariables = Types.Exact<{
  input: Types.CreateCommentInput;
}>;

export type CreateCommentMutation = {
  __typename?: 'Mutation';
  createComment: {
    __typename?: 'Comment';
    id: string;
    commentText: string;
    commentByPublicKey?: string | null;
    commentToId: string;
    lotusBurnUp: number;
    lotusBurnDown: number;
    lotusBurnScore: number;
    createdAt: any;
    updatedAt: any;
    commentAccount: { __typename?: 'Account'; address: string; id: string; name: string };
  };
};

export const CommentFieldsFragmentDoc = `
    fragment CommentFields on Comment {
  id
  commentText
  commentAccount {
    address
    id
    name
  }
  commentByPublicKey
  commentToId
  lotusBurnUp
  lotusBurnDown
  lotusBurnScore
  createdAt
  updatedAt
}
    `;
export const CommentDocument = `
    query Comment($id: String!) {
  comment(id: $id) {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export const CommentsToPostIdDocument = `
    query CommentsToPostId($after: String, $before: String, $first: Int = 20, $last: Int, $orderBy: CommentOrder, $id: String, $skip: Int) {
  allCommentsToPostId(
    after: $after
    before: $before
    first: $first
    last: $last
    orderBy: $orderBy
    id: $id
    skip: $skip
  ) {
    totalCount
    edges {
      cursor
      node {
        ...CommentFields
      }
    }
    pageInfo {
      ...PageInfoFields
    }
  }
}
    ${CommentFieldsFragmentDoc}
${PageInfoFieldsFragmentDoc}`;
export const CreateCommentDocument = `
    mutation createComment($input: CreateCommentInput!) {
  createComment(data: $input) {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;

const injectedRtkApi = api.injectEndpoints({
  endpoints: build => ({
    Comment: build.query<CommentQuery, CommentQueryVariables>({
      query: variables => ({ document: CommentDocument, variables })
    }),
    CommentsToPostId: build.query<CommentsToPostIdQuery, CommentsToPostIdQueryVariables | void>({
      query: variables => ({ document: CommentsToPostIdDocument, variables })
    }),
    createComment: build.mutation<CreateCommentMutation, CreateCommentMutationVariables>({
      query: variables => ({ document: CreateCommentDocument, variables })
    })
  })
});

export { injectedRtkApi as api };
export const {
  useCommentQuery,
  useLazyCommentQuery,
  useCommentsToPostIdQuery,
  useLazyCommentsToPostIdQuery,
  useCreateCommentMutation
} = injectedRtkApi;
