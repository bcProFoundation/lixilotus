import { PaginationArgs } from '@bcpros/lixi-models';
import { useLazyPostsBySearchQuery, usePostsBySearchQuery } from '@store/post/posts.generated';
import { useEffect, useRef, useState } from 'react';
import { Post, PostOrder } from 'src/generated/types.generated';

export interface PostListParams extends PaginationArgs {
  orderBy?: PostOrder;
  query?: string;
}
export interface PostListBody {
  posts: Post[];
  next: string;
}

export function useInfinitePostsBySearchQuery(
  params: PostListParams,
  fetchAll: boolean = false // if `true`: auto do next fetches to get all notes at once
) {
  const baseResult = usePostsBySearchQuery(params);

  const [trigger, nextResult] = useLazyPostsBySearchQuery();
  const [combinedData, setCombinedData] = useState([]);

  const isBaseReady = useRef(false);
  const isNextDone = useRef(true);

  // next: starts with a null, fetching ended with an undefined cursor
  const next = useRef<null | string | undefined>(null);

  // Base result
  useEffect(() => {
    console.log('baseResult: ', baseResult);
    next.current = baseResult.data?.allPostsBySearch?.pageInfo?.endCursor;
    if (baseResult?.data?.allPostsBySearch) {
      isBaseReady.current = true;
      setCombinedData(baseResult.data.allPostsBySearch.edges.map(item => item.node));
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
      nextResult.data.allPostsBySearch.pageInfo &&
      nextResult.data.allPostsBySearch.pageInfo.endCursor != next.current
    ) {
      next.current = nextResult.data.allPostsBySearch.pageInfo.endCursor;

      const newItems = nextResult.data.allPostsBySearch.edges.map(item => item.node);
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
    totalCount: baseResult?.data?.allPostsBySearch?.totalCount ?? 0,
    error: baseResult?.error,
    isError: baseResult?.isError,
    isLoading: baseResult?.isLoading,
    isFetching: baseResult?.isFetching || nextResult?.isFetching,
    errorNext: nextResult?.error,
    isErrorNext: nextResult?.isError,
    isFetchingNext: nextResult?.isFetching,
    hasNext: baseResult.data?.allPostsBySearch?.pageInfo?.endCursor !== undefined,
    fetchNext,
    refetch
  };
}
