import { PaginationArgs } from '@bcpros/lixi-models';
import { useLazyHashtagsByTokenQuery, useHashtagsByTokenQuery } from '@store/hashtag/hashtag.api';
import { useEffect, useRef, useState, useMemo } from 'react';
import { HashtagOrder } from '@generated/types.generated';
import _ from 'lodash';
import { createEntityAdapter } from '@reduxjs/toolkit';
import { HashtagQuery } from './hashtag.generated';

const hashtagAdapter = createEntityAdapter<HashtagQuery['hashtag']>({
  selectId: hashtag => hashtag.id,
  sortComparer: (a, b) => b.createdAt - a.createdAt
});

const { selectAll, selectEntities, selectIds, selectTotal } = hashtagAdapter.getSelectors();

export interface HashtagListParams extends PaginationArgs {
  orderBy?: HashtagOrder;
  id: string;
}

export function useInfiniteHashtagByTokenQuery(
  params: HashtagListParams,
  fetchAll: boolean = false // if `true`: auto do next fetches to get all notes at once
) {
  const baseResult = useHashtagsByTokenQuery(params, { skip: _.isNil(params.id) });

  const [trigger, nextResult] = useLazyHashtagsByTokenQuery();
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
    next.current = baseResult.data?.allHashtagByToken?.pageInfo?.endCursor;
    if (baseResult?.data?.allHashtagByToken) {
      isBaseReady.current = true;

      const baseResultParse = baseResult.data.allHashtagByToken.edges.map(item => item.node);
      const adapterSetAll = hashtagAdapter.setAll(
        combinedData,
        baseResult.data.allHashtagByToken.edges.map(item => item.node)
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
    totalCount: baseResult?.data?.allHashtagByToken?.totalCount ?? 0,
    error: baseResult?.error,
    isError: baseResult?.isError,
    isLoading: baseResult?.isLoading,
    isFetching: baseResult?.isFetching || nextResult?.isFetching,
    errorNext: nextResult?.error,
    isErrorNext: nextResult?.isError,
    isFetchingNext: nextResult?.isFetching,
    hasNext: baseResult.data?.allHashtagByToken?.pageInfo?.endCursor !== null,
    fetchNext,
    refetch
  };
}
