import { PaginationArgs } from '@bcpros/lixi-models';
import { createEntityAdapter } from '@reduxjs/toolkit';
import { useAppDispatch } from '@store/hooks';
import { useLazyPostsByPageIdQuery, usePostsByPageIdQuery } from '@store/post/posts.generated';
import _ from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Post, PostOrder } from '@generated/types.generated';

import { PostQuery } from './posts.generated';

const postsAdapter = createEntityAdapter<PostQuery['post']>({
  selectId: post => post.id,
  sortComparer: (a, b) => b.createdAt - a.createdAt
});

const { selectAll, selectEntities, selectIds, selectTotal } = postsAdapter.getSelectors();

export interface PostListByIdParams extends PaginationArgs {
  orderBy?: PostOrder[];
  id?: string;
  accountId?: number;
}

export function useInfinitePostsByPageIdQuery(
  params: PostListByIdParams,
  fetchAll = false // if `true`: auto do next fetches to get all notes at once
) {
  const baseResult = usePostsByPageIdQuery(params, { skip: !params.id });

  const [trigger, nextResult, lastPromiseInfo] = useLazyPostsByPageIdQuery();
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
    next.current = baseResult.data?.allPostsByPageId?.pageInfo?.endCursor;
    if (baseResult?.data?.allPostsByPageId) {
      isBaseReady.current = true;

      const baseResultParse = baseResult.data.allPostsByPageId.edges.map(item => item.node);
      const adapterSetAll = postsAdapter.setAll(
        combinedData,
        baseResult.data.allPostsByPageId.edges.map(item => item.node)
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
    totalCount: baseResult?.data?.allPostsByPageId?.totalCount ?? 0,
    error: baseResult?.error,
    isError: baseResult?.isError,
    isLoading: baseResult?.isLoading,
    isFetching: baseResult?.isFetching || nextResult?.isFetching,
    errorNext: nextResult?.error,
    isErrorNext: nextResult?.isError,
    isFetchingNext: nextResult?.isFetching,
    hasNext: baseResult.data?.allPostsByPageId?.pageInfo?.endCursor !== null,
    fetchNext,
    refetch
  };
}
