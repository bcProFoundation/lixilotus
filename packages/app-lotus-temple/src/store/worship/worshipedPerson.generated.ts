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
export type WorshipedPersonFieldsFragment = {
  __typename?: 'WorshipedPerson';
  id: string;
  name: string;
  quote?: string | null;
  dateOfBirth?: any | null;
  dateOfDeath?: any | null;
  createdAt: any;
  updatedAt: any;
  avatar?: {
    __typename?: 'UploadDetail';
    id: string;
    upload: { __typename?: 'Upload'; id: string; sha: string; bucket?: string | null };
  } | null;
  country?: { __typename?: 'Country'; id: string; name: string } | null;
  state?: { __typename?: 'State'; id: string; name: string } | null;
  city?: { __typename?: 'City'; id: string; name: string } | null;
};

export type WorshipedPersonQueryVariables = Types.Exact<{
  id: Types.Scalars['String'];
}>;

export type WorshipedPersonQuery = {
  __typename?: 'Query';
  worshipedPerson: {
    __typename?: 'WorshipedPerson';
    id: string;
    name: string;
    quote?: string | null;
    dateOfBirth?: any | null;
    dateOfDeath?: any | null;
    createdAt: any;
    updatedAt: any;
    avatar?: {
      __typename?: 'UploadDetail';
      id: string;
      upload: { __typename?: 'Upload'; id: string; sha: string; bucket?: string | null };
    } | null;
    country?: { __typename?: 'Country'; id: string; name: string } | null;
    state?: { __typename?: 'State'; id: string; name: string } | null;
    city?: { __typename?: 'City'; id: string; name: string } | null;
  };
};

export type WorshipedPeopleQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']>;
  before?: Types.InputMaybe<Types.Scalars['String']>;
  first?: Types.InputMaybe<Types.Scalars['Int']>;
  last?: Types.InputMaybe<Types.Scalars['Int']>;
  orderBy?: Types.InputMaybe<Types.WorshipedPersonOrder>;
  query?: Types.InputMaybe<Types.Scalars['String']>;
  skip?: Types.InputMaybe<Types.Scalars['Int']>;
}>;

export type WorshipedPeopleQuery = {
  __typename?: 'Query';
  allWorshipedPerson: {
    __typename?: 'WorshipedPersonConnection';
    totalCount?: number | null;
    edges?: Array<{
      __typename?: 'WorshipedPersonEdge';
      cursor: string;
      node: {
        __typename?: 'WorshipedPerson';
        id: string;
        name: string;
        quote?: string | null;
        dateOfBirth?: any | null;
        dateOfDeath?: any | null;
        createdAt: any;
        updatedAt: any;
        avatar?: {
          __typename?: 'UploadDetail';
          id: string;
          upload: { __typename?: 'Upload'; id: string; sha: string; bucket?: string | null };
        } | null;
        country?: { __typename?: 'Country'; id: string; name: string } | null;
        state?: { __typename?: 'State'; id: string; name: string } | null;
        city?: { __typename?: 'City'; id: string; name: string } | null;
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

export type CreateWorshipedPersonMutationVariables = Types.Exact<{
  input: Types.CreateWorshipedPersonInput;
}>;

export type CreateWorshipedPersonMutation = {
  __typename?: 'Mutation';
  createWorshipedPerson: {
    __typename?: 'WorshipedPerson';
    id: string;
    name: string;
    quote?: string | null;
    dateOfBirth?: any | null;
    dateOfDeath?: any | null;
    createdAt: any;
    updatedAt: any;
    avatar?: {
      __typename?: 'UploadDetail';
      id: string;
      upload: { __typename?: 'Upload'; id: string; sha: string; bucket?: string | null };
    } | null;
    country?: { __typename?: 'Country'; id: string; name: string } | null;
    state?: { __typename?: 'State'; id: string; name: string } | null;
    city?: { __typename?: 'City'; id: string; name: string } | null;
  };
};

export type CreateWorshipMutationVariables = Types.Exact<{
  input: Types.CreateWorshipInput;
}>;

export type CreateWorshipMutation = {
  __typename?: 'Mutation';
  createWorship: {
    __typename?: 'WorshipedPerson';
    id: string;
    name: string;
    quote?: string | null;
    dateOfBirth?: any | null;
    dateOfDeath?: any | null;
    createdAt: any;
    updatedAt: any;
    avatar?: {
      __typename?: 'UploadDetail';
      id: string;
      upload: { __typename?: 'Upload'; id: string; sha: string; bucket?: string | null };
    } | null;
    country?: { __typename?: 'Country'; id: string; name: string } | null;
    state?: { __typename?: 'State'; id: string; name: string } | null;
    city?: { __typename?: 'City'; id: string; name: string } | null;
  };
};

export const WorshipedPersonFieldsFragmentDoc = `
    fragment WorshipedPersonFields on WorshipedPerson {
  id
  name
  avatar {
    id
    upload {
      id
      sha
      bucket
    }
  }
  quote
  dateOfBirth
  dateOfDeath
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
export const WorshipedPersonDocument = `
    query WorshipedPerson($id: String!) {
  worshipedPerson(id: $id) {
    ...WorshipedPersonFields
  }
}
    ${WorshipedPersonFieldsFragmentDoc}`;
export const WorshipedPeopleDocument = `
    query WorshipedPeople($after: String, $before: String, $first: Int = 20, $last: Int, $orderBy: WorshipedPersonOrder, $query: String, $skip: Int) {
  allWorshipedPerson(
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
        ...WorshipedPersonFields
      }
    }
    pageInfo {
      ...PageInfoFields
    }
  }
}
    ${WorshipedPersonFieldsFragmentDoc}
${PageInfoFieldsFragmentDoc}`;
export const CreateWorshipedPersonDocument = `
    mutation createWorshipedPerson($input: CreateWorshipedPersonInput!) {
  createWorshipedPerson(data: $input) {
    ...WorshipedPersonFields
  }
}
    ${WorshipedPersonFieldsFragmentDoc}`;
export const CreateWorshipDocument = `
    mutation createWorship($input: CreateWorshipInput!) {
  createWorship(data: $input) {
    ...WorshipedPersonFields
  }
}
    ${WorshipedPersonFieldsFragmentDoc}`;

const injectedRtkApi = api.injectEndpoints({
  endpoints: build => ({
    WorshipedPerson: build.query<WorshipedPersonQuery, WorshipedPersonQueryVariables>({
      query: variables => ({ document: WorshipedPersonDocument, variables })
    }),
    WorshipedPeople: build.query<WorshipedPeopleQuery, WorshipedPeopleQueryVariables | void>({
      query: variables => ({ document: WorshipedPeopleDocument, variables })
    }),
    createWorshipedPerson: build.mutation<CreateWorshipedPersonMutation, CreateWorshipedPersonMutationVariables>({
      query: variables => ({ document: CreateWorshipedPersonDocument, variables })
    }),
    createWorship: build.mutation<CreateWorshipMutation, CreateWorshipMutationVariables>({
      query: variables => ({ document: CreateWorshipDocument, variables })
    })
  })
});

export { injectedRtkApi as api };
export const {
  useWorshipedPersonQuery,
  useLazyWorshipedPersonQuery,
  useWorshipedPeopleQuery,
  useLazyWorshipedPeopleQuery,
  useCreateWorshipedPersonMutation,
  useCreateWorshipMutation
} = injectedRtkApi;
