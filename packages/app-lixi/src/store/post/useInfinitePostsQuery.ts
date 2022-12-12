import { PaginationArgs } from '@bcpros/lixi-models';
import { useLazyPostsQuery, usePostsQuery, api as postApi } from '@store/post/posts.api';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Post, PostOrder } from 'src/generated/types.generated';
import _ from 'lodash';
import { PostQuery } from './posts.generated';
import { useAppDispatch } from '@store/hooks';
import { createEntityAdapter } from '@reduxjs/toolkit';

const postsAdapter = createEntityAdapter<PostQuery['post']>({
  selectId: post => post.id,
  sortComparer: (a, b) => b.createdAt - a.createdAt
});

const { selectAll, selectEntities, selectIds, selectTotal } = postsAdapter.getSelectors();

export interface PostListParams extends PaginationArgs {
  orderBy?: PostOrder;
  query?: string;
}
export interface PostListBody {
  posts: Post[];
  next: string;
}

export function useInfinitePostsQuery(
  params: PostListParams,
  fetchAll: boolean = false // if `true`: auto do next fetches to get all notes at once
) {
  const dispatch = useAppDispatch();
  const baseResult = usePostsQuery(params);

  const [trigger, nextResult, lastPromiseInfo] = useLazyPostsQuery();
  const [combinedData, setCombinedData] = useState(postsAdapter.getInitialState({}));

  const isBaseReady = useRef(false);
  const isNextDone = useRef(true);

  // next: starts with a null, fetching ended with an undefined cursor
  const next = useRef<null | string | undefined>(null);

  const data = useMemo(() => {
    return selectAll(combinedData);
  }, [combinedData]);

  // Base result
  useEffect(() => {
    next.current = baseResult.data?.allPosts?.pageInfo?.endCursor;
    if (baseResult?.data?.allPosts) {
      isBaseReady.current = true;

      setCombinedData(
        postsAdapter.setAll(
          combinedData,
          baseResult.data.allPosts.edges.map(item => item.node)
        )
      );
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
    totalCount: baseResult?.data?.allPosts?.totalCount ?? 0,
    error: baseResult?.error,
    isError: baseResult?.isError,
    isLoading: baseResult?.isLoading,
    isFetching: baseResult?.isFetching || nextResult?.isFetching,
    errorNext: nextResult?.error,
    isErrorNext: nextResult?.isError,
    isFetchingNext: nextResult?.isFetching,
    hasNext: baseResult.data?.allPosts?.pageInfo?.endCursor !== undefined,
    fetchNext,
    refetch
  };
}
