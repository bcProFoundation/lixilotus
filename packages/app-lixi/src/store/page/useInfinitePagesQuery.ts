import { PaginationArgs } from '@bcpros/lixi-models';
import { useEffect, useRef, useState } from 'react';
import { Page, PageOrder } from 'src/generated/types.generated';
import { useLazyPagesQuery, usePagesQuery } from './pages.generated';

export interface PageListParams {
  skip?: number;
  after?: string;
  before?: string;
  first?: number;
  last?: number;
  orderBy?: PageOrder;
  query?: string;
}
export interface PageListBody {
  pages: Page[];
  next: string;
}

export function useInfinitePagesQuery(
  params: PaginationArgs,
  fetchAll: boolean = false // if `true`: auto do next fetches to get all notes at once
) {
  const baseResult = usePagesQuery(params);

  const [trigger, nextResult] = useLazyPagesQuery();
  const [combinedData, setCombinedData] = useState([]);

  const isBaseReady = useRef(false);
  const isNextDone = useRef(true);

  // next: starts with a null, fetching ended with an undefined cursor
  const next = useRef<null | string | undefined>(null);

  // Base result
  useEffect(() => {
    next.current = baseResult.data?.allPages?.pageInfo?.endCursor;
    console.log(baseResult);
    if (baseResult?.data?.allPages) {
      isBaseReady.current = true;
      setCombinedData(baseResult.data.allPages.edges.map(item => item.node));
      fetchAll && fetchNext();
    }
  }, [baseResult]);

  // When there're next results
  useEffect(() => {
    // Not success next result
    if (!nextResult.isSuccess) return;

    if (isBaseReady.current && nextResult.data) {
      next.current = nextResult.data?.allPages?.pageInfo?.endCursor;

      const newItems = nextResult.data.allPages.edges.map(item => item.node);
      if (newItems && newItems.length) {
        setCombinedData(currentItems => [...currentItems, ...newItems]);
      }
    }
  }, [nextResult]);

  const fetchNext = async () => {
    if (!isBaseReady.current || !isNextDone.current || next.current === undefined || next.current === null) return;

    try {
      isNextDone.current = false;
      await trigger({
        ...params,
        after: next.current
      });
    } catch (e) {
    } finally {
      isNextDone.current = true;
      fetchNext();
    }
  };

  const refetch = async () => {
    isBaseReady.current = false;
    next.current = null; // restart
    await baseResult.refetch(); // resatrt with a whole new refetching
  };

  return {
    data: combinedData ?? [],
    totalCount: baseResult?.data?.allPages?.totalCount ?? 0,
    error: baseResult?.error,
    isError: baseResult?.isError,
    isLoading: baseResult?.isLoading,
    isFetching: baseResult?.isFetching || nextResult?.isFetching,
    errorNext: nextResult?.error,
    isErrorNext: nextResult?.isError,
    isFetchingNext: nextResult?.isFetching,
    hasNext: baseResult.data?.allPages?.pageInfo?.endCursor !== undefined,
    fetchNext,
    refetch
  };
}
