import { PaginationArgs } from '@bcpros/lixi-models';
import { useLazyPostsQuery, usePostsQuery, api as postApi } from '@store/post/posts.api';
import { useEffect, useRef, useState } from 'react';
import { Post, PostOrder } from 'src/generated/types.generated';
import _ from 'lodash';
import { PostQuery } from './posts.generated';
import { useAppDispatch } from '@store/hooks';

export interface PostListParams extends PaginationArgs {
  orderBy?: PostOrder;
  query?: string;
}
export interface PostListBody {
  posts: Post[];
  next: string;
}

export function useInfinitePostsQuery(
  params: PostListParams,
  fetchAll: boolean = false // if `true`: auto do next fetches to get all notes at once
) {
  const dispatch = useAppDispatch();
  const baseResult = usePostsQuery(params);

  const [trigger, nextResult, lastPromiseInfo] = useLazyPostsQuery();
  const [queryUpdatedTrigger, queryUpdatedResult] = useLazyPostsQuery();
  const [combinedData, setCombinedData] = useState([]);

  const cursorMapping = useRef({});

  const isBaseReady = useRef(false);
  const isNextDone = useRef(true);

  // next: starts with a null, fetching ended with an undefined cursor
  const next = useRef<null | string | undefined>(null);

  // Base result
  useEffect(() => {
    next.current = baseResult.data?.allPosts?.pageInfo?.endCursor;
    if (baseResult?.data?.allPosts) {
      isBaseReady.current = true;
      _.map(baseResult.data.allPosts.edges, item => {
        cursorMapping.current[item.node.id] = params;
      });
      setCombinedData(baseResult.data.allPosts.edges.map(item => item.node));
      fetchAll && fetchNext();
    }
  }, [baseResult]);

  // When there're next results
  useEffect(() => {
    // Not success next result
    if (!nextResult.isSuccess) return;

    if (
      isBaseReady.current &&
      nextResult.data &&
      nextResult.data.allPosts.pageInfo &&
      nextResult.data.allPosts.pageInfo.endCursor != next.current
    ) {
      next.current = nextResult.data.allPosts.pageInfo.endCursor;

      const newItems = nextResult.data.allPosts.edges.map(item => item.node);
      if (newItems && newItems.length) {
        _.map(newItems, item => {
          cursorMapping.current[item.id] = lastPromiseInfo.lastArg;
        });
        setCombinedData(currentItems => {
          return [...currentItems, ...newItems];
        });
      }
    }
  }, [nextResult]);

  useEffect(() => {
    if (!queryUpdatedResult.isSuccess) return;
    if (
      isBaseReady.current &&
      queryUpdatedResult.data &&
      queryUpdatedResult.data.allPosts.pageInfo &&
      queryUpdatedResult.data.allPosts.pageInfo.endCursor != next.current
    ) {
      next.current = nextResult.data.allPosts.pageInfo.endCursor;

      const updatedItems = queryUpdatedResult.data.allPosts.edges.map(item => item.node);
      const updatedItemsDict = _.keyBy(updatedItems, 'id');

      if (updatedItems && updatedItems.length) {
        setCombinedData(currentItems => {
          return currentItems.map(item =>
            updatedItemsDict[item.id] ? { ...item, ...updatedItemsDict[item.id] } : item
          );
        });
      }
    }
  }, [queryUpdatedResult]);

  const updatePost = async (post: PostQuery['post']) => {
    const params = cursorMapping.current[post.id];
    if (params) {
      dispatch(
        postApi.util.updateQueryData('Posts', params, draft => {
          const postToUpdate = draft.allPosts.edges.find(item => item.node.id === post.id);
          if (postToUpdate) {
            postToUpdate.node = post;
          }
        })
      );
      fetchParams(params);
    }
  };

  const fetchParams = async (params: PostListParams) => {
    if (!isBaseReady.current) return;
    try {
      await queryUpdatedTrigger(params);
    } catch (e) {}
    queryUpdatedTrigger(params);
  };

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
    data: combinedData ?? [],
    totalCount: baseResult?.data?.allPosts?.totalCount ?? 0,
    error: baseResult?.error,
    isError: baseResult?.isError,
    isLoading: baseResult?.isLoading,
    isFetching: baseResult?.isFetching || nextResult?.isFetching || queryUpdatedResult.isFetching,
    errorNext: nextResult?.error,
    isErrorNext: nextResult?.isError,
    isFetchingNext: nextResult?.isFetching,
    hasNext: baseResult.data?.allPosts?.pageInfo?.endCursor !== undefined,
    fetchNext,
    refetch,
    updatePost
  };
}
