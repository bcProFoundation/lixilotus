import { PaginationArgs } from '@bcpros/lixi-models';
import { useEffect, useRef } from 'react';
import { Page, PageOrder } from 'src/generated/types.generated';
import { useLazyPagesQuery, usePagesQuery } from './pages.generated';

export interface PageListParams {
  skip?: number;
  after?: string;
  before?: string;
  first?: number;
  last?: number;
  orderBy?: PageOrder;
  query?: string;
}
export interface PageListBody {
  pages: Page[];
  next: string;
}

export function useInfinitePagesQuery(params: PaginationArgs) {
  const baseResult = usePagesQuery(params);

  const [trigger, nextResult] = useLazyPagesQuery();

  const isBaseReady = useRef(false);
  const isNextDone = useRef(true);
  const next = useRef<null | string | undefined>(null);

  // Base result
  useEffect(() => {
    next.current = baseResult.data?.allPages.pageInfo.endCursor;
    if (baseResult.data.allPages) {
      isBaseReady.current = true;
      fetchNext();
    }
  }, [baseResult]);

  const fetchNext = async () => {
    if (!isBaseReady.current || !isNextDone.current || next.current === undefined || next.current === null) return;

    try {
      isNextDone.current = false;
      await trigger({
        ...params,
      });
    } catch (e) {
    } finally {
      isNextDone.current = true;
      fetchNext();
    }
  };
}
