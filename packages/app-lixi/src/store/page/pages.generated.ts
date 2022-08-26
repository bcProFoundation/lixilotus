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
export type PageQueryVariables = Types.Exact<{
  id: Types.Scalars['String'];
}>;


export type PageQuery = { __typename?: 'Query', page: { __typename?: 'Page', id: string, pageAccountId: number, name: string, title: string, description: string, avatar?: string | null, cover?: string | null, parentId?: string | null, address?: string | null, website?: string | null, createdAt: any, updatedAt: any } };

export type PagesQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']>;
  before?: Types.InputMaybe<Types.Scalars['String']>;
  first?: Types.InputMaybe<Types.Scalars['Int']>;
  last?: Types.InputMaybe<Types.Scalars['Int']>;
  orderBy?: Types.InputMaybe<Types.PageOrder>;
  query?: Types.InputMaybe<Types.Scalars['String']>;
  skip?: Types.InputMaybe<Types.Scalars['Int']>;
}>;


export type PagesQuery = { __typename?: 'Query', allPages: { __typename?: 'PageConnection', totalCount?: number | null, edges?: Array<{ __typename?: 'PageEdge', cursor: string, node: { __typename?: 'Page', id: string, pageAccountId: number, name: string, title: string, description: string, avatar?: string | null, cover?: string | null, parentId?: string | null, address?: string | null, website?: string | null, createdAt: any, updatedAt: any } }> | null, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null } } };

export type PageFieldsFragment = { __typename?: 'Page', id: string, pageAccountId: number, name: string, title: string, description: string, avatar?: string | null, cover?: string | null, parentId?: string | null, address?: string | null, website?: string | null, createdAt: any, updatedAt: any };

export type CreatePageMutationVariables = Types.Exact<{
  input: Types.CreatePageInput;
}>;


export type CreatePageMutation = { __typename?: 'Mutation', createPage: { __typename?: 'Page', id: string, pageAccountId: number, name: string, title: string, description: string, avatar?: string | null, cover?: string | null, parentId?: string | null, address?: string | null, website?: string | null, createdAt: any, updatedAt: any } };

export type UpdatePageMutationVariables = Types.Exact<{
  input: Types.UpdatePageInput;
}>;


export type UpdatePageMutation = { __typename?: 'Mutation', updatePage: { __typename?: 'Page', id: string, pageAccountId: number, name: string, title: string, description: string, avatar?: string | null, cover?: string | null, parentId?: string | null, address?: string | null, website?: string | null, createdAt: any, updatedAt: any } };

export const PageFieldsFragmentDoc = `
    fragment PageFields on Page {
  id
  pageAccountId
  name
  title
  description
  avatar
  cover
  parentId
  address
  website
  createdAt
  updatedAt
}
    `;
export const PageDocument = `
    query Page($id: String!) {
  page(id: $id) {
    ...PageFields
  }
}
    ${PageFieldsFragmentDoc}`;
export const PagesDocument = `
    query Pages($after: String, $before: String, $first: Int = 20, $last: Int = 20, $orderBy: PageOrder, $query: String, $skip: Int) {
  allPages(
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
        ...PageFields
      }
    }
    pageInfo {
      ...PageInfoFields
    }
  }
}
    ${PageFieldsFragmentDoc}
${PageInfoFieldsFragmentDoc}`;
export const CreatePageDocument = `
    mutation createPage($input: CreatePageInput!) {
  createPage(data: $input) {
    ...PageFields
  }
}
    ${PageFieldsFragmentDoc}`;
export const UpdatePageDocument = `
    mutation updatePage($input: UpdatePageInput!) {
  updatePage(data: $input) {
    ...PageFields
  }
}
    ${PageFieldsFragmentDoc}`;

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    Page: build.query<PageQuery, PageQueryVariables>({
      query: (variables) => ({ document: PageDocument, variables })
    }),
    Pages: build.query<PagesQuery, PagesQueryVariables | void>({
      query: (variables) => ({ document: PagesDocument, variables })
    }),
    createPage: build.mutation<CreatePageMutation, CreatePageMutationVariables>({
      query: (variables) => ({ document: CreatePageDocument, variables })
    }),
    updatePage: build.mutation<UpdatePageMutation, UpdatePageMutationVariables>({
      query: (variables) => ({ document: UpdatePageDocument, variables })
    }),
  }),
});

export { injectedRtkApi as api };
export const { usePageQuery, useLazyPageQuery, usePagesQuery, useLazyPagesQuery, useCreatePageMutation, useUpdatePageMutation } = injectedRtkApi;

