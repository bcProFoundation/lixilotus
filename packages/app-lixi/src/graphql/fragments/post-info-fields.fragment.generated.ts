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

export type PostInfoFieldsFragment = {
  __typename?: 'PostInfo';
  endCursor?: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string | null;
};

export const PostInfoFieldsFragmentDoc = `
    fragment PostInfoFields on PostInfo {
  endCursor
  hasNextPage
  hasPreviousPage
  startCursor
}
    `;