import CreatePostCard from '@components/Common/CreatePostCard';
import {
  getGraphqlRequestStatus,
  getLeaderBoard,
  getRecentHashtagAtHome,
  getSelectedAccount,
  getSelectedAccountId
} from '@store/account/selectors';
import { useInfinitePostsQuery } from '@store/post/useInfinitePostsQuery';
import { WalletContext } from '@context/index';
import {
  addBurnQueue,
  addBurnTransaction,
  getBurnQueue,
  getFailQueue,
  getLatestBurnForPost,
  clearFailQueue
} from '@store/burn';
import { api as postApi, useLazyPostQuery } from '@store/post/posts.api';
import { Menu, MenuProps, Modal, notification, Skeleton, Tabs, Collapse, Space, Select, Button, Switch } from 'antd';
import _ from 'lodash';
import React, { useRef, useState, useEffect } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { OrderDirection, Post, PostOrderField } from '@generated/types.generated';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import styled from 'styled-components';
import SearchBox from '../Common/SearchBox';
import intl from 'react-intl-universal';
import { FireTwoTone, LoadingOutlined } from '@ant-design/icons';
import PostListItem from './PostListItem';
import InfiniteScroll from 'react-infinite-scroll-component';
import { setGraphqlRequestDone, setTransactionReady, addRecentHashtagAtHome } from '@store/account/actions';
import { getAllWalletPaths, getSlpBalancesAndUtxos, getWalletStatus } from '@store/wallet';
import { PostsQueryTag } from '@bcpros/lixi-models/constants';
import { BurnForType, BurnQueueCommand, BurnType } from '@bcpros/lixi-models/lib/burn';
import { currency } from '@components/Common/Ticker';
import { fromSmallestDenomination, fromXpiToSatoshis, toSmallestDenomination } from '@utils/cashMethods';
import BigNumber from 'bignumber.js';
import { showToast } from '@store/toast/actions';
import { Spin } from 'antd';
import { FilterBurnt } from '@components/Common/FilterBurn';
import { FilterType } from '@bcpros/lixi-models/lib/filter';
import { getFilterPostsHome, getIsTopPosts } from '@store/settings/selectors';
import { getLeaderboard } from '@store/account/actions';
import useDidMountEffectNotification from '@local-hooks/useDidMountEffectNotification';
import { useInfinitePostsBySearchQueryWithHashtag } from '@store/post/useInfinitePostsBySearchQueryWithHashtag';
import { setSelectedPost } from '@store/post/actions';
import { getSelectedPostId } from '@store/post/selectors';
import { saveTopPostsFilter } from '@store/settings/actions';

const { Panel } = Collapse;
const antIcon = <LoadingOutlined style={{ fontSize: 20 }} spin />;
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
  max-width: 816px;
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
  @media (max-width: 960px) {
    padding-bottom: 9rem;
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
    margin-botton: 1rem;
    text-wrap: nowrap;
  }
`;

const StyledCollapse = styled(Collapse)`
  .ant-collapse-header {
    font-size: 16px;
    padding: 0px 0px 5px 0px !important;
  }
  .ant-collapse-content-box {
    padding: 5px 0px 5px 0px !important;
  }
`;

const StyledNotificationContent = styled.div`
  font-size: 14px;
`;

const PostsListing: React.FC<PostsListingProps> = ({ className }: PostsListingProps) => {
  const dispatch = useAppDispatch();
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
  const [hashtags, setHashtags] = useState([]);
  const [suggestedHashtag, setSuggestedTags] = useState([]);
  let isTop = useAppSelector(getIsTopPosts);

  const HandleMenuPosts = (checked: boolean) => {
    dispatch(saveTopPostsFilter(checked));
  };

  const menuItems = [
    {
      label: (
        <Switch
          checkedChildren={intl.get('general.allPost')}
          unCheckedChildren={intl.get('general.topPost')}
          defaultChecked={isTop}
          onChange={HandleMenuPosts}
        />
      ),
      key: 'all'
    }
  ];

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
      orderBy: {
        direction: OrderDirection.Desc,
        field: PostOrderField.UpdatedAt
      }
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
        query: searchValue,
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
        <CreatePostCard hashtags={hashtags} query={searchValue} />
        <h1 style={{ textAlign: 'left', fontSize: '20px', margin: '1rem' }}>
          {searchValue && intl.get('general.searchResults', { text: searchValue })}
        </h1>
        <div className="filter-bar">
          <Menu
            className="menu-post-listing"
            style={{
              border: 'none',
              position: 'relative',
              background: 'var(--bg-color-light-theme)',
              width: '-webkit-fill-available'
            }}
            mode="horizontal"
            defaultSelectedKeys={['all']}
            selectedKeys={tab}
            onClick={onClickMenu}
            items={menuItems}
          ></Menu>

          <FilterBurnt filterForType={FilterType.PostsHome} />
        </div>
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

  const addHashtag = hashtag => {
    if (!hashtags.includes(hashtag)) {
      setHashtags(prevHashtag => {
        return [...prevHashtag, hashtag];
      });
    }
  };

  const searchPost = (value: string, hashtagsValue?: string[]) => {
    setSearchValue(value);

    if (hashtagsValue && hashtagsValue.length > 0) setHashtags([...hashtagsValue]);

    hashtagsValue.map(hashtag => {
      dispatch(addRecentHashtagAtHome(hashtag.substring(1)));
    });
  };

  const onDeleteQuery = () => {
    setSearchValue(null);
    setHashtags([]);
  };

  const onDeleteHashtag = (hashtagsValue: string[]) => {
    setHashtags([...hashtagsValue]);
  };

  const showPosts = () => {
    return (
      <React.Fragment>
        {!searchValue && hashtags.length === 0 ? (
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
                    addHashtag={addHashtag}
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
                  addHashtag={addHashtag}
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
      <SearchBox
        searchPost={searchPost}
        searchValue={searchValue}
        hashtags={hashtags}
        onDeleteHashtag={onDeleteHashtag}
        onDeleteQuery={onDeleteQuery}
        suggestedHashtag={suggestedHashtag}
      />
      <Header />

      {graphqlRequestLoading ? <Skeleton avatar active /> : showPosts()}
    </StyledPostsListing>
  );
};

export default PostsListing;
