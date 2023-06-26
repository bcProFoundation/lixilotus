import { PostsQueryTag } from '@bcpros/lixi-models/constants';
import { BurnForType, BurnQueueCommand, BurnType } from '@bcpros/lixi-models/lib/burn';
import CreatePostCard from '@components/Common/CreatePostCard';
import { currency } from '@components/Common/Ticker';
import { OrderDirection, PostOrderField } from '@generated/types.generated';
import useDidMountEffectNotification from '@local-hooks/useDidMountEffectNotification';
import { addRecentHashtagAtHome, getLeaderboard, setGraphqlRequestDone } from '@store/account/actions';
import {
  getGraphqlRequestStatus,
  getLeaderBoard,
  getRecentHashtagAtHome,
  getSelectedAccount,
  getSelectedAccountId
} from '@store/account/selectors';
import {
  addBurnQueue,
  addBurnTransaction,
  clearFailQueue,
  getBurnQueue,
  getFailQueue,
  getLatestBurnForPost
} from '@store/burn';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { setSelectedPost } from '@store/post/actions';
import { getSelectedPostId } from '@store/post/selectors';
import { useInfinitePostsBySearchQueryWithHashtag } from '@store/post/useInfinitePostsBySearchQueryWithHashtag';
import { useInfinitePostsQuery } from '@store/post/useInfinitePostsQuery';
import { saveTopPostsFilter } from '@store/settings/actions';
import { getFilterPostsHome, getIsTopPosts } from '@store/settings/selectors';
import { showToast } from '@store/toast/actions';
import { getAllWalletPaths, getSlpBalancesAndUtxos, getWalletStatus } from '@store/wallet';
import { fromSmallestDenomination, fromXpiToSatoshis } from '@utils/cashMethods';
import { MenuProps, Skeleton, Switch } from 'antd';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import SearchBox from '../Common/SearchBox';
import PostListItem from './PostListItem';

export const OPTION_BURN_VALUE = {
  LIKE: '1',
  DISLIKE: '1',
  LOVE: '10'
};

export const OPTION_BURN_TYPE = {
  LIKE: 'LIKE',
  DISLIKE: 'DISLIKE',
  LOVE: 'LOVE'
};

type PostsListingProps = {
  className?: string;
};

const StyledPostsListing = styled.div`
  margin: 1rem auto;
  width: 100%;
  max-width: 700px;
  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: transparent;
  }
  &.show-scroll {
    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background-image: linear-gradient(180deg, #d0368a 0%, #708ad4 99%) !important;
      box-shadow: inset 2px 2px 5px 0 rgba(#fff, 0.5);
      border-radius: 100px;
    }
  }

  .custom-query-list {
    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background: transparent;
    }
    &.show-scroll {
      &::-webkit-scrollbar {
        width: 5px;
      }
      &::-webkit-scrollbar-thumb {
        background-image: linear-gradient(180deg, #d0368a 0%, #708ad4 99%) !important;
        box-shadow: inset 2px 2px 5px 0 rgba(#fff, 0.5);
        border-radius: 100px;
      }
    }
    animation: fadeInAnimation 0.75s;
  }

  @keyframes fadeInAnimation {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (min-width: 960px) {
    .search-container {
      display: none !important;
    }
  }
`;

const StyledHeader = styled.div`
  .menu-post-listing {
    .ant-menu-item {
      .ant-menu-title-content {
        font-size: 14px;
        color: rgba(30, 26, 29, 0.6);
      }
      &.ant-menu-item-selected {
        .ant-menu-title-content {
          color: #1e1a1d;
          font-weight: 500;
        }
        &::after {
          border-bottom: none;
        }
      }
    }
  }
  .filter-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    text-wrap: nowrap;
  }
`;

const PostsListing: React.FC<PostsListingProps> = ({ className }: PostsListingProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const selectedAccountId = useAppSelector(getSelectedAccountId);
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const refPostsListing = useRef<HTMLDivElement | null>(null);
  const [tab, setTab] = useState<any>('all');
  const selectedAccount = useAppSelector(getSelectedAccount);
  const latestBurnForPost = useAppSelector(getLatestBurnForPost);
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const burnQueue = useAppSelector(getBurnQueue);
  const walletStatus = useAppSelector(getWalletStatus);
  const failQueue = useAppSelector(getFailQueue);
  const filterValue = useAppSelector(getFilterPostsHome);
  const leaderboard = useAppSelector(getLeaderBoard);
  const graphqlRequestLoading = useAppSelector(getGraphqlRequestStatus);
  const recentTagAtHome = useAppSelector(getRecentHashtagAtHome);
  const postIdSelected = useAppSelector(getSelectedPostId);
  const [suggestedHashtag, setSuggestedTags] = useState([]);
  let isTop = useAppSelector(getIsTopPosts);
  const [query, setQuery] = useState<any>('');
  const [hashtags, setHashtags] = useState<any>([]);

  useEffect(() => {
    if (router.query.q) {
      setQuery(router.query.q);
    } else {
      setQuery(null);
    }

    if (router.query.hashtags) {
      setHashtags((router.query.hashtags as string).split(' '));
    } else {
      setHashtags([]);
    }
  }, [router.query]);

  useEffect(() => dispatch(getLeaderboard()), []);
  const refs = useRef([]);
  const onClickMenu: MenuProps['onClick'] = e => {
    setTab(e.key);
  };

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext, refetch } = useInfinitePostsQuery(
    {
      first: 20,
      minBurnFilter: filterValue,
      accountId: selectedAccountId ?? null,
      isTop: String(isTop),
      orderBy: [
        {
          direction: OrderDirection.Desc,
          field: PostOrderField.UpdatedAt
        }
      ]
    },
    false
  );

  useEffect(() => {
    if (refs.current[postIdSelected]) {
      const heightPost = refs.current[postIdSelected].clientHeight;
      _.delay(() => {
        refs.current[postIdSelected].firstChild.classList.add('active-post');
        refs.current[postIdSelected].scrollIntoView({ behaviour: 'smooth' });
      }, 500);
      dispatch(setSelectedPost(''));
    }
  }, [data]);

  //#region QueryVirtuoso
  const { queryData, fetchNextQuery, hasNextQuery, isQueryFetching, isFetchingQueryNext, isQueryLoading } =
    useInfinitePostsBySearchQueryWithHashtag(
      {
        first: 20,
        minBurnFilter: filterValue ?? 1,
        query: query,
        hashtags: hashtags,
        orderBy: {
          direction: OrderDirection.Desc,
          field: PostOrderField.UpdatedAt
        }
      },
      false
    );

  const loadMoreQueryItems = () => {
    if (hasNextQuery && !isQueryFetching) {
      fetchNextQuery();
    } else if (hasNextQuery) {
      fetchNextQuery();
    }
  };

  useEffect(() => {
    setSuggestedTags(recentTagAtHome);
  }, [recentTagAtHome]);

  const QueryFooter = () => {
    if (isQueryLoading) return null;
    return (
      <div
        style={{
          padding: '1rem 2rem 2rem 2rem',
          textAlign: 'center'
        }}
      >
        {isFetchingQueryNext ? <Skeleton avatar active /> : "It's so empty here..."}
      </div>
    );
  };
  //#endregion

  //#region Normal Virtuoso
  const loadMoreItems = () => {
    if (hasNext && !isFetching) {
      fetchNext();
    } else if (hasNext) {
      fetchNext();
    }
  };

  const triggerSrollbar = e => {
    const virtuosoNode = refPostsListing.current.querySelector('#list-virtuoso') || null;
    virtuosoNode.classList.add('show-scroll');
    setTimeout(() => {
      virtuosoNode.classList.remove('show-scroll');
    }, 700);
  };

  const Header = () => {
    return (
      <StyledHeader>
        <CreatePostCard hashtags={hashtags} query={query} />
        <h1 style={{ textAlign: 'left', fontSize: '20px', margin: '1rem' }}>
          {query && intl.get('general.searchResults', { text: query })}
        </h1>
      </StyledHeader>
    );
  };

  const Footer = () => {
    return (
      <div
        style={{
          padding: '1rem 2rem 2rem 2rem',
          textAlign: 'center'
        }}
      >
        {isFetchingNext ? <Skeleton avatar active /> : "It's so empty here..."}
      </div>
    );
  };
  //#endregion

  useEffect(() => {
    if (data.length > 0) {
      dispatch(setGraphqlRequestDone());
    }
  }, [data]);

  const showPosts = () => {
    return (
      <React.Fragment>
        {!query && hashtags.length === 0 ? (
          <InfiniteScroll
            dataLength={data.length}
            next={loadMoreItems}
            hasMore={hasNext}
            loader={<Skeleton avatar active />}
            endMessage={
              <p style={{ textAlign: 'center' }}>
                <b>{data.length > 0 ? 'end reached' : ''}</b>
              </p>
            }
            scrollableTarget="scrollableDiv"
          >
            {data.map((item, index) => {
              return (
                <div
                  key={item.id}
                  ref={element => {
                    refs.current[item.id] = element;
                  }}
                >
                  <PostListItem
                    index={index}
                    item={item}
                    key={item.id}
                    handleBurnForPost={handleBurnForPost}
                    addToRecentHashtags={hashtag => dispatch(addRecentHashtagAtHome(hashtag.substring(1)))}
                  />
                </div>
              );
            })}
          </InfiniteScroll>
        ) : (
          <InfiniteScroll
            dataLength={queryData.length}
            next={loadMoreQueryItems}
            hasMore={hasNextQuery}
            loader={<Skeleton avatar active />}
            endMessage={<QueryFooter />}
            scrollableTarget="scrollableDiv"
          >
            {queryData.map((item, index) => {
              return (
                <PostListItem
                  index={index}
                  item={item}
                  key={item.id}
                  handleBurnForPost={handleBurnForPost}
                  addToRecentHashtags={hashtag => dispatch(addRecentHashtagAtHome(hashtag.substring(1)))}
                />
              );
            })}
          </InfiniteScroll>
        )}
      </React.Fragment>
    );
  };

  useDidMountEffectNotification();
  const handleBurnForPost = async (isUpVote: boolean, post: any, optionBurn?: string) => {
    try {
      const burnValue = OPTION_BURN_VALUE[optionBurn];
      if (failQueue.length > 0) dispatch(clearFailQueue());
      const fundingFirstUtxo = slpBalancesAndUtxos.nonSlpUtxos[0];
      const currentWalletPath = walletPaths.filter(acc => acc.xAddress === fundingFirstUtxo.address).pop();
      const { hash160, xAddress } = currentWalletPath;
      const burnType = isUpVote ? BurnType.Up : BurnType.Down;
      const burnedBy = hash160;
      const burnForId = post.id;
      let tipToAddresses: { address: string; amount: string }[] = [];
      let tag: string;

      if (_.isNil(post.page) && _.isNil(post.token)) {
        tag = PostsQueryTag.Posts;
        tipToAddresses.push({
          address: post.postAccount.address,
          amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(currency.burnFee)).valueOf().toString()
        });
      } else if (post.page) {
        tag = PostsQueryTag.PostsByPageId;
        tipToAddresses.push({
          address: post.page.pageAccount.address,
          amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(currency.burnFee)).valueOf().toString()
        });
      } else if (post.token) {
        tag = PostsQueryTag.PostsByTokenId;
      }

      tipToAddresses = tipToAddresses.filter(item => item.address != selectedAccount.address);
      const totalTip = fromSmallestDenomination(
        tipToAddresses.reduce((total, item) => total + parseFloat(item.amount), 0)
      );
      if (
        slpBalancesAndUtxos.nonSlpUtxos.length == 0 ||
        fromSmallestDenomination(walletStatus.balances.totalBalanceInSatoshis) < parseInt(burnValue) + totalTip
      ) {
        throw new Error(intl.get('account.insufficientFunds'));
      }

      const burnCommand: BurnQueueCommand = {
        defaultFee: currency.defaultFee,
        burnType,
        burnForType: BurnForType.Post,
        burnedBy,
        burnForId,
        burnValue,
        tipToAddresses: tipToAddresses,
        postQueryTag: tag,
        pageId: post.page?.id,
        tokenId: post.token?.id,
        minBurnFilter: filterValue
      };

      dispatch(addBurnQueue(_.omit(burnCommand)));
      dispatch(addBurnTransaction(burnCommand));
    } catch (e) {
      const errorMessage = e.message || intl.get('post.unableToBurn');
      dispatch(
        showToast('error', {
          message: errorMessage,
          duration: 3
        })
      );
    }
  };

  return (
    <StyledPostsListing>
      <SearchBox />
      <Header />

      {graphqlRequestLoading ? <Skeleton avatar active /> : showPosts()}
    </StyledPostsListing>
  );
};

export default PostsListing;
