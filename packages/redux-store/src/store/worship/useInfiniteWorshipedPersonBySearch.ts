import { PaginationArgs } from '@bcpros/lixi-models';
import {
  useLazyWorshipedPersonBySearchQuery,
  useWorshipedPersonBySearchQuery
} from '@store/worship/worshipedPerson.generated';
import { useEffect, useRef, useState, useMemo } from 'react';
import { WorshipedPerson, WorshipedPersonOrder } from '@generated/types.generated';
import _ from 'lodash';
import { WorshipedPersonQuery } from './worshipedPerson.generated';
import { useAppDispatch } from '@store/hooks';
import { createEntityAdapter } from '@reduxjs/toolkit';

const worshipAdapter = createEntityAdapter<WorshipedPersonQuery['worshipedPerson']>({
  selectId: worship => worship.id,
  sortComparer: (a, b) => b.createdAt - a.createdAt
});

const { selectAll, selectEntities, selectIds, selectTotal } = worshipAdapter.getSelectors();

export interface WorshipedBySearchListParams extends PaginationArgs {
  query?: string;
  orderBy?: WorshipedPersonOrder;
}

export function useInfiniteWorshipedPersonBySearch(
  params: WorshipedBySearchListParams,
  fetchAll: boolean = false // if `true`: auto do next fetches to get all notes at once
) {
  const baseResult = useWorshipedPersonBySearchQuery(params, { skip: params.query === null });

  const [trigger, nextResult] = useLazyWorshipedPersonBySearchQuery();
  const [combinedData, setCombinedData] = useState(worshipAdapter.getInitialState({}));

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
    next.current = baseResult.data?.allWorshipedPersonBySearch?.pageInfo?.endCursor;
    if (baseResult?.data?.allWorshipedPersonBySearch) {
      isBaseReady.current = true;

      const baseResultParse = baseResult.data.allWorshipedPersonBySearch.edges.map(item => item.node);
      const adapterSetAll = worshipAdapter.setAll(
        combinedData,
        baseResult.data.allWorshipedPersonBySearch.edges.map(item => item.node)
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
    error: baseResult?.error,
    isError: baseResult?.isError,
    isLoading: baseResult?.isLoading,
    isFetching: baseResult?.isFetching || nextResult?.isFetching,
    errorNext: nextResult?.error,
    isErrorNext: nextResult?.isError,
    isFetchingNext: nextResult?.isFetching,
    hasNext: baseResult.data?.allWorshipedPersonBySearch?.pageInfo?.endCursor !== null,
    fetchNext,
    refetch
  };
}
