import { PaginationArgs } from '@bcpros/lixi-models';
import { useLazyPostsByTokenIdQuery, usePostsByTokenIdQuery } from '@store/post/posts.generated';
import { useEffect, useRef, useState, useMemo } from 'react';
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

interface PostListByIdParams extends PaginationArgs {
  orderBy?: PostOrder;
  id?: string;
  accountId?: number;
}

export function useInfinitePostsByTokenIdQuery(
  params: PostListByIdParams,
  fetchAll: boolean = false // if `true`: auto do next fetches to get all notes at once
) {
  const dispatch = useAppDispatch();
  const baseResult = usePostsByTokenIdQuery(params);

  const [trigger, nextResult, lastPromiseInfo] = useLazyPostsByTokenIdQuery();
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
    next.current = baseResult.data?.allPostsByTokenId?.pageInfo?.endCursor;
    if (baseResult?.data?.allPostsByTokenId) {
      isBaseReady.current = true;

      const baseResultParse = baseResult.data.allPostsByTokenId.edges.map(item => item.node);
      const adapterSetAll = postsAdapter.setAll(
        combinedData,
        baseResult.data.allPostsByTokenId.edges.map(item => item.node)
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
    totalCount: baseResult?.data?.allPostsByTokenId?.totalCount ?? 0,
    error: baseResult?.error,
    isError: baseResult?.isError,
    isLoading: baseResult?.isLoading,
    isFetching: baseResult?.isFetching || nextResult?.isFetching,
    errorNext: nextResult?.error,
    isErrorNext: nextResult?.isError,
    isFetchingNext: nextResult?.isFetching,
    hasNext: baseResult.data?.allPostsByTokenId?.pageInfo?.endCursor !== null,
    fetchNext,
    refetch
  };
}
