import { createApi } from '@reduxjs/toolkit/query/react';
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query';
import { GraphQLClient } from 'graphql-request';
import intl from 'react-intl-universal';

export const client = new GraphQLClient('https://lixilotus.test/graphql', {
  credentials: 'include',
  cache: 'no-cache'
});

export const api = createApi({
  baseQuery: graphqlRequestBaseQuery({
    client,
    customErrors: ({ name, stack, response }) => {
      let errorMessage = intl.get('page.unableCreatePageServer');
      if (response?.errors) {
        errorMessage = response?.errors[0]?.message ?? errorMessage;
      }
      return {
        name,
        message: errorMessage,
        stack
      };
    }
  }),
  endpoints: () => ({})
});
