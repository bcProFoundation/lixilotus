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

import { PageInfoFieldsFragmentDoc, PostMeiliPageInfoFieldsFragmentDoc } from '../../graphql/fragments/page-info-fields.fragment.generated';
import { api } from 'src/api/baseApi';
export type TempleFieldsFragment = { __typename?: 'Temple', id: string, name: string, achievement?: string | null, description?: string | null, alias?: string | null, religion?: string | null, address?: string | null, president?: string | null, website?: string | null, verified: boolean, totalWorshipAmount?: number | null, dateOfCompleted?: any | null, createdAt?: any | null, updatedAt?: any | null, account: { __typename?: 'Account', address: string, id: string, name: string }, avatar?: { __typename?: 'UploadDetail', id: string, upload: { __typename?: 'Upload', id: string, sha: string, bucket?: string | null, width?: string | null, height?: string | null, sha800?: string | null, sha320?: string | null, sha40?: string | null } } | null, cover?: { __typename?: 'UploadDetail', id: string, upload: { __typename?: 'Upload', id: string, sha: string, bucket?: string | null, width?: string | null, height?: string | null, sha800?: string | null, sha320?: string | null, sha40?: string | null } } | null, country?: { __typename?: 'Country', id: string, name: string } | null, state?: { __typename?: 'State', id: string, name: string } | null, city?: { __typename?: 'City', id: string, name: string } | null };

export type TempleQueryVariables = Types.Exact<{
  id: Types.Scalars['String'];
}>;


export type TempleQuery = { __typename?: 'Query', temple: { __typename?: 'Temple', id: string, name: string, achievement?: string | null, description?: string | null, alias?: string | null, religion?: string | null, address?: string | null, president?: string | null, website?: string | null, verified: boolean, totalWorshipAmount?: number | null, dateOfCompleted?: any | null, createdAt?: any | null, updatedAt?: any | null, account: { __typename?: 'Account', address: string, id: string, name: string }, avatar?: { __typename?: 'UploadDetail', id: string, upload: { __typename?: 'Upload', id: string, sha: string, bucket?: string | null, width?: string | null, height?: string | null, sha800?: string | null, sha320?: string | null, sha40?: string | null } } | null, cover?: { __typename?: 'UploadDetail', id: string, upload: { __typename?: 'Upload', id: string, sha: string, bucket?: string | null, width?: string | null, height?: string | null, sha800?: string | null, sha320?: string | null, sha40?: string | null } } | null, country?: { __typename?: 'Country', id: string, name: string } | null, state?: { __typename?: 'State', id: string, name: string } | null, city?: { __typename?: 'City', id: string, name: string } | null } };

export type TemplesQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']>;
  before?: Types.InputMaybe<Types.Scalars['String']>;
  first?: Types.InputMaybe<Types.Scalars['Int']>;
  last?: Types.InputMaybe<Types.Scalars['Int']>;
  orderBy?: Types.InputMaybe<Types.TempleOrder>;
  skip?: Types.InputMaybe<Types.Scalars['Int']>;
}>;


export type TemplesQuery = { __typename?: 'Query', allTemple: { __typename?: 'TempleConnection', totalCount?: number | null, edges?: Array<{ __typename?: 'TempleEdge', cursor: string, node: { __typename?: 'Temple', id: string, name: string, achievement?: string | null, description?: string | null, alias?: string | null, religion?: string | null, address?: string | null, president?: string | null, website?: string | null, verified: boolean, totalWorshipAmount?: number | null, dateOfCompleted?: any | null, createdAt?: any | null, updatedAt?: any | null, account: { __typename?: 'Account', address: string, id: string, name: string }, avatar?: { __typename?: 'UploadDetail', id: string, upload: { __typename?: 'Upload', id: string, sha: string, bucket?: string | null, width?: string | null, height?: string | null, sha800?: string | null, sha320?: string | null, sha40?: string | null } } | null, cover?: { __typename?: 'UploadDetail', id: string, upload: { __typename?: 'Upload', id: string, sha: string, bucket?: string | null, width?: string | null, height?: string | null, sha800?: string | null, sha320?: string | null, sha40?: string | null } } | null, country?: { __typename?: 'Country', id: string, name: string } | null, state?: { __typename?: 'State', id: string, name: string } | null, city?: { __typename?: 'City', id: string, name: string } | null } }> | null, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null } } };

export type TempleBySearchQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']>;
  before?: Types.InputMaybe<Types.Scalars['String']>;
  first?: Types.InputMaybe<Types.Scalars['Int']>;
  last?: Types.InputMaybe<Types.Scalars['Int']>;
  query?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type TempleBySearchQuery = { __typename?: 'Query', allTempleBySearch: { __typename?: 'TempleConnection', edges?: Array<{ __typename?: 'TempleEdge', cursor: string, node: { __typename?: 'Temple', id: string, name: string, achievement?: string | null, description?: string | null, alias?: string | null, religion?: string | null, address?: string | null, president?: string | null, website?: string | null, verified: boolean, totalWorshipAmount?: number | null, dateOfCompleted?: any | null, createdAt?: any | null, updatedAt?: any | null, account: { __typename?: 'Account', address: string, id: string, name: string }, avatar?: { __typename?: 'UploadDetail', id: string, upload: { __typename?: 'Upload', id: string, sha: string, bucket?: string | null, width?: string | null, height?: string | null, sha800?: string | null, sha320?: string | null, sha40?: string | null } } | null, cover?: { __typename?: 'UploadDetail', id: string, upload: { __typename?: 'Upload', id: string, sha: string, bucket?: string | null, width?: string | null, height?: string | null, sha800?: string | null, sha320?: string | null, sha40?: string | null } } | null, country?: { __typename?: 'Country', id: string, name: string } | null, state?: { __typename?: 'State', id: string, name: string } | null, city?: { __typename?: 'City', id: string, name: string } | null } }> | null, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null } } };

export type CreateTempleMutationVariables = Types.Exact<{
  input: Types.CreateTempleInput;
}>;


export type CreateTempleMutation = { __typename?: 'Mutation', createTemple: { __typename?: 'Temple', id: string, name: string, achievement?: string | null, description?: string | null, alias?: string | null, religion?: string | null, address?: string | null, president?: string | null, website?: string | null, verified: boolean, totalWorshipAmount?: number | null, dateOfCompleted?: any | null, createdAt?: any | null, updatedAt?: any | null, account: { __typename?: 'Account', address: string, id: string, name: string }, avatar?: { __typename?: 'UploadDetail', id: string, upload: { __typename?: 'Upload', id: string, sha: string, bucket?: string | null, width?: string | null, height?: string | null, sha800?: string | null, sha320?: string | null, sha40?: string | null } } | null, cover?: { __typename?: 'UploadDetail', id: string, upload: { __typename?: 'Upload', id: string, sha: string, bucket?: string | null, width?: string | null, height?: string | null, sha800?: string | null, sha320?: string | null, sha40?: string | null } } | null, country?: { __typename?: 'Country', id: string, name: string } | null, state?: { __typename?: 'State', id: string, name: string } | null, city?: { __typename?: 'City', id: string, name: string } | null } };

export const TempleFieldsFragmentDoc = `
    fragment TempleFields on Temple {
  id
  name
  account {
    address
    id
    name
  }
  avatar {
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
  cover {
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
  achievement
  description
  alias
  religion
  address
  president
  website
  verified
  totalWorshipAmount
  dateOfCompleted
  country {
    id
    name
  }
  state {
    id
    name
  }
  city {
    id
    name
  }
  createdAt
  updatedAt
}
    `;
export const TempleDocument = `
    query Temple($id: String!) {
  temple(id: $id) {
    ...TempleFields
  }
}
    ${TempleFieldsFragmentDoc}`;
export const TemplesDocument = `
    query Temples($after: String, $before: String, $first: Int = 20, $last: Int, $orderBy: TempleOrder, $skip: Int) {
  allTemple(
    after: $after
    before: $before
    first: $first
    last: $last
    orderBy: $orderBy
    skip: $skip
  ) {
    totalCount
    edges {
      cursor
      node {
        ...TempleFields
      }
    }
    pageInfo {
      ...PageInfoFields
    }
  }
}
    ${TempleFieldsFragmentDoc}
${PageInfoFieldsFragmentDoc}`;
export const TempleBySearchDocument = `
    query TempleBySearch($after: String, $before: String, $first: Int, $last: Int, $query: String) {
  allTempleBySearch(
    after: $after
    before: $before
    first: $first
    last: $last
    query: $query
  ) {
    edges {
      cursor
      node {
        ...TempleFields
      }
    }
    pageInfo {
      ...PageInfoFields
    }
  }
}
    ${TempleFieldsFragmentDoc}
${PageInfoFieldsFragmentDoc}`;
export const CreateTempleDocument = `
    mutation CreateTemple($input: CreateTempleInput!) {
  createTemple(data: $input) {
    ...TempleFields
  }
}
    ${TempleFieldsFragmentDoc}`;

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    Temple: build.query<TempleQuery, TempleQueryVariables>({
      query: (variables) => ({ document: TempleDocument, variables })
    }),
    Temples: build.query<TemplesQuery, TemplesQueryVariables | void>({
      query: (variables) => ({ document: TemplesDocument, variables })
    }),
    TempleBySearch: build.query<TempleBySearchQuery, TempleBySearchQueryVariables | void>({
      query: (variables) => ({ document: TempleBySearchDocument, variables })
    }),
    CreateTemple: build.mutation<CreateTempleMutation, CreateTempleMutationVariables>({
      query: (variables) => ({ document: CreateTempleDocument, variables })
    }),
  }),
});

export { injectedRtkApi as api };
export const { useTempleQuery, useLazyTempleQuery, useTemplesQuery, useLazyTemplesQuery, useTempleBySearchQuery, useLazyTempleBySearchQuery, useCreateTempleMutation } = injectedRtkApi;

