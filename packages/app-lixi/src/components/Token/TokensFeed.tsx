import { CopyOutlined, LikeOutlined } from '@ant-design/icons';
import UpVoteSvg from '@assets/icons/upVotePurple.svg';
import { PostsQueryTag } from '@bcpros/lixi-models/constants';
import { BurnForType, BurnQueueCommand, BurnType } from '@bcpros/lixi-models/lib/burn';
import { FilterType } from '@bcpros/lixi-models/lib/filter';
import CreatePostCard from '@components/Common/CreatePostCard';
import { FilterBurnt } from '@components/Common/FilterBurn';
import SearchBox from '@components/Common/SearchBox';
import { currency } from '@components/Common/Ticker';
import { InfoSubCard } from '@components/Lixi';
import { IconBurn } from '@components/Posts/PostDetail';
import PostListItem from '@components/Posts/PostListItem';
import { HashtagOrderField, OrderDirection, PostOrderField } from '@generated/types.generated';
import useDidMountEffectNotification from '@local-hooks/useDidMountEffectNotification';
import { setTransactionReady, addRecentHashtagAtToken } from '@store/account/actions';
import { getRecentHashtagAtToken, getSelectedAccount, getSelectedAccountId } from '@store/account/selectors';
import { addBurnQueue, addBurnTransaction, clearFailQueue, getBurnQueue, getFailQueue } from '@store/burn';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { useInfinitePostsBySearchQueryWithHashtagAtToken } from '@store/post/useInfinitePostsBySearchQueryWithHashtagAtToken';
import { useInfinitePostsByTokenIdQuery } from '@store/post/useInfinitePostsByTokenIdQuery';
import { getFilterPostsToken, getSearchToken } from '@store/settings/selectors';
import { showToast } from '@store/toast/actions';
import { TokenQuery } from '@store/token/tokens.generated';
import { getAllWalletPaths, getSlpBalancesAndUtxos, getWalletStatus } from '@store/wallet';
import { formatBalance, fromSmallestDenomination } from '@utils/cashMethods';
import { Image, Menu, MenuProps, Skeleton, Tabs, message, notification } from 'antd';
import makeBlockie from 'ethereum-blockies-base64';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import InfiniteScroll from 'react-infinite-scroll-component';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import _ from 'lodash';
import { useInfiniteHashtagByTokenQuery } from '@store/hashtag/useInfiniteHashtagByTokenQuery';

export type TokenItem = TokenQuery['token'];

const StyledTokensFeed = styled.div`
  margin: 1rem auto;
  width: 100%;
  max-width: 816px;
  .content {
    display: flex;
    justify-content: space-between;
    position: relative;
    margin-top: 1rem;
    .ant-tabs {
      flex: 1;
      .ant-tabs-nav {
        &::before {
          content: none;
        }
      }
    }
    .filter {
      position: absolute;
      right: 0;
      top: 10px;
    }
  }
  @media (max-width: 960px) {
    padding-bottom: 7rem;
  }
`;

const BannerTicker = styled.div`
  padding: 2rem;
  background-image: url(/images/xec-home-bg.svg);
  margin-bottom: 10px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 1px solid var(--border-item-light);
  border-radius: var(--border-radius-primary);
  .banner-detail {
    display: flex;
    gap: 2rem;
    .avatar-ticker {
      img {
        width: 120px;
        height: 120px;
      }
    }
    // css reponsive Show more info in token page
    .info-ticker {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      .info-ticker__left {
        display: flex;
        flex-direction: column;
        justify-content: end;
        align-items: flex-start;
      }
      .info-ticker__right {
        margin-right: 150px;
        display: flex;
        flex-direction: column;
        justify-content: end;
        align-items: flex-start;
      }
      .title-ticker {
        margin: 0;
        font-size: 28px;
        line-height: 40px;
        color: #fff;
      }
      .ant-space {
        flex-direction: row;
        justify-content: center;
        align-items: baseline;
        .type-name {
          min-width: 100px;
          text-align: left;
          color: #edeff099;
        }
        .content {
          margin-top: 4px;
          color: #fff;
          .anticon {
            margin-left: 4px;
          }
        }
      }
      @media (max-width: 650px) {
        flex-direction: column;
      }
    }
    @media (max-width: 960px) {
      flex-direction: column;
    }
  }
  .score-ticker {
    margin-left: 75vh;
    display: inline-flex;
    margin-top: 1rem;
    @media (min-width: 85px) {
      margin-left: 60vh;
    }
    @media (min-width: 30px) {
      margin-left: 40vh;
    }
    @media (min-width: 20px) {
      margin-left: 30vh;
    }
    .count {
      color: #edeff099 !important;
    }
    span {
      color: #edeff099 !important;
    }
    span {
      font-size: 14px;
      line-height: 28px;
      color: #4e444b;
      &.burn-index {
        margin-right: 2rem;
      }
    }
  }
  @media (max-width: 960px) {
    padding: 1rem;
    margin-bottom: 1rem;
  }
`;

const SearchBar = styled.div`
  @media (min-width: 960px) {
    display: none;
  }
`;

type TokenProps = {
  token: any;
  isMobile: boolean;
};

const TokensFeed = ({ token, isMobile }: TokenProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [tokenDetailData, setTokenDetailData] = useState<any>(token);
  const selectedAccount = useAppSelector(getSelectedAccount);
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const burnQueue = useAppSelector(getBurnQueue);
  const walletStatus = useAppSelector(getWalletStatus);
  const failQueue = useAppSelector(getFailQueue);
  const selectedAccountId = useAppSelector(getSelectedAccountId);
  const filterValue = useAppSelector(getFilterPostsToken);
  const slpBalancesAndUtxosRef = useRef(slpBalancesAndUtxos);
  const recentTagAtToken = useAppSelector(getRecentHashtagAtToken);
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [hashtags, setHashtags] = useState([]);
  const [suggestedHashtag, setSuggestedTags] = useState([]);
  const [searchValueToken, setSearchValueToken] = useState<string | null>(null);
  const [hashtagsToken, setHashtagsToken] = useState([]);
  const searchDataToken = useAppSelector(getSearchToken);

  let options = ['Withdraw', 'Rename', 'Export'];

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext, refetch } = useInfinitePostsByTokenIdQuery(
    {
      first: 10,
      minBurnFilter: filterValue ?? 1,
      accountId: selectedAccountId ?? null,
      orderBy: {
        direction: OrderDirection.Desc,
        field: PostOrderField.UpdatedAt
      },
      id: token.id
    },
    false
  );

  const { data: hashtagData } = useInfiniteHashtagByTokenQuery(
    {
      first: 3,
      orderBy: {
        direction: OrderDirection.Desc,
        field: HashtagOrderField.LotusBurnScore
      },
      id: token.id
    },
    false
  );

  useEffect(() => {
    const tokenId = token.id;
    const topHashtags = _.map(hashtagData, 'content');
    const tokenRecentHashtag = recentTagAtToken.find((page: any) => page.id === tokenId);
    const recentHashtags: string[] = tokenRecentHashtag?.hashtags || [];

    const combinedHashtags = [...topHashtags, ...recentHashtags.filter(tag => !topHashtags.includes(tag))];

    setSuggestedTags(combinedHashtags);
  }, [recentTagAtToken, hashtagData]);
  useEffect(() => {
    if (searchDataToken?.searchValue) {
      setSearchValueToken(searchDataToken.searchValue);
    }
    if (searchDataToken?.hashtags) {
      setHashtagsToken(searchDataToken.hashtags);
    }
  }, [searchDataToken]);

  const loadMoreItems = () => {
    if (hasNext && !isFetching) {
      fetchNext();
    } else if (hasNext) {
      fetchNext();
    }
  };

  const { queryData, fetchNextQuery, hasNextQuery, isQueryFetching, isFetchingQueryNext, isQueryLoading, noMoreQuery } =
    useInfinitePostsBySearchQueryWithHashtagAtToken(
      {
        first: 20,
        minBurnFilter: filterValue ?? 1,
        query: searchValueToken,
        hashtags: hashtagsToken,
        tokenId: token.id,
        orderBy: {
          direction: OrderDirection.Desc,
          field: PostOrderField.UpdatedAt
        }
      },
      false
    );

  const loadMoreQueryItems = () => {
    if (hasNextQuery && !isQueryFetching && !noMoreQuery) {
      fetchNextQuery();
    } else if (hasNextQuery && !noMoreQuery) {
      fetchNextQuery();
    }
  };

  const handleOnCopy = (id: string) => {
    notification.info({
      message: intl.get('token.copyId'),
      description: id,
      placement: 'top'
    });
  };

  useEffect(() => {
    if (router.query.hashtag) {
      addHashtag(`#${router.query.hashtag}`);
    }
  }, []);

  const menus = options.map(option => <Menu.Item key={option}>{option}</Menu.Item>);

  const UpvoteIcon = () => {
    return (
      <>
        <UpVoteSvg />
      </>
    );
  };

  useEffect(() => {
    if (slpBalancesAndUtxos === slpBalancesAndUtxosRef.current) return;
    dispatch(setTransactionReady());
  }, [slpBalancesAndUtxos.nonSlpUtxos]);

  useDidMountEffectNotification();

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

      const burnCommand: BurnQueueCommand = {
        defaultFee: currency.defaultFee,
        burnType,
        burnForType: BurnForType.Post,
        burnedBy,
        burnForId,
        burnValue,
        postQueryTag: PostsQueryTag.PostsByTokenId,
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

  const searchPost = (value: string, hashtagsValue?: string[]) => {
    setSearchValue(value);

    if (hashtagsValue && hashtagsValue.length > 0) setHashtags([...hashtagsValue]);

    hashtagsValue.map(hashtag => {
      dispatch(addRecentHashtagAtToken({ id: token.id, hashtag: hashtag.substring(1) }));
    });
  };

  const onDeleteQuery = () => {
    setSearchValue(null);
    setHashtags([]);
  };

  const onDeleteHashtag = (hashtagsValue: string[]) => {
    setHashtags([...hashtagsValue]);
  };

  const addHashtag = hashtag => {
    if (!hashtags.includes(hashtag)) {
      setHashtags(prevHashtag => {
        return [...prevHashtag, hashtag];
      });
    }
  };

  const showPosts = () => {
    return (
      <React.Fragment>
        {!searchValueToken && hashtagsToken.length === 0 ? (
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
        ) : (
          <InfiniteScroll
            dataLength={queryData.length}
            next={loadMoreQueryItems}
            hasMore={hasNextQuery && !noMoreQuery}
            loader={<Skeleton avatar active />}
            endMessage={
              <p style={{ textAlign: 'center' }}>
                <b>{data.length > 0 ? 'end reached' : ''}</b>
              </p>
            }
            scrollableTarget="scrollableDiv"
          >
            {queryData.map((item, index) => {
              return (
                <PostListItem
                  index={index}
                  item={item}
                  key={item.id}
                  addHashtag={addHashtag}
                  handleBurnForPost={handleBurnForPost}
                />
              );
            })}
          </InfiniteScroll>
        )}
      </React.Fragment>
    );
  };

  return (
    <StyledTokensFeed>
      <BannerTicker>
        <div className="banner-detail">
          <div className="avatar-ticker">
            <Image
              width={120}
              height={120}
              src={`${currency.tokenIconsUrl}/128/${tokenDetailData.tokenId}.png`}
              fallback={makeBlockie(tokenDetailData?.tokenId ?? '')}
              preview={false}
            />
          </div>
          {/* Show more info in token page */}
          <div className="info-ticker">
            <div className="info-ticker__left">
              <h4 className="title-ticker">{tokenDetailData['ticker']}</h4>
              <InfoSubCard typeName={intl.get('token.ticker')} content={tokenDetailData.ticker} />
              <InfoSubCard typeName={intl.get('token.name')} content={tokenDetailData.name} />
              <InfoSubCard typeName={intl.get('token.burntxpi')} content={tokenDetailData.lotusBurnUp} />
            </div>
            <div className="info-ticker__right">
              <CopyToClipboard text={tokenDetailData.tokenId} onCopy={() => handleOnCopy(tokenDetailData.tokenId)}>
                <InfoSubCard
                  typeName={intl.get('token.id')}
                  content={tokenDetailData.tokenId.slice(0, 7) + '...' + tokenDetailData.tokenId.slice(-7)}
                  icon={CopyOutlined}
                  onClickIcon={() => {}}
                />
              </CopyToClipboard>
              <InfoSubCard
                typeName={intl.get('token.created')}
                content={moment(tokenDetailData.createdDate).format('YYYY-MM-DD HH:MM')}
              />
              <InfoSubCard
                typeName={intl.get('token.comments')}
                content={moment(tokenDetailData.comments).format('YYYY-MM-DD HH:MM')}
              />
            </div>
          </div>
        </div>
        <div className="score-ticker">
          <LikeOutlined style={{ marginRight: '10px', fontSize: '1.2rem' }} />
          <IconBurn
            imgUrl="/images/ico-burn-up.svg"
            burnValue={formatBalance(tokenDetailData?.lotusBurnUp ?? 0)}
            key={`list-vertical-upvote-o-${tokenDetailData.id}`}
            dataItem={tokenDetailData}
            onClickIcon={() => {}}
          />
        </div>
      </BannerTicker>

      <SearchBar>
        <SearchBox
          searchPost={searchPost}
          searchValue={searchValue}
          hashtags={hashtags}
          onDeleteHashtag={onDeleteHashtag}
          onDeleteQuery={onDeleteQuery}
          suggestedHashtag={suggestedHashtag}
          searchType="searchToken"
        />
      </SearchBar>
      <CreatePostCard hashtags={hashtags} tokenPrimaryId={tokenDetailData.id} query={searchValue} />
      <div className="content">
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Top discussions" key="1">
            <React.Fragment>{showPosts()}</React.Fragment>
            {/* <div className={'listing'} style={{ height: '100vh' }}>
              <Virtuoso
                className={'listing'}
                style={{ height: '100%' }}
                data={data}
                endReached={loadMoreItems}
                overscan={900}
                itemContent={(index, item) => {
                  return <PostListItem index={index} item={item} />;
                }}
                totalCount={totalCount}
                components={{
                  Footer: () => {
                    return (
                      <div
                        style={{
                          padding: '1rem',
                          textAlign: 'center'
                        }}
                      >
                        end reached
                      </div>
                    );
                  }
                }}
              />
            </div> */}
          </Tabs.TabPane>
          {/* <Tabs.TabPane tab="Most recent" key="2">
            Content of Tab Pane 2
          </Tabs.TabPane> */}
        </Tabs>
        <div className="filter">
          {/* <Dropdown overlay={<Menu onClick={e => handleMenuClick(e)}>{menus}</Menu>}>
            <Button type="primary" className="outline-btn">
              <Space>
                All favorables
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown> */}
        </div>
      </div>
    </StyledTokensFeed>
  );
};

export default TokensFeed;
