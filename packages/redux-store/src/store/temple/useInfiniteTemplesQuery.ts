import { PaginationArgs } from '@bcpros/lixi-models';
import { useLazyTemplesQuery, useTemplesQuery } from '@store/temple/temple.generated';
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

export interface TempleListParams extends PaginationArgs {
  orderBy?: TempleOrder;
  disableFetch?: boolean;
}

export function useInfiniteTemplesQuery(
  params: TempleListParams,
  fetchAll: boolean = false // if `true`: auto do next fetches to get all notes at once
) {
  const baseResult = useTemplesQuery(params, { skip: params.disableFetch });

  const [trigger, nextResult] = useLazyTemplesQuery();
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
    next.current = baseResult.data?.allTemple?.pageInfo?.endCursor;
    if (baseResult?.data?.allTemple) {
      isBaseReady.current = true;

      const baseResultParse = baseResult.data.allTemple.edges.map(item => item.node);
      const adapterSetAll = templeAdapter.setAll(
        combinedData,
        baseResult.data.allTemple.edges.map(item => item.node)
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
    totalCount: baseResult?.data?.allTemple?.totalCount ?? 0,
    error: baseResult?.error,
    isError: baseResult?.isError,
    isLoading: baseResult?.isLoading,
    isFetching: baseResult?.isFetching || nextResult?.isFetching,
    errorNext: nextResult?.error,
    isErrorNext: nextResult?.isError,
    isFetchingNext: nextResult?.isFetching,
    hasNext: baseResult.data?.allTemple?.pageInfo?.endCursor !== null,
    fetchNext,
    refetch
  };
}
