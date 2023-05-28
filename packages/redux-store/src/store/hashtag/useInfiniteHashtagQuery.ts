import { PaginationArgs } from '@bcpros/lixi-models';
import { useLazyHashtagsQuery, useHashtagsQuery } from '@store/hashtag/hashtag.generated';
import { useEffect, useRef, useState, useMemo } from 'react';
import { HashtagOrder } from '@generated/types.generated';
import _ from 'lodash';
import { createEntityAdapter } from '@reduxjs/toolkit';
import { HashtagQuery } from './hashtag.generated';

const hashtagAdapter = createEntityAdapter<HashtagQuery['hashtag']>({
  selectId: temple => temple.id,
  sortComparer: (a, b) => b.createdAt - a.createdAt
});

const { selectAll, selectEntities, selectIds, selectTotal } = hashtagAdapter.getSelectors();

export interface HashtagListParams extends PaginationArgs {
  orderBy?: HashtagOrder;
  disableFetch?: boolean;
}

export function useInfiniteHashtagQuery(
  params: HashtagListParams,
  fetchAll: boolean = false // if `true`: auto do next fetches to get all notes at once
) {
  const baseResult = useHashtagsQuery(params, { skip: params.disableFetch });

  const [trigger, nextResult] = useLazyHashtagsQuery();
  const [combinedData, setCombinedData] = useState(hashtagAdapter.getInitialState({}));

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
    next.current = baseResult.data?.allHashtag?.pageInfo?.endCursor;
    if (baseResult?.data?.allHashtag) {
      isBaseReady.current = true;

      const baseResultParse = baseResult.data.allHashtag.edges.map(item => item.node);
      const adapterSetAll = hashtagAdapter.setAll(
        combinedData,
        baseResult.data.allHashtag.edges.map(item => item.node)
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
    totalCount: baseResult?.data?.allHashtag?.totalCount ?? 0,
    error: baseResult?.error,
    isError: baseResult?.isError,
    isLoading: baseResult?.isLoading,
    isFetching: baseResult?.isFetching || nextResult?.isFetching,
    errorNext: nextResult?.error,
    isErrorNext: nextResult?.isError,
    isFetchingNext: nextResult?.isFetching,
    hasNext: baseResult.data?.allHashtag?.pageInfo?.endCursor !== null,
    fetchNext,
    refetch
  };
}
