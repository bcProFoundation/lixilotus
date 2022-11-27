import { PaginationArgs } from '@bcpros/lixi-models';
import { useLazyPostsByPageIdQuery, usePostsByPageIdQuery } from '@store/post/posts.generated';
import { useEffect, useRef, useState } from 'react';
import { Post, PostOrder } from 'src/generated/types.generated';

export interface PostListByIdParams extends PaginationArgs {
  orderBy?: PostOrder;
  id?: string;
}
export interface PostListBody {
  posts: Post[];
  next: string;
}

export function useInfinitePostsByPageIdQuery(
  params: PostListByIdParams,
  fetchAll: boolean = false // if `true`: auto do next fetches to get all notes at once
) {
  const baseResult = usePostsByPageIdQuery(params);

  const [trigger, nextResult] = useLazyPostsByPageIdQuery();
  const [combinedData, setCombinedData] = useState([]);

  const isBaseReady = useRef(false);
  const isNextDone = useRef(true);

  // next: starts with a null, fetching ended with an undefined cursor
  const next = useRef<null | string | undefined>(null);

  // Base result
  useEffect(() => {
    console.log('baseResult: ', baseResult);
    next.current = baseResult.data?.allPostsByPageId?.pageInfo?.endCursor;
    if (baseResult?.data?.allPostsByPageId) {
      isBaseReady.current = true;
      setCombinedData(baseResult.data.allPostsByPageId.edges.map(item => item.node));
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
      nextResult.data.allPostsByPageId.pageInfo &&
      nextResult.data.allPostsByPageId.pageInfo.endCursor != next.current
    ) {
      next.current = nextResult.data.allPostsByPageId.pageInfo.endCursor;

      const newItems = nextResult.data.allPostsByPageId.edges.map(item => item.node);
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
    totalCount: baseResult?.data?.allPostsByPageId?.totalCount ?? 0,
    error: baseResult?.error,
    isError: baseResult?.isError,
    isLoading: baseResult?.isLoading,
    isFetching: baseResult?.isFetching || nextResult?.isFetching,
    errorNext: nextResult?.error,
    isErrorNext: nextResult?.isError,
    isFetchingNext: nextResult?.isFetching,
    hasNext: baseResult.data?.allPostsByPageId?.pageInfo?.endCursor !== undefined,
    fetchNext,
    refetch
  };
}
