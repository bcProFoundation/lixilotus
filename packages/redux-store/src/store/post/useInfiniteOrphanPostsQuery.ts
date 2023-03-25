import { PaginationArgs } from '@bcpros/lixi-models';
import { useLazyOrphanPostsQuery, useOrphanPostsQuery, api as postApi } from '@store/post/posts.api';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Post, PostOrder } from 'src/generated/types.generated';
import _ from 'lodash';
import { PostQuery } from './posts.generated';
import { createEntityAdapter } from '@reduxjs/toolkit';

const postsAdapter = createEntityAdapter<PostQuery['post']>({
  selectId: post => post.id,
  sortComparer: (a, b) => b.createdAt - a.createdAt
});

const { selectAll } = postsAdapter.getSelectors();

export interface PostListParams extends PaginationArgs {
  orderBy?: PostOrder;
  accountId?: number;
}
export interface PostListBody {
  posts: Post[];
  next: string;
}

export function useInfiniteOrphanPostsQuery(
  params: PostListParams,
  fetchAll: boolean = false // if `true`: auto do next fetches to get all notes at once
) {
  const baseResult = useOrphanPostsQuery(params);

  const [trigger, nextResult] = useLazyOrphanPostsQuery();
  const [combinedData, setCombinedData] = useState(postsAdapter.getInitialState({}));

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
    next.current = baseResult.data?.allOrphanPosts?.pageInfo?.endCursor;
    if (baseResult?.data?.allOrphanPosts) {
      isBaseReady.current = true;

      const adapterSetAll = postsAdapter.setAll(
        combinedData,
        baseResult.data.allOrphanPosts.edges.map(item => item.node)
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
    totalCount: baseResult?.data?.allOrphanPosts?.totalCount ?? 0,
    error: baseResult?.error,
    isError: baseResult?.isError,
    isLoading: baseResult?.isLoading,
    isFetching: baseResult?.isFetching || nextResult?.isFetching,
    errorNext: nextResult?.error,
    isErrorNext: nextResult?.isError,
    isFetchingNext: nextResult?.isFetching,
    hasNext: baseResult.data?.allOrphanPosts?.pageInfo?.endCursor !== null,
    fetchNext,
    refetch
  };
}
