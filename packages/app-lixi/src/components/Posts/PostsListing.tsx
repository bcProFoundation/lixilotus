import QRCode from '@bcpros/lixi-components/components/Common/QRCode';
import CreatePostCard from '@components/Common/CreatePostCard';
import { getSelectedAccount, getSelectedAccountId } from '@store/account/selectors';
import { useInfinitePostsBySearchQuery } from '@store/post/useInfinitePostsBySearchQuery';
import { useInfinitePostsQuery } from '@store/post/useInfinitePostsQuery';
import { useInfiniteOrphanPostsQuery } from '@store/post/useInfiniteOrphanPostsQuery';
import { useInfinitePostsByPageIdQuery } from '@store/post/useInfinitePostsByPageIdQuery';
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
import { Menu, MenuProps, Modal, notification, Skeleton, Tabs, Collapse, Space, Select } from 'antd';
import _ from 'lodash';
import React, { useRef, useState, useEffect } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { OrderDirection, Post, PostOrderField } from 'src/generated/types.generated';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import styled from 'styled-components';
import SearchBox from '../Common/SearchBox';
import intl from 'react-intl-universal';
import { FireTwoTone, LoadingOutlined } from '@ant-design/icons';
import PostListItem from './PostListItem';
import InfiniteScroll from 'react-infinite-scroll-component';
import { setTransactionReady } from '@store/account/actions';
import { getAllWalletPaths, getSlpBalancesAndUtxos, getWalletStatus } from '@store/wallet';
import { PostsQueryTag } from '@bcpros/lixi-models/constants';
import { BurnForType, BurnQueueCommand, BurnType } from '@bcpros/lixi-models/lib/burn';
import { currency } from '@components/Common/Ticker';
import { fromSmallestDenomination, fromXpiToSatoshis } from '@utils/cashMethods';
import BigNumber from 'bignumber.js';
import useDidMountEffect from '@hooks/useDidMountEffect ';
import { showToast } from '@store/toast/actions';
import { Spin } from 'antd';
import { showBurnNotification } from '@components/Common/showBurnNotification';
import { FilterBurnt } from '@components/Common/FilterBurn';
import { FilterType } from '@bcpros/lixi-models/lib/filter';
import { getFilterPostsHome } from '@store/settings/selectors';

const { Panel } = Collapse;
const antIcon = <LoadingOutlined style={{ fontSize: 20 }} spin />;

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
          border-bottom: 2px solid #9e2a9c !important;
        }
      }
    }
  }
  .filter-bar {
    display: flex;
    justify-content: space-between;
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
const menuItems = [
  // { label: 'Top', key: 'top' },
  { label: 'All', key: 'all' }
  // { label: 'New', key: 'new' },
  // {
  //   label: 'Follows',
  //   key: 'follows'
  // },
  // {
  //   label: 'Hot discussion',
  //   key: 'hotDiscussion'
  // }
];

const PostsListing: React.FC<PostsListingProps> = ({ className }: PostsListingProps) => {
  const dispatch = useAppDispatch();
  const selectedAccountId = useAppSelector(getSelectedAccountId);
  const [isShowQrCode, setIsShowQrCode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const refPostsListing = useRef<HTMLDivElement | null>(null);
  const [tab, setTab] = useState<any>('all');
  const [queryPostTrigger, queryPostResult] = useLazyPostQuery();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const latestBurnForPost = useAppSelector(getLatestBurnForPost);
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const burnQueue = useAppSelector(getBurnQueue);
  const walletStatus = useAppSelector(getWalletStatus);
  const failQueue = useAppSelector(getFailQueue);
  const filterValue = useAppSelector(getFilterPostsHome);

  const onClickMenu: MenuProps['onClick'] = e => {
    setTab(e.key);
  };

  const {
    data: orphanData,
    totalCount: orphanTotalCount,
    fetchNext: orphanFetchNext,
    hasNext: orphanHasNext,
    isFetching: orphanIsFetching,
    isFetchingNext: orphanIsFetchingNext,
    refetch: orphanRefetch
  } = useInfiniteOrphanPostsQuery(
    {
      first: 20,
      minBurnFilter: filterValue ?? 1,
      accountId: selectedAccountId ?? null,
      orderBy: {
        direction: OrderDirection.Desc,
        field: PostOrderField.UpdatedAt
      }
    },
    false
  );

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext, refetch } = useInfinitePostsQuery(
    {
      first: 20,
      minBurnFilter: filterValue,
      accountId: selectedAccountId ?? null,
      orderBy: {
        direction: OrderDirection.Desc,
        field: PostOrderField.UpdatedAt
      }
    },
    false
  );

  useEffect(() => {
    refetch();
    orphanRefetch();
  }, [filterValue]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  //#region QueryVirtuoso
  const { queryData, fetchNextQuery, hasNextQuery, isQueryFetching, isFetchingQueryNext, isQueryLoading } =
    useInfinitePostsBySearchQuery(
      {
        first: 20,
        minBurnFilter: filterValue,
        query: searchValue
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

  const searchPost = value => {
    setSearchValue(value);
  };

  const QueryHeader = () => {
    return (
      <div>
        <SearchBox searchPost={searchPost} value={searchValue} />
        <h1 style={{ textAlign: 'left', fontSize: '20px', margin: '1rem' }}>
          {intl.get('general.searchResults', { text: searchValue })}
        </h1>
      </div>
    );
  };

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
    switch (tab) {
      case 'top':
        if (orphanHasNext && !orphanIsFetching) {
          orphanFetchNext();
        } else if (orphanHasNext) {
          orphanFetchNext();
        }
        return;
      case 'all':
        if (hasNext && !isFetching) {
          fetchNext();
        } else if (hasNext) {
          fetchNext();
        }
        return;
    }
  };

  const triggerSrollbar = e => {
    const virtuosoNode = refPostsListing.current.querySelector('#list-virtuoso') || null;
    virtuosoNode.classList.add('show-scroll');
    setTimeout(() => {
      virtuosoNode.classList.remove('show-scroll');
    }, 700);
  };

  //TODO: Data not consistent when change tab
  const Header = () => {
    return (
      <StyledHeader>
        <SearchBox searchPost={searchPost} value={searchValue} />
        <CreatePostCard />
        <div className="filter-bar">
          <Menu
            className="menu-post-listing"
            style={{
              border: 'none',
              position: 'relative',
              marginBottom: '1rem',
              background: 'var(--bg-color-light-theme)'
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
        {isFetchingNext || orphanIsFetchingNext ? <Skeleton avatar active /> : "It's so empty here..."}
      </div>
    );
  };
  //#endregion

  useEffect(() => {
    (async () => {
      if (latestBurnForPost) {
        const post = await queryPostTrigger({ id: latestBurnForPost.burnForId });
        dispatch(
          postApi.util.updateQueryData('Posts', undefined, draft => {
            const postToUpdate = draft.allPosts.edges.find(item => item.node.id === latestBurnForPost.burnForId);
            if (postToUpdate) {
              postToUpdate.node = post.data.post;
            }
          }),
          postApi.util.updateQueryData('OrphanPosts', undefined, draft => {
            const postToUpdate = draft.allOrphanPosts.edges.find(item => item.node.id === latestBurnForPost.burnForId);
            if (postToUpdate) {
              postToUpdate.node = post.data.post;
            }
          })
        );
        postApi.util.invalidateTags(['Post']);
      }
    })();
  }, [latestBurnForPost]);

  const showPosts = () => {
    switch (tab) {
      case 'top':
        return (
          <Virtuoso
            id="list-virtuoso"
            onScroll={e => triggerSrollbar(e)}
            style={{ height: '100vh', paddingBottom: '2rem' }}
            data={orphanData}
            endReached={loadMoreItems}
            overscan={3000}
            itemContent={(index, item) => {
              return <PostListItem index={index} item={item} />;
            }}
            components={{ Header, Footer }}
          />
        );
      case 'all':
        return (
          <React.Fragment>
            <Header />
            <InfiniteScroll
              dataLength={data.length}
              next={loadMoreItems}
              hasMore={hasNext}
              loader={<Skeleton avatar active />}
              endMessage={
                <p style={{ textAlign: 'center' }}>
                  <b>{"It's so empty here..."}</b>
                </p>
              }
              scrollableTarget="scrollableDiv"
            >
              {data.map((item, index) => {
                return <PostListItem index={index} item={item} key={item.id} handleBurnForPost={handleBurnForPost} />;
              })}
            </InfiniteScroll>
          </React.Fragment>
        );
    }
  };

  useDidMountEffect(() => {
    if (burnQueue.length > 0) {
      showBurnNotification('info', burnQueue);
    } else {
      showBurnNotification('success');
    }

    if (failQueue.length > 0) {
      showBurnNotification('error');
    }
  }, [burnQueue, failQueue]);

  const handleBurnForPost = async (isUpVote: boolean, post: any) => {
    try {
      const burnValue = '1';
      if (
        slpBalancesAndUtxos.nonSlpUtxos.length == 0 ||
        fromSmallestDenomination(walletStatus.balances.totalBalanceInSatoshis) < parseInt(burnValue)
      ) {
        throw new Error(intl.get('account.insufficientFunds'));
      }
      if (failQueue.length > 0) dispatch(clearFailQueue());
      const fundingFirstUtxo = slpBalancesAndUtxos.nonSlpUtxos[0];
      const currentWalletPath = walletPaths.filter(acc => acc.xAddress === fundingFirstUtxo.address).pop();
      const { hash160, xAddress } = currentWalletPath;
      const burnType = isUpVote ? BurnType.Up : BurnType.Down;
      const burnedBy = hash160;
      const burnForId = post.id;
      let tipToAddresses: { address: string; amount: string }[] = [
        {
          address: post.page ? post.pageAccount.address : post.postAccount.address,
          amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(0.04)) as unknown as string
        }
      ];

      if (burnType === BurnType.Up && selectedAccount.address !== post.postAccount.address) {
        tipToAddresses.push({
          address: post.postAccount.address,
          amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(0.04)) as unknown as string
        });
      }

      tipToAddresses = tipToAddresses.filter(item => item.address != selectedAccount.address);

      let tag: string;

      if (_.isNil(post.page) && _.isNil(post.token)) {
        tag = PostsQueryTag.Posts;
      } else if (post.page) {
        tag = PostsQueryTag.PostsByPageId;
      } else if (post.token) {
        tag = PostsQueryTag.PostsByTokenId;
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

      dispatch(addBurnQueue(burnCommand));
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
    <StyledPostsListing ref={refPostsListing}>
      {!searchValue ? (
        showPosts()
      ) : (
        <React.Fragment>
          <QueryHeader />
          <InfiniteScroll
            dataLength={queryData.length}
            next={loadMoreQueryItems}
            hasMore={hasNextQuery}
            loader={<Skeleton avatar active />}
            endMessage={
              <p style={{ textAlign: 'center' }}>
                <b>{"It's so empty here..."}</b>
              </p>
            }
            scrollableTarget="scrollableDiv"
          >
            {queryData.map((item, index) => {
              return <PostListItem index={index} item={item} key={item.id} handleBurnForPost={handleBurnForPost} />;
            })}
          </InfiniteScroll>
        </React.Fragment>
      )}
    </StyledPostsListing>
  );
};

export default PostsListing;
