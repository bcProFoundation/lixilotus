import { PaginationArgs } from '@bcpros/lixi-models';
import { createEntityAdapter } from '@reduxjs/toolkit';
import { useAllFollowingsByFollowerQuery, useLazyAllFollowingsByFollowerQuery } from '@store/follow/follows.generated';
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
  id?: number;
}

export function useInfiniteFollowingsByFollowerQuery(
  params: AccountListByIdParams,
  fetchAll = false // if `true`: auto do next fetches to get all notes at once
) {
  const baseResult = useAllFollowingsByFollowerQuery(params);

  const [trigger, nextResult] = useLazyAllFollowingsByFollowerQuery();
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
    next.current = baseResult.data?.allFollowingsByFollower?.pageInfo?.endCursor;
    if (baseResult?.data?.allFollowingsByFollower) {
      isBaseReady.current = true;

      const baseResultParse = baseResult.data.allFollowingsByFollower.edges.map(item => item.node);
      const adapterSetAll = accountsAdapter.setAll(
        combinedData,
        baseResult.data.allFollowingsByFollower.edges.map(item => item.node)
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
    totalCount: baseResult?.data?.allFollowingsByFollower?.totalCount ?? 0,
    error: baseResult?.error,
    isError: baseResult?.isError,
    isLoading: baseResult?.isLoading,
    isFetching: baseResult?.isFetching || nextResult?.isFetching,
    errorNext: nextResult?.error,
    isErrorNext: nextResult?.isError,
    isFetchingNext: nextResult?.isFetching,
    hasNext: baseResult.data?.allFollowingsByFollower?.pageInfo?.endCursor !== null,
    fetchNext,
    refetch
  };
}
