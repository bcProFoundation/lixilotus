import { PaginationArgs } from '@bcpros/lixi-models';
import { useLazyTempleBySearchQuery, useTempleBySearchQuery } from '@store/temple/temple.generated';
import { useEffect, useRef, useState, useMemo } from 'react';
import { TempleOrder } from 'src/generated/types.generated';
import _ from 'lodash';
import { createEntityAdapter } from '@reduxjs/toolkit';
import { TempleQuery } from './temple.generated';

const templeAdapter = createEntityAdapter<TempleQuery['temple']>({
  selectId: temple => temple.id,
  sortComparer: (a, b) => b.createdAt - a.createdAt
});

const { selectAll, selectEntities, selectIds, selectTotal } = templeAdapter.getSelectors();

export interface TempleBySearchListParams extends PaginationArgs {
  query?: string;
  orderBy?: TempleOrder;
}

export function useInfiniteTemplesBySearchQuery(
  params: TempleBySearchListParams,
  fetchAll: boolean = false // if `true`: auto do next fetches to get all notes at once
) {
  const baseResult = useTempleBySearchQuery(params, { skip: params.query === null });

  const [trigger, nextResult] = useLazyTempleBySearchQuery();
  const [combinedData, setCombinedData] = useState(templeAdapter.getInitialState({}));

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
    next.current = baseResult.data?.allTempleBySearch?.pageInfo?.endCursor;
    if (baseResult?.data?.allTempleBySearch) {
      isBaseReady.current = true;

      const baseResultParse = baseResult.data.allTempleBySearch.edges.map(item => item.node);
      const adapterSetAll = templeAdapter.setAll(
        combinedData,
        baseResult.data.allTempleBySearch.edges.map(item => item.node)
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
    hasNext: baseResult.data?.allTempleBySearch?.pageInfo?.endCursor !== null,
    fetchNext,
    refetch
  };
}
