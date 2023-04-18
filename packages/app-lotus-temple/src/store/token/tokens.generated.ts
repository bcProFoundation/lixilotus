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

import {
  PageInfoFieldsFragmentDoc,
  PostMeiliPageInfoFieldsFragmentDoc
} from '../../graphql/fragments/page-info-fields.fragment.generated';
import { api } from 'src/api/baseApi';
export type TokenQueryVariables = Types.Exact<{
  tokenId: Types.Scalars['String'];
}>;

export type TokenQuery = {
  __typename?: 'Query';
  token: {
    __typename?: 'Token';
    id: string;
    tokenId: string;
    tokenType: string;
    name: string;
    ticker: string;
    decimals: number;
    tokenDocumentUrl?: string | null;
    totalBurned?: string | null;
    totalMinted?: string | null;
    lotusBurnUp: number;
    lotusBurnDown: number;
    lotusBurnScore: number;
    initialTokenQuantity?: string | null;
    comments?: any | null;
    createdDate: any;
  };
};

export type TokensQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']>;
  before?: Types.InputMaybe<Types.Scalars['String']>;
  first?: Types.InputMaybe<Types.Scalars['Int']>;
  last?: Types.InputMaybe<Types.Scalars['Int']>;
  orderBy?: Types.InputMaybe<Types.TokenOrder>;
  query?: Types.InputMaybe<Types.Scalars['String']>;
  skip?: Types.InputMaybe<Types.Scalars['Int']>;
}>;

export type TokensQuery = {
  __typename?: 'Query';
  allTokens: {
    __typename?: 'TokenConnection';
    totalCount?: number | null;
    edges?: Array<{
      __typename?: 'TokenEdge';
      cursor: string;
      node: {
        __typename?: 'Token';
        id: string;
        tokenId: string;
        tokenType: string;
        name: string;
        ticker: string;
        decimals: number;
        tokenDocumentUrl?: string | null;
        totalBurned?: string | null;
        totalMinted?: string | null;
        lotusBurnUp: number;
        lotusBurnDown: number;
        lotusBurnScore: number;
        initialTokenQuantity?: string | null;
        comments?: any | null;
        createdDate: any;
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

export type TokenFieldsFragment = {
  __typename?: 'Token';
  id: string;
  tokenId: string;
  tokenType: string;
  name: string;
  ticker: string;
  decimals: number;
  tokenDocumentUrl?: string | null;
  totalBurned?: string | null;
  totalMinted?: string | null;
  lotusBurnUp: number;
  lotusBurnDown: number;
  lotusBurnScore: number;
  initialTokenQuantity?: string | null;
  comments?: any | null;
  createdDate: any;
};

export type CreateTokenMutationVariables = Types.Exact<{
  input: Types.CreateTokenInput;
}>;

export type CreateTokenMutation = {
  __typename?: 'Mutation';
  createToken: {
    __typename?: 'Token';
    id: string;
    tokenId: string;
    tokenType: string;
    name: string;
    ticker: string;
    decimals: number;
    tokenDocumentUrl?: string | null;
    totalBurned?: string | null;
    totalMinted?: string | null;
    lotusBurnUp: number;
    lotusBurnDown: number;
    lotusBurnScore: number;
    initialTokenQuantity?: string | null;
    comments?: any | null;
    createdDate: any;
  };
};

export const TokenFieldsFragmentDoc = `
    fragment TokenFields on Token {
  id
  tokenId
  tokenType
  name
  ticker
  decimals
  tokenDocumentUrl
  totalBurned
  totalMinted
  lotusBurnUp
  lotusBurnDown
  lotusBurnScore
  initialTokenQuantity
  comments
  createdDate
}
    `;
export const TokenDocument = `
    query Token($tokenId: String!) {
  token(tokenId: $tokenId) {
    ...TokenFields
  }
}
    ${TokenFieldsFragmentDoc}`;
export const TokensDocument = `
    query Tokens($after: String, $before: String, $first: Int = 20, $last: Int, $orderBy: TokenOrder, $query: String, $skip: Int) {
  allTokens(
    after: $after
    before: $before
    first: $first
    last: $last
    orderBy: $orderBy
    query: $query
    skip: $skip
  ) {
    totalCount
    edges {
      cursor
      node {
        ...TokenFields
      }
    }
    pageInfo {
      ...PageInfoFields
    }
  }
}
    ${TokenFieldsFragmentDoc}
${PageInfoFieldsFragmentDoc}`;
export const CreateTokenDocument = `
    mutation createToken($input: CreateTokenInput!) {
  createToken(data: $input) {
    ...TokenFields
  }
}
    ${TokenFieldsFragmentDoc}`;

const injectedRtkApi = api.injectEndpoints({
  endpoints: build => ({
    Token: build.query<TokenQuery, TokenQueryVariables>({
      query: variables => ({ document: TokenDocument, variables })
    }),
    Tokens: build.query<TokensQuery, TokensQueryVariables | void>({
      query: variables => ({ document: TokensDocument, variables })
    }),
    createToken: build.mutation<CreateTokenMutation, CreateTokenMutationVariables>({
      query: variables => ({ document: CreateTokenDocument, variables })
    })
  })
});

export { injectedRtkApi as api };
export const { useTokenQuery, useLazyTokenQuery, useTokensQuery, useLazyTokensQuery, useCreateTokenMutation } =
  injectedRtkApi;