import { PaginationArgs } from '@bcpros/lixi-models';
import { useLazyPagesQuery, usePagesQuery, api as postApi } from '@store/page/pages.api';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PageOrder } from 'src/generated/types.generated';
import _ from 'lodash';
import { PageQuery } from './pages.generated';
import { createEntityAdapter } from '@reduxjs/toolkit';

const pagesAdapter = createEntityAdapter<PageQuery['page']>({
  selectId: post => post.id,
  sortComparer: (a, b) => b.totalBurnForPage - a.totalBurnForPage
});

const { selectAll } = pagesAdapter.getSelectors();

export interface PageParams extends PaginationArgs {
  orderBy?: PageOrder;
}

export function useInfinitePagesQuery(
  params: PageParams,
  fetchAll: boolean = false // if `true`: auto do next fetches to get all notes at once
) {
  const baseResult = usePagesQuery(params);

  const [trigger, nextResult] = useLazyPagesQuery();
  const [combinedData, setCombinedData] = useState(pagesAdapter.getInitialState({}));

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
    next.current = baseResult.data?.allPages?.pageInfo?.endCursor;
    if (baseResult?.data?.allPages) {
      isBaseReady.current = true;

      const adapterSetAll = pagesAdapter.setAll(
        combinedData,
        baseResult.data.allPages.edges.map(item => item.node)
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
    totalCount: baseResult?.data?.allPages?.totalCount ?? 0,
    error: baseResult?.error,
    isError: baseResult?.isError,
    isLoading: baseResult?.isLoading,
    isFetching: baseResult?.isFetching || nextResult?.isFetching,
    errorNext: nextResult?.error,
    isErrorNext: nextResult?.isError,
    isFetchingNext: nextResult?.isFetching,
    hasNext: baseResult.data?.allPages?.pageInfo?.endCursor !== null,
    fetchNext,
    refetch
  };
}
