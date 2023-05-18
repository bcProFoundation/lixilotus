import { PaginationArgs } from '@bcpros/lixi-models';
import { createEntityAdapter } from '@reduxjs/toolkit';
import { api as commentApi, useCommentsToPostIdQuery, useLazyCommentsToPostIdQuery } from '@store/comment/comments.api';
import moment from 'moment';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CommentOrder } from '@generated/types.generated';

import { CommentQuery } from './comments.generated';

export interface CommentsByPostIdParams extends PaginationArgs {
  orderBy: CommentOrder;
  id: string;
}

const commentsAdapter = createEntityAdapter<CommentQuery['comment']>({
  selectId: post => post.id,
  sortComparer: (a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateA.getTime() - dateB.getTime();
  }
});
const { selectAll } = commentsAdapter.getSelectors();

export function useInfiniteCommentsToPostIdQuery(
  params: CommentsByPostIdParams,
  fetchAll = false // if `true`: auto do next fetches to get all notes at once
) {
  const baseResult = useCommentsToPostIdQuery(params);

  const [trigger, nextResult] = useLazyCommentsToPostIdQuery();
  const [combinedData, setCombinedData] = useState(commentsAdapter.getInitialState({}));

  const isBaseReady = useRef(false);
  const isNextDone = useRef(true);

  // next: starts with a null, fetching ended with an undefined cursor
  const next = useRef<null | string | undefined>(null);

  const data = useMemo(() => {
    const result = selectAll(combinedData);
    return result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateA.getTime() - dateB.getTime();
    });
  }, [combinedData]);

  // Base result
  useEffect(() => {
    next.current = baseResult.data?.allCommentsToPostId?.pageInfo?.endCursor;
    if (baseResult?.data?.allCommentsToPostId) {
      isBaseReady.current = true;

      const adapterSetAll = commentsAdapter.setAll(
        combinedData,
        baseResult.data.allCommentsToPostId.edges.map(item => item.node)
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
    totalCount: baseResult?.data?.allCommentsToPostId?.totalCount ?? 0,
    error: baseResult?.error,
    isError: baseResult?.isError,
    isLoading: baseResult?.isLoading,
    isFetching: baseResult?.isFetching || nextResult?.isFetching,
    errorNext: nextResult?.error,
    isErrorNext: nextResult?.isError,
    isFetchingNext: nextResult?.isFetching,
    hasNext: baseResult.data?.allCommentsToPostId?.pageInfo?.endCursor !== null,
    fetchNext,
    refetch
  };
}
