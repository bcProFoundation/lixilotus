import { PaginationArgs } from '@bcpros/lixi-models';
import { useLazyPostsByUserIdQuery, usePostsByUserIdQuery } from '@store/post/posts.generated';
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

export function useInfinitePostsByUserIdQuery(
  params: PostListByIdParams,
  fetchAll: boolean = false // if `true`: auto do next fetches to get all notes at once
) {
  const baseResult = usePostsByUserIdQuery(params);

  const [trigger, nextResult] = useLazyPostsByUserIdQuery();
  const [combinedData, setCombinedData] = useState([]);

  const isBaseReady = useRef(false);
  const isNextDone = useRef(true);

  // next: starts with a null, fetching ended with an undefined cursor
  const next = useRef<null | string | undefined>(null);

  // Base result
  useEffect(() => {
    console.log('baseResult: ', baseResult);
    next.current = baseResult.data?.allPostsByUserId?.pageInfo?.endCursor;
    if (baseResult?.data?.allPostsByUserId) {
      isBaseReady.current = true;
      setCombinedData(baseResult.data.allPostsByUserId.edges.map(item => item.node));
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
      nextResult.data.allPostsByUserId.pageInfo &&
      nextResult.data.allPostsByUserId.pageInfo.endCursor != next.current
    ) {
      next.current = nextResult.data.allPostsByUserId.pageInfo.endCursor;

      const newItems = nextResult.data.allPostsByUserId.edges.map(item => item.node);
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
    totalCount: baseResult?.data?.allPostsByUserId?.totalCount ?? 0,
    error: baseResult?.error,
    isError: baseResult?.isError,
    isLoading: baseResult?.isLoading,
    isFetching: baseResult?.isFetching || nextResult?.isFetching,
    errorNext: nextResult?.error,
    isErrorNext: nextResult?.isError,
    isFetchingNext: nextResult?.isFetching,
    hasNext: baseResult.data?.allPostsByUserId?.pageInfo?.endCursor !== undefined,
    fetchNext,
    refetch
  };
}