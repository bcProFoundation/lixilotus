import { PaginationArgs } from '@bcpros/lixi-models';
import { createEntityAdapter } from '@reduxjs/toolkit';
import { api as timelineApi, useLazyHomeTimelineQuery } from '@store/timeline/timeline.api';
import _ from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';

import { TimelineQuery, useTimelineQuery } from './timeline.generated';
import { useHomeTimelineQuery } from './timeline.api';

const homeTimelineAdapter = createEntityAdapter<TimelineQuery['timeline']>({
  selectId: item => item.id
});

const { selectAll } = homeTimelineAdapter.getSelectors();

export interface TimelineListParams extends PaginationArgs {
  level: number;
}

export function useInfiniteHomeTimelineQuery(
  params: TimelineListParams,
  fetchAll = false // if `true`: auto do next fetches to get all notes at once
) {
  const baseResult = useHomeTimelineQuery(params);

  const [trigger, nextResult] = useLazyHomeTimelineQuery();
  const [combinedData, setCombinedData] = useState(homeTimelineAdapter.getInitialState({}));

  const isBaseReady = useRef(false);
  const isNextDone = useRef(true);

  // next: starts with a null, fetching ended with an undefined cursor
  const next = useRef<null | string | undefined>(null);

  const data = useMemo(() => {
    const result = selectAll(combinedData);
    console.log('result', result);
    return result;
  }, [combinedData]);

  // Base result
  useEffect(() => {
    next.current = baseResult.data?.homeTimeline?.pageInfo?.endCursor;
    if (baseResult?.data?.homeTimeline) {
      isBaseReady.current = true;

      const adapterSetAll = homeTimelineAdapter.setAll(
        combinedData,
        baseResult.data.homeTimeline.edges.map(item => item.node)
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
    data.length = 0; // delete data from memo
    await baseResult.refetch(); // restart with a whole new refetching
  };

  return {
    data: data ?? [],
    totalCount: baseResult?.data?.homeTimeline?.totalCount ?? 0,
    error: baseResult?.error,
    isError: baseResult?.isError,
    isLoading: baseResult?.isLoading,
    isFetching: baseResult?.isFetching || nextResult?.isFetching,
    errorNext: nextResult?.error,
    isErrorNext: nextResult?.isError,
    isFetchingNext: nextResult?.isFetching,
    hasNext: baseResult.data?.homeTimeline?.pageInfo?.endCursor !== null,
    fetchNext,
    refetch
  };
}
