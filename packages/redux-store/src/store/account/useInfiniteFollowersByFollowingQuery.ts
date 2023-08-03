import { PaginationArgs } from '@bcpros/lixi-models';
import { createEntityAdapter } from '@reduxjs/toolkit';
import {
  useAllFollowersByFollowingQuery,
  useAllFollowingsByFollowerQuery,
  useLazyAllFollowersByFollowingQuery,
  useLazyAllFollowingsByFollowerQuery
} from '@store/follow/follows.generated';
import _ from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccountOrder } from '@generated/types.generated';
import { GetAccountByAddressQuery } from './accounts.generated';

const accountsAdapter = createEntityAdapter<GetAccountByAddressQuery['getAccountByAddress']>({
  selectId: account => account.id,
  sortComparer: (a, b) => b.createdAt - a.createdAt
});

const { selectAll, selectEntities, selectIds, selectTotal } = accountsAdapter.getSelectors();

interface AccountListByIdParams extends PaginationArgs {
  orderBy?: AccountOrder;
  followingAccountId?: number;
}

export function useInfiniteFollowersByFollowingQuery(
  params: AccountListByIdParams,
  fetchAll = false // if `true`: auto do next fetches to get all notes at once
) {
  const baseResult = useAllFollowersByFollowingQuery(params);

  const [trigger, nextResult] = useLazyAllFollowersByFollowingQuery();
  const [combinedData, setCombinedData] = useState(accountsAdapter.getInitialState({}));

  const isBaseReady = useRef(false);
  const isNextDone = useRef(true);

  // next: starts with a null, fetching ended with an undefined cursor
  const next = useRef<null | string | undefined>(null);

  const data = useMemo(() => {
    const result = selectAll(combinedData);
    return result;
  }, [combinedData]);

  // Base result
  useEffect(() => {
    next.current = baseResult.data?.allFollowersByFollowing?.pageInfo?.endCursor;
    if (baseResult?.data?.allFollowersByFollowing) {
      isBaseReady.current = true;

      const baseResultParse = baseResult.data.allFollowersByFollowing.edges.map(item => item.node);
      const adapterSetAll = accountsAdapter.setAll(
        combinedData,
        baseResult.data.allFollowersByFollowing.edges.map(item => item.node)
      );

      setCombinedData(adapterSetAll);
      fetchAll && fetchNext();
    }
  }, [baseResult]);

  const fetchNext = async () => {
    if (!isBaseReady.current || !isNextDone.current || next.current === undefined || next.current === null) {
      return;
    }

    try {
      isNextDone.current = false;
      await trigger({
        ...params,
        after: next.current
      });
    } catch (e) {
    } finally {
      isNextDone.current = true;
      fetchAll && fetchNext();
    }
  };

  const refetch = async () => {
    isBaseReady.current = false;
    next.current = null; // restart
    await baseResult.refetch(); // restart with a whole new refetching
  };

  return {
    data: data ?? [],
    totalCount: baseResult?.data?.allFollowersByFollowing?.totalCount ?? 0,
    error: baseResult?.error,
    isError: baseResult?.isError,
    isLoading: baseResult?.isLoading,
    isFetching: baseResult?.isFetching || nextResult?.isFetching,
    errorNext: nextResult?.error,
    isErrorNext: nextResult?.isError,
    isFetchingNext: nextResult?.isFetching,
    hasNext: baseResult.data?.allFollowersByFollowing?.pageInfo?.endCursor !== null,
    fetchNext,
    refetch
  };
}
