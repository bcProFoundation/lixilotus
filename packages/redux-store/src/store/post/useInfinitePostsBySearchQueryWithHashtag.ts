import { PaginationArgs } from '@bcpros/lixi-models';
import { createEntityAdapter } from '@reduxjs/toolkit';
import { useAppDispatch } from '@store/hooks';
import { useLazyPostsBySearchWithHashtagQuery, usePostsBySearchWithHashtagQuery } from '@store/post/posts.api';
import _ from 'lodash';
import { useMemo } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Post, PostOrder } from '@generated/types.generated';

import { PostQuery } from './posts.generated';

const postsAdapter = createEntityAdapter<PostQuery['post']>({
  selectId: post => post.id,
  sortComparer: (a, b) => b.createdAt - a.createdAt
});

const { selectAll, selectEntities, selectIds, selectTotal } = postsAdapter.getSelectors();

interface PostListParams extends PaginationArgs {
  query: string;
  hashtags: string[];
  orderBy?: PostOrder;
}

export function useInfinitePostsBySearchQueryWithHashtag(
  params: PostListParams,
  fetchAll = false // if `true`: auto do next fetches to get all notes at once
) {
  const dispatch = useAppDispatch();
  const baseResult = usePostsBySearchWithHashtagQuery(params, {
    skip: params.query === null && params.hashtags.length === 0
  });

  const [trigger, nextResult, lastPromiseInfo] = useLazyPostsBySearchWithHashtagQuery();
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
    next.current = baseResult.data?.allPostsBySearchWithHashtag?.pageInfo?.endCursor;
    if (baseResult?.data?.allPostsBySearchWithHashtag) {
      isBaseReady.current = true;

      const baseResultParse = baseResult.data.allPostsBySearchWithHashtag.edges.map(item => item.node);
      const adapterSetAll = postsAdapter.setAll(
        combinedData,
        baseResult.data.allPostsBySearchWithHashtag.edges.map(item => item.node)
      );

      setCombinedData(adapterSetAll);
      fetchAll && fetchNextQuery();
    }
  }, [baseResult]);

  const fetchNextQuery = async () => {
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
      fetchAll && fetchNextQuery();
    }
  };

  const refetchQuery = async () => {
    isBaseReady.current = false;
    next.current = null; // restart
    await baseResult.refetch(); // restart with a whole new refetching
  };

  return {
    queryData: data ?? [],
    queryError: baseResult?.error,
    isQueryError: baseResult?.isError,
    isQueryLoading: baseResult?.isLoading,
    isQueryFetching: baseResult?.isFetching || nextResult?.isFetching,
    errorQueryNext: nextResult?.error,
    isErrorQueryNext: nextResult?.isError,
    isFetchingQueryNext: nextResult?.isFetching,
    hasNextQuery: baseResult.data?.allPostsBySearchWithHashtag?.pageInfo?.endCursor !== null,
    noMoreQuery:
      baseResult.data?.allPostsBySearchWithHashtag?.pageInfo?.endCursor === null ||
      baseResult.data?.allPostsBySearchWithHashtag?.pageInfo?.hasNextPage === false,
    fetchNextQuery,
    refetchQuery
  };
}
