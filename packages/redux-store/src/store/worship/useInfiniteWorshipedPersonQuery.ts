import { PaginationArgs } from '@bcpros/lixi-models';
import { createEntityAdapter } from '@reduxjs/toolkit';
import {
  useLazyWorshipedPeopleQuery,
  useWorshipedPeopleQuery,
  api as worshipedPeopleApi
} from '@store/worship/worshipedPerson.api';
import _ from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import { WorshipedPerson, WorshipedPersonOrder } from 'src/generated/types.generated';

import { WorshipedPersonQuery } from './worshipedPerson.generated';

const worshipedPeopleAdapter = createEntityAdapter<WorshipedPersonQuery['worshipedPerson']>({
  selectId: person => person.id,
  sortComparer: (a, b) => b.createdAt - a.createdAt
});

const { selectAll } = worshipedPeopleAdapter.getSelectors();

export interface WorshipedPersonListParams extends PaginationArgs {
  orderBy?: WorshipedPersonOrder;
  query?: string;
}

export function useInfiniteWorshipedPersonQuery(
  params: WorshipedPersonListParams,
  fetchAll = false // if `true`: auto do next fetches to get all notes at once
) {
  const baseResult = useWorshipedPeopleQuery(params, { skip: params.query === null });

  const [trigger, nextResult] = useLazyWorshipedPeopleQuery();
  const [combinedData, setCombinedData] = useState(worshipedPeopleAdapter.getInitialState({}));

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
    next.current = baseResult.data?.allWorshipedPerson?.pageInfo?.endCursor;
    if (baseResult?.data?.allWorshipedPerson) {
      isBaseReady.current = true;

      const adapterSetAll = worshipedPeopleAdapter.setAll(
        combinedData,
        baseResult.data.allWorshipedPerson.edges.map(item => item.node)
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
    totalCount: baseResult?.data?.allWorshipedPerson?.totalCount ?? 0,
    error: baseResult?.error,
    isError: baseResult?.isError,
    isLoading: baseResult?.isLoading,
    isFetching: baseResult?.isFetching || nextResult?.isFetching,
    errorNext: nextResult?.error,
    isErrorNext: nextResult?.isError,
    isFetchingNext: nextResult?.isFetching,
    hasNext: baseResult.data?.allWorshipedPerson?.pageInfo?.endCursor !== null,
    fetchNext,
    refetch
  };
}
