import { PaginationArgs } from '@bcpros/lixi-models';
import {
  useLazyPendingPageMessageSessionByPageIdQuery,
  usePendingPageMessageSessionByPageIdQuery
} from '@store/message/pageMessageSession.api';
import { useEffect, useRef, useState, useMemo } from 'react';
import { PageMessageSessionOrder } from '@generated/types.generated';
import _ from 'lodash';
import { createEntityAdapter } from '@reduxjs/toolkit';
import { PageMessageSessionQuery } from './pageMessageSession.generated';

const pageMessageSessionAdapter = createEntityAdapter<PageMessageSessionQuery['pageMessageSession']>({
  selectId: pageMessageSession => pageMessageSession.id,
  sortComparer: (a, b) => b.createdAt - a.createdAt
});

const { selectAll, selectEntities, selectIds, selectTotal } = pageMessageSessionAdapter.getSelectors();

export interface PageMessageSessionListParams extends PaginationArgs {
  orderBy?: PageMessageSessionOrder;
  id: string;
}

export function useInfinitePendingPageMessageSessionByPageId(
  params: PageMessageSessionListParams,
  fetchAll: boolean = false // if `true`: auto do next fetches to get all notes at once
) {
  const baseResult = usePendingPageMessageSessionByPageIdQuery(params); //dont query when it is not the owner

  const [trigger, nextResult] = useLazyPendingPageMessageSessionByPageIdQuery();
  const [combinedData, setCombinedData] = useState(pageMessageSessionAdapter.getInitialState({}));

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
    next.current = baseResult.data?.allPendingPageMessageSessionByPageId?.pageInfo?.endCursor;
    if (baseResult?.data?.allPendingPageMessageSessionByPageId) {
      isBaseReady.current = true;

      const adapterSetAll = pageMessageSessionAdapter.setAll(
        combinedData,
        baseResult.data.allPendingPageMessageSessionByPageId.edges.map(item => item.node)
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
    totalCount: baseResult?.data?.allPendingPageMessageSessionByPageId?.totalCount ?? 0,
    error: baseResult?.error,
    isError: baseResult?.isError,
    isLoading: baseResult?.isLoading,
    isFetching: baseResult?.isFetching || nextResult?.isFetching,
    errorNext: nextResult?.error,
    isErrorNext: nextResult?.isError,
    isFetchingNext: nextResult?.isFetching,
    hasNext: baseResult.data?.allPendingPageMessageSessionByPageId?.pageInfo?.endCursor !== null,
    fetchNext,
    refetch
  };
}
