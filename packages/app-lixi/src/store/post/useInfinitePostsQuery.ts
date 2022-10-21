import { PaginationArgs } from '@bcpros/lixi-models';
import { useLazyPagesQuery, usePagesQuery } from '@store/page/pages.generated';
import { useEffect, useRef, useState } from 'react';
import { Page, PageOrder } from 'src/generated/types.generated';

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

export function useInfinitePostsQuery(
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
    console.log('baseResult: ', baseResult);
    next.current = baseResult.data?.allPages?.pageInfo?.endCursor;
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

    if (
      isBaseReady.current &&
      nextResult.data &&
      nextResult.data.allPages.pageInfo &&
      nextResult.data.allPages.pageInfo.endCursor != next.current
    ) {
      next.current = nextResult.data.allPages.pageInfo.endCursor;

      const newItems = nextResult.data.allPages.edges.map(item => item.node);
      if (newItems && newItems.length) {
        setCombinedData(currentItems => {
          return [...currentItems, ...newItems];
        });
      }
    }
  }, [nextResult]);

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
