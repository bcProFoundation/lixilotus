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
export type PageMessageSessionFieldsFragment = {
  __typename?: 'PageMessageSession';
  id: string;
  latestMessage?: string | null;
  lixiClaimCode?: string | null;
  sessionOpenedAt?: any | null;
  sessionClosedAt?: any | null;
  status: Types.PageMessageSessionStatus;
  createdAt?: any | null;
  updatedAt?: any | null;
  page: {
    __typename?: 'Page';
    id: string;
    name: string;
    avatar?: string | null;
    pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
  };
  account: { __typename?: 'Account'; id: string; name: string; address: string; avatar?: string | null };
  lixi?: {
    __typename?: 'LixiModel';
    id: string;
    name: string;
    amount: string;
    expiryAt?: any | null;
    activationAt?: any | null;
    status: string;
  } | null;
};

export type PageMessageSessionQueryVariables = Types.Exact<{
  id: Types.Scalars['String'];
}>;

export type PageMessageSessionQuery = {
  __typename?: 'Query';
  pageMessageSession: {
    __typename?: 'PageMessageSession';
    id: string;
    latestMessage?: string | null;
    lixiClaimCode?: string | null;
    sessionOpenedAt?: any | null;
    sessionClosedAt?: any | null;
    status: Types.PageMessageSessionStatus;
    createdAt?: any | null;
    updatedAt?: any | null;
    page: {
      __typename?: 'Page';
      id: string;
      name: string;
      avatar?: string | null;
      pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
    };
    account: { __typename?: 'Account'; id: string; name: string; address: string; avatar?: string | null };
    lixi?: {
      __typename?: 'LixiModel';
      id: string;
      name: string;
      amount: string;
      expiryAt?: any | null;
      activationAt?: any | null;
      status: string;
    } | null;
  };
};

export type OpenPageMessageSessionByPageIdQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']>;
  before?: Types.InputMaybe<Types.Scalars['String']>;
  first?: Types.InputMaybe<Types.Scalars['Int']>;
  last?: Types.InputMaybe<Types.Scalars['Int']>;
  id?: Types.InputMaybe<Types.Scalars['String']>;
  orderBy?: Types.InputMaybe<Types.PageMessageSessionOrder>;
  skip?: Types.InputMaybe<Types.Scalars['Int']>;
}>;

export type OpenPageMessageSessionByPageIdQuery = {
  __typename?: 'Query';
  allOpenPageMessageSessionByPageId: {
    __typename?: 'PageMessageSessionConnection';
    totalCount?: number | null;
    edges?: Array<{
      __typename?: 'PageMessageSessionEdge';
      cursor: string;
      node: {
        __typename?: 'PageMessageSession';
        id: string;
        latestMessage?: string | null;
        lixiClaimCode?: string | null;
        sessionOpenedAt?: any | null;
        sessionClosedAt?: any | null;
        status: Types.PageMessageSessionStatus;
        createdAt?: any | null;
        updatedAt?: any | null;
        page: {
          __typename?: 'Page';
          id: string;
          name: string;
          avatar?: string | null;
          pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
        };
        account: { __typename?: 'Account'; id: string; name: string; address: string; avatar?: string | null };
        lixi?: {
          __typename?: 'LixiModel';
          id: string;
          name: string;
          amount: string;
          expiryAt?: any | null;
          activationAt?: any | null;
          status: string;
        } | null;
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

export type PendingPageMessageSessionByPageIdQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']>;
  before?: Types.InputMaybe<Types.Scalars['String']>;
  first?: Types.InputMaybe<Types.Scalars['Int']>;
  last?: Types.InputMaybe<Types.Scalars['Int']>;
  id?: Types.InputMaybe<Types.Scalars['String']>;
  orderBy?: Types.InputMaybe<Types.PageMessageSessionOrder>;
  skip?: Types.InputMaybe<Types.Scalars['Int']>;
}>;

export type PendingPageMessageSessionByPageIdQuery = {
  __typename?: 'Query';
  allPendingPageMessageSessionByPageId: {
    __typename?: 'PageMessageSessionConnection';
    totalCount?: number | null;
    edges?: Array<{
      __typename?: 'PageMessageSessionEdge';
      cursor: string;
      node: {
        __typename?: 'PageMessageSession';
        id: string;
        latestMessage?: string | null;
        lixiClaimCode?: string | null;
        sessionOpenedAt?: any | null;
        sessionClosedAt?: any | null;
        status: Types.PageMessageSessionStatus;
        createdAt?: any | null;
        updatedAt?: any | null;
        page: {
          __typename?: 'Page';
          id: string;
          name: string;
          avatar?: string | null;
          pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
        };
        account: { __typename?: 'Account'; id: string; name: string; address: string; avatar?: string | null };
        lixi?: {
          __typename?: 'LixiModel';
          id: string;
          name: string;
          amount: string;
          expiryAt?: any | null;
          activationAt?: any | null;
          status: string;
        } | null;
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

export type OpenPageMessageSessionByAccountIdQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']>;
  before?: Types.InputMaybe<Types.Scalars['String']>;
  first?: Types.InputMaybe<Types.Scalars['Int']>;
  last?: Types.InputMaybe<Types.Scalars['Int']>;
  id?: Types.InputMaybe<Types.Scalars['Int']>;
  orderBy?: Types.InputMaybe<Types.PageMessageSessionOrder>;
  skip?: Types.InputMaybe<Types.Scalars['Int']>;
}>;

export type OpenPageMessageSessionByAccountIdQuery = {
  __typename?: 'Query';
  allOpenPageMessageSessionByAccountId: {
    __typename?: 'PageMessageSessionConnection';
    totalCount?: number | null;
    edges?: Array<{
      __typename?: 'PageMessageSessionEdge';
      cursor: string;
      node: {
        __typename?: 'PageMessageSession';
        id: string;
        latestMessage?: string | null;
        lixiClaimCode?: string | null;
        sessionOpenedAt?: any | null;
        sessionClosedAt?: any | null;
        status: Types.PageMessageSessionStatus;
        createdAt?: any | null;
        updatedAt?: any | null;
        page: {
          __typename?: 'Page';
          id: string;
          name: string;
          avatar?: string | null;
          pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
        };
        account: { __typename?: 'Account'; id: string; name: string; address: string; avatar?: string | null };
        lixi?: {
          __typename?: 'LixiModel';
          id: string;
          name: string;
          amount: string;
          expiryAt?: any | null;
          activationAt?: any | null;
          status: string;
        } | null;
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

export type PendingPageMessageSessionByAccountIdQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']>;
  before?: Types.InputMaybe<Types.Scalars['String']>;
  first?: Types.InputMaybe<Types.Scalars['Int']>;
  last?: Types.InputMaybe<Types.Scalars['Int']>;
  id?: Types.InputMaybe<Types.Scalars['Int']>;
  orderBy?: Types.InputMaybe<Types.PageMessageSessionOrder>;
  skip?: Types.InputMaybe<Types.Scalars['Int']>;
}>;

export type PendingPageMessageSessionByAccountIdQuery = {
  __typename?: 'Query';
  allPendingPageMessageSessionByAccountId: {
    __typename?: 'PageMessageSessionConnection';
    totalCount?: number | null;
    edges?: Array<{
      __typename?: 'PageMessageSessionEdge';
      cursor: string;
      node: {
        __typename?: 'PageMessageSession';
        id: string;
        latestMessage?: string | null;
        lixiClaimCode?: string | null;
        sessionOpenedAt?: any | null;
        sessionClosedAt?: any | null;
        status: Types.PageMessageSessionStatus;
        createdAt?: any | null;
        updatedAt?: any | null;
        page: {
          __typename?: 'Page';
          id: string;
          name: string;
          avatar?: string | null;
          pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
        };
        account: { __typename?: 'Account'; id: string; name: string; address: string; avatar?: string | null };
        lixi?: {
          __typename?: 'LixiModel';
          id: string;
          name: string;
          amount: string;
          expiryAt?: any | null;
          activationAt?: any | null;
          status: string;
        } | null;
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

export type PageMessageSessionByAccountIdQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']>;
  before?: Types.InputMaybe<Types.Scalars['String']>;
  first?: Types.InputMaybe<Types.Scalars['Int']>;
  last?: Types.InputMaybe<Types.Scalars['Int']>;
  id?: Types.InputMaybe<Types.Scalars['Int']>;
  orderBy?: Types.InputMaybe<Types.PageMessageSessionOrder>;
  skip?: Types.InputMaybe<Types.Scalars['Int']>;
}>;

export type PageMessageSessionByAccountIdQuery = {
  __typename?: 'Query';
  allPageMessageSessionByAccountId: {
    __typename?: 'PageMessageSessionConnection';
    totalCount?: number | null;
    edges?: Array<{
      __typename?: 'PageMessageSessionEdge';
      cursor: string;
      node: {
        __typename?: 'PageMessageSession';
        id: string;
        latestMessage?: string | null;
        lixiClaimCode?: string | null;
        sessionOpenedAt?: any | null;
        sessionClosedAt?: any | null;
        status: Types.PageMessageSessionStatus;
        createdAt?: any | null;
        updatedAt?: any | null;
        page: {
          __typename?: 'Page';
          id: string;
          name: string;
          avatar?: string | null;
          pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
        };
        account: { __typename?: 'Account'; id: string; name: string; address: string; avatar?: string | null };
        lixi?: {
          __typename?: 'LixiModel';
          id: string;
          name: string;
          amount: string;
          expiryAt?: any | null;
          activationAt?: any | null;
          status: string;
        } | null;
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

export type UserHadMessageToPageQueryVariables = Types.Exact<{
  accountId?: Types.InputMaybe<Types.Scalars['Int']>;
  pageId?: Types.InputMaybe<Types.Scalars['String']>;
}>;

export type UserHadMessageToPageQuery = {
  __typename?: 'Query';
  userHadMessageToPage: {
    __typename?: 'PageMessageSession';
    id: string;
    latestMessage?: string | null;
    lixiClaimCode?: string | null;
    sessionOpenedAt?: any | null;
    sessionClosedAt?: any | null;
    status: Types.PageMessageSessionStatus;
    createdAt?: any | null;
    updatedAt?: any | null;
    page: {
      __typename?: 'Page';
      id: string;
      name: string;
      avatar?: string | null;
      pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
    };
    account: { __typename?: 'Account'; id: string; name: string; address: string; avatar?: string | null };
    lixi?: {
      __typename?: 'LixiModel';
      id: string;
      name: string;
      amount: string;
      expiryAt?: any | null;
      activationAt?: any | null;
      status: string;
    } | null;
  };
};

export type CreatePageMessageSessionMutationVariables = Types.Exact<{
  input: Types.CreatePageMessageInput;
}>;

export type CreatePageMessageSessionMutation = {
  __typename?: 'Mutation';
  createPageMessageSession: {
    __typename?: 'PageMessageSession';
    id: string;
    latestMessage?: string | null;
    lixiClaimCode?: string | null;
    sessionOpenedAt?: any | null;
    sessionClosedAt?: any | null;
    status: Types.PageMessageSessionStatus;
    createdAt?: any | null;
    updatedAt?: any | null;
    page: {
      __typename?: 'Page';
      id: string;
      name: string;
      avatar?: string | null;
      pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
    };
    account: { __typename?: 'Account'; id: string; name: string; address: string; avatar?: string | null };
    lixi?: {
      __typename?: 'LixiModel';
      id: string;
      name: string;
      amount: string;
      expiryAt?: any | null;
      activationAt?: any | null;
      status: string;
    } | null;
  };
};

export type ClosePageMessageSessionMutationVariables = Types.Exact<{
  input: Types.ClosePageMessageSessionInput;
}>;

export type ClosePageMessageSessionMutation = {
  __typename?: 'Mutation';
  closePageMessageSession: {
    __typename?: 'PageMessageSession';
    id: string;
    latestMessage?: string | null;
    lixiClaimCode?: string | null;
    sessionOpenedAt?: any | null;
    sessionClosedAt?: any | null;
    status: Types.PageMessageSessionStatus;
    createdAt?: any | null;
    updatedAt?: any | null;
    page: {
      __typename?: 'Page';
      id: string;
      name: string;
      avatar?: string | null;
      pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
    };
    account: { __typename?: 'Account'; id: string; name: string; address: string; avatar?: string | null };
    lixi?: {
      __typename?: 'LixiModel';
      id: string;
      name: string;
      amount: string;
      expiryAt?: any | null;
      activationAt?: any | null;
      status: string;
    } | null;
  };
};

export type OpenPageMessageSessionMutationVariables = Types.Exact<{
  input: Types.OpenPageMessageSessionInput;
}>;

export type OpenPageMessageSessionMutation = {
  __typename?: 'Mutation';
  openPageMessageSession: {
    __typename?: 'PageMessageSession';
    id: string;
    latestMessage?: string | null;
    lixiClaimCode?: string | null;
    sessionOpenedAt?: any | null;
    sessionClosedAt?: any | null;
    status: Types.PageMessageSessionStatus;
    createdAt?: any | null;
    updatedAt?: any | null;
    page: {
      __typename?: 'Page';
      id: string;
      name: string;
      avatar?: string | null;
      pageAccount: { __typename?: 'Account'; id: string; name: string; address: string };
    };
    account: { __typename?: 'Account'; id: string; name: string; address: string; avatar?: string | null };
    lixi?: {
      __typename?: 'LixiModel';
      id: string;
      name: string;
      amount: string;
      expiryAt?: any | null;
      activationAt?: any | null;
      status: string;
    } | null;
  };
};

export const PageMessageSessionFieldsFragmentDoc = `
    fragment PageMessageSessionFields on PageMessageSession {
  id
  page {
    id
    name
    pageAccount {
      id
      name
      address
    }
    avatar
  }
  account {
    id
    name
    address
    avatar
  }
  lixi {
    id
    name
    amount
    expiryAt
    activationAt
    status
  }
  latestMessage
  lixiClaimCode
  sessionOpenedAt
  sessionClosedAt
  status
  createdAt
  updatedAt
}
    `;
export const PageMessageSessionDocument = `
    query PageMessageSession($id: String!) {
  pageMessageSession(id: $id) {
    ...PageMessageSessionFields
  }
}
    ${PageMessageSessionFieldsFragmentDoc}`;
export const OpenPageMessageSessionByPageIdDocument = `
    query OpenPageMessageSessionByPageId($after: String, $before: String, $first: Int = 20, $last: Int, $id: String, $orderBy: PageMessageSessionOrder, $skip: Int) {
  allOpenPageMessageSessionByPageId(
    after: $after
    before: $before
    first: $first
    last: $last
    id: $id
    orderBy: $orderBy
    skip: $skip
  ) {
    totalCount
    edges {
      cursor
      node {
        ...PageMessageSessionFields
      }
    }
    pageInfo {
      ...PageInfoFields
    }
  }
}
    ${PageMessageSessionFieldsFragmentDoc}
${PageInfoFieldsFragmentDoc}`;
export const PendingPageMessageSessionByPageIdDocument = `
    query PendingPageMessageSessionByPageId($after: String, $before: String, $first: Int = 20, $last: Int, $id: String, $orderBy: PageMessageSessionOrder, $skip: Int) {
  allPendingPageMessageSessionByPageId(
    after: $after
    before: $before
    first: $first
    last: $last
    id: $id
    orderBy: $orderBy
    skip: $skip
  ) {
    totalCount
    edges {
      cursor
      node {
        ...PageMessageSessionFields
      }
    }
    pageInfo {
      ...PageInfoFields
    }
  }
}
    ${PageMessageSessionFieldsFragmentDoc}
${PageInfoFieldsFragmentDoc}`;
export const OpenPageMessageSessionByAccountIdDocument = `
    query OpenPageMessageSessionByAccountId($after: String, $before: String, $first: Int = 20, $last: Int, $id: Int, $orderBy: PageMessageSessionOrder, $skip: Int) {
  allOpenPageMessageSessionByAccountId(
    after: $after
    before: $before
    first: $first
    last: $last
    id: $id
    orderBy: $orderBy
    skip: $skip
  ) {
    totalCount
    edges {
      cursor
      node {
        ...PageMessageSessionFields
      }
    }
    pageInfo {
      ...PageInfoFields
    }
  }
}
    ${PageMessageSessionFieldsFragmentDoc}
${PageInfoFieldsFragmentDoc}`;
export const PendingPageMessageSessionByAccountIdDocument = `
    query PendingPageMessageSessionByAccountId($after: String, $before: String, $first: Int = 20, $last: Int, $id: Int, $orderBy: PageMessageSessionOrder, $skip: Int) {
  allPendingPageMessageSessionByAccountId(
    after: $after
    before: $before
    first: $first
    last: $last
    id: $id
    orderBy: $orderBy
    skip: $skip
  ) {
    totalCount
    edges {
      cursor
      node {
        ...PageMessageSessionFields
      }
    }
    pageInfo {
      ...PageInfoFields
    }
  }
}
    ${PageMessageSessionFieldsFragmentDoc}
${PageInfoFieldsFragmentDoc}`;
export const PageMessageSessionByAccountIdDocument = `
    query PageMessageSessionByAccountId($after: String, $before: String, $first: Int = 20, $last: Int, $id: Int, $orderBy: PageMessageSessionOrder, $skip: Int) {
  allPageMessageSessionByAccountId(
    after: $after
    before: $before
    first: $first
    last: $last
    id: $id
    orderBy: $orderBy
    skip: $skip
  ) {
    totalCount
    edges {
      cursor
      node {
        ...PageMessageSessionFields
      }
    }
    pageInfo {
      ...PageInfoFields
    }
  }
}
    ${PageMessageSessionFieldsFragmentDoc}
${PageInfoFieldsFragmentDoc}`;
export const UserHadMessageToPageDocument = `
    query UserHadMessageToPage($accountId: Int, $pageId: String) {
  userHadMessageToPage(accountId: $accountId, pageId: $pageId) {
    ...PageMessageSessionFields
  }
}
    ${PageMessageSessionFieldsFragmentDoc}`;
export const CreatePageMessageSessionDocument = `
    mutation CreatePageMessageSession($input: CreatePageMessageInput!) {
  createPageMessageSession(data: $input) {
    ...PageMessageSessionFields
  }
}
    ${PageMessageSessionFieldsFragmentDoc}`;
export const ClosePageMessageSessionDocument = `
    mutation ClosePageMessageSession($input: ClosePageMessageSessionInput!) {
  closePageMessageSession(data: $input) {
    ...PageMessageSessionFields
  }
}
    ${PageMessageSessionFieldsFragmentDoc}`;
export const OpenPageMessageSessionDocument = `
    mutation OpenPageMessageSession($input: OpenPageMessageSessionInput!) {
  openPageMessageSession(data: $input) {
    ...PageMessageSessionFields
  }
}
    ${PageMessageSessionFieldsFragmentDoc}`;

const injectedRtkApi = api.injectEndpoints({
  endpoints: build => ({
    PageMessageSession: build.query<PageMessageSessionQuery, PageMessageSessionQueryVariables>({
      query: variables => ({ document: PageMessageSessionDocument, variables })
    }),
    OpenPageMessageSessionByPageId: build.query<
      OpenPageMessageSessionByPageIdQuery,
      OpenPageMessageSessionByPageIdQueryVariables | void
    >({
      query: variables => ({ document: OpenPageMessageSessionByPageIdDocument, variables })
    }),
    PendingPageMessageSessionByPageId: build.query<
      PendingPageMessageSessionByPageIdQuery,
      PendingPageMessageSessionByPageIdQueryVariables | void
    >({
      query: variables => ({ document: PendingPageMessageSessionByPageIdDocument, variables })
    }),
    OpenPageMessageSessionByAccountId: build.query<
      OpenPageMessageSessionByAccountIdQuery,
      OpenPageMessageSessionByAccountIdQueryVariables | void
    >({
      query: variables => ({ document: OpenPageMessageSessionByAccountIdDocument, variables })
    }),
    PendingPageMessageSessionByAccountId: build.query<
      PendingPageMessageSessionByAccountIdQuery,
      PendingPageMessageSessionByAccountIdQueryVariables | void
    >({
      query: variables => ({ document: PendingPageMessageSessionByAccountIdDocument, variables })
    }),
    PageMessageSessionByAccountId: build.query<
      PageMessageSessionByAccountIdQuery,
      PageMessageSessionByAccountIdQueryVariables | void
    >({
      query: variables => ({ document: PageMessageSessionByAccountIdDocument, variables })
    }),
    UserHadMessageToPage: build.query<UserHadMessageToPageQuery, UserHadMessageToPageQueryVariables | void>({
      query: variables => ({ document: UserHadMessageToPageDocument, variables })
    }),
    CreatePageMessageSession: build.mutation<
      CreatePageMessageSessionMutation,
      CreatePageMessageSessionMutationVariables
    >({
      query: variables => ({ document: CreatePageMessageSessionDocument, variables })
    }),
    ClosePageMessageSession: build.mutation<ClosePageMessageSessionMutation, ClosePageMessageSessionMutationVariables>({
      query: variables => ({ document: ClosePageMessageSessionDocument, variables })
    }),
    OpenPageMessageSession: build.mutation<OpenPageMessageSessionMutation, OpenPageMessageSessionMutationVariables>({
      query: variables => ({ document: OpenPageMessageSessionDocument, variables })
    })
  })
});

export { injectedRtkApi as api };
export const {
  usePageMessageSessionQuery,
  useLazyPageMessageSessionQuery,
  useOpenPageMessageSessionByPageIdQuery,
  useLazyOpenPageMessageSessionByPageIdQuery,
  usePendingPageMessageSessionByPageIdQuery,
  useLazyPendingPageMessageSessionByPageIdQuery,
  useOpenPageMessageSessionByAccountIdQuery,
  useLazyOpenPageMessageSessionByAccountIdQuery,
  usePendingPageMessageSessionByAccountIdQuery,
  useLazyPendingPageMessageSessionByAccountIdQuery,
  usePageMessageSessionByAccountIdQuery,
  useLazyPageMessageSessionByAccountIdQuery,
  useUserHadMessageToPageQuery,
  useLazyUserHadMessageToPageQuery,
  useCreatePageMessageSessionMutation,
  useClosePageMessageSessionMutation,
  useOpenPageMessageSessionMutation
} = injectedRtkApi;
