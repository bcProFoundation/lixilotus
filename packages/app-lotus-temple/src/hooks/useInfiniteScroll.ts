import { UseQuery, UseLazyQuery } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

export interface UseInfiniteQueryResult {}

const useInfiniteScroll = (
  useGetDataListQuery: UseQuery<any>,
  useLazyGetDataListQuery: UseLazyQuery<any>,
  { size = 20, ...queryParams }
) => {
  const baseResult = useGetDataListQuery({
    first: size,
    ...queryParams
  });

  // Lazy query with trigger can be fired many times
  const [trigger, nextResult] = useLazyGetDataListQuery();

  const isBaseReady = useRef(false);
  const isNextDone = useRef(false);

  // next cursor, start with a null, fetching ended with an undefined cursor
  const next = useRef<null | string | number | undefined>(null);

  const { data, isLoading, isSuccess, isError } = baseResult;

  useEffect(() => {
    if (data) {
      isBaseReady.current = true;
    }
  }, []);

  return {};
};
