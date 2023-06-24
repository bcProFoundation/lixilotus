import { PaginationArgs } from '@bcpros/lixi-models';
import { createEntityAdapter } from '@reduxjs/toolkit';
import { api as postApi, useLazyPostsQuery, usePostsQuery } from '@store/post/posts.api';
import _ from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Post, PostOrder } from '@generated/types.generated';

import { PostQuery } from './posts.generated';

const postsAdapter = createEntityAdapter<PostQuery['post']>({
  selectId: post => post.id,
  sortComparer: (a, b) => b.createdAt - a.createdAt
});

const { selectAll } = postsAdapter.getSelectors();
export interface PostListParams extends PaginationArgs {
  accountId: number;
  isTop?: string;
  orderBy?: PostOrder[];
}

export function useInfinitePostsQuery(
  params: PostListParams,
  fetchAll = false // if `true`: auto do next fetches to get all notes at once
) {
  const baseResult = usePostsQuery(params);

  const [trigger, nextResult] = useLazyPostsQuery();
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
    next.current = baseResult.data?.allPosts?.pageInfo?.endCursor;
    if (baseResult?.data?.allPosts) {
      isBaseReady.current = true;

      const adapterSetAll = postsAdapter.setAll(
        combinedData,
        baseResult.data.allPosts.edges.map(item => item.node)
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
    data.length = 0; // delete data from memo
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
    hasNext: baseResult.data?.allPosts?.pageInfo?.endCursor !== null,
    fetchNext,
    refetch
  };
}
