import { PaginationArgs } from '@bcpros/lixi-models';
import {
  useLazyClosedPageMessageSessionQuery,
  useClosedPageMessageSessionQuery
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

export interface ClosedPageMessageSessionListParams extends PaginationArgs {
  orderBy?: PageMessageSessionOrder;
  accountId: number;
  pageId: string;
}

export function useInfiniteClosedPageMessageSession(
  params: ClosedPageMessageSessionListParams,
  fetchAll: boolean = false // if `true`: auto do next fetches to get all notes at once
) {
  const baseResult = useClosedPageMessageSessionQuery(params, {
    skip: !params.accountId || !params.pageId
  });

  const [trigger, nextResult] = useLazyClosedPageMessageSessionQuery();
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
    next.current = baseResult.data?.allClosedPageMessageSession?.pageInfo?.endCursor;
    if (baseResult?.data?.allClosedPageMessageSession) {
      isBaseReady.current = true;

      const adapterSetAll = pageMessageSessionAdapter.setAll(
        combinedData,
        baseResult.data.allClosedPageMessageSession.edges.map(item => item.node)
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
    totalCount: baseResult?.data?.allClosedPageMessageSession?.totalCount ?? 0,
    error: baseResult?.error,
    isError: baseResult?.isError,
    isLoading: baseResult?.isLoading,
    isFetching: baseResult?.isFetching || nextResult?.isFetching,
    errorNext: nextResult?.error,
    isErrorNext: nextResult?.isError,
    isFetchingNext: nextResult?.isFetching,
    hasNext: baseResult.data?.allClosedPageMessageSession?.pageInfo?.endCursor !== null,
    fetchNext,
    refetch
  };
}
