import { PaginationArgs } from '@bcpros/lixi-models';
import { createEntityAdapter } from '@reduxjs/toolkit';
import { useAppDispatch } from '@store/hooks';
import { PageQuery } from '@store/page/pages.generated';
import { useAllPagesByFollowerQuery, useLazyAllPagesByFollowerQuery } from '@store/follow/follows.generated';
import _ from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PageOrder } from '@generated/types.generated';
import { TokenQuery } from '@store/token/tokens.generated';

type PageOrToken = { id: string | number; page?: PageQuery['page']; token?: TokenQuery['token'] };
const followPagesAdapter = createEntityAdapter<PageOrToken>({
  selectId: entity => entity.id,
  sortComparer: (a, b) => {
    if (isPageEntity(a) && isPageEntity(b)) {
      return b.createdAt.localeCompare(a.createdAt);
    }
    if (isTokenEntity(a) && isTokenEntity(b)) {
      return b.createdDate.localeCompare(a.createdDate);
    }
    return 0;
  }
});

function isPageEntity(entity: PageOrToken): entity is PageQuery['page'] {
  return !!entity.page && entity.page.__typename === 'Page';
}

function isTokenEntity(entity: PageOrToken): entity is TokenQuery['token'] {
  return !!entity.token && entity.token.__typename === 'Token';
}

const { selectAll, selectEntities, selectIds, selectTotal } = followPagesAdapter.getSelectors();

interface PageListByIdParams extends PaginationArgs {
  orderBy?: PageOrder;
  id?: number;
  pagesOnly?: boolean;
}

export function useInfinitePagesByFollowerIdQuery(
  params: PageListByIdParams,
  fetchAll = false // if `true`: auto do next fetches to get all notes at once
) {
  const baseResult = useAllPagesByFollowerQuery(params);

  const [trigger, nextResult] = useLazyAllPagesByFollowerQuery();
  const [combinedData, setCombinedData] = useState(followPagesAdapter.getInitialState({}));

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
    next.current = baseResult.data?.allPagesByFollower?.pageInfo?.endCursor;
    if (baseResult?.data?.allPagesByFollower) {
      isBaseReady.current = true;

      const baseResultParse = baseResult.data.allPagesByFollower.edges.reduce((entities, edge) => {
        const entity = edge.node;
        if (entity) {
          return { ...entities, [entity.id]: entity };
        }
        return entities;
      }, {});
      const adapterSetAll = followPagesAdapter.setAll(combinedData, baseResultParse);

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
    totalCount: baseResult?.data?.allPagesByFollower?.totalCount ?? 0,
    error: baseResult?.error,
    isError: baseResult?.isError,
    isLoading: baseResult?.isLoading,
    isFetching: baseResult?.isFetching || nextResult?.isFetching,
    errorNext: nextResult?.error,
    isErrorNext: nextResult?.isError,
    isFetchingNext: nextResult?.isFetching,
    hasNext: baseResult.data?.allPagesByFollower?.pageInfo?.endCursor !== null,
    fetchNext,
    refetch
  };
}
