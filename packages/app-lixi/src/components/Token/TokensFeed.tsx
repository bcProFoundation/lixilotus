import { CopyOutlined, LikeOutlined } from '@ant-design/icons';
import { PostListType, PostsQueryTag } from '@bcpros/lixi-models/constants';
import { BurnForType, BurnQueueCommand, BurnType } from '@bcpros/lixi-models/lib/burn';
import CreatePostCard from '@components/Common/CreatePostCard';
import SearchBox from '@components/Common/SearchBox';
import { currency } from '@components/Common/Ticker';
import { InfoSubCard } from '@components/Lixi';
import { IconBurn } from '@components/Posts/PostDetail';
import PostListItem from '@components/Posts/PostListItem';
import {
  CreateFollowTokenInput,
  DeleteFollowTokenInput,
  HashtagOrderField,
  OrderDirection,
  PostOrderField
} from '@generated/types.generated';
import useDidMountEffectNotification from '@local-hooks/useDidMountEffectNotification';
import { addRecentHashtagAtToken, setTransactionReady } from '@store/account/actions';
import { getSelectedAccountId } from '@store/account/selectors';
import { addBurnQueue, addBurnTransaction, clearFailQueue, getFailQueue } from '@store/burn';
import { useInfiniteHashtagByTokenQuery } from '@store/hashtag/useInfiniteHashtagByTokenQuery';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { useInfinitePostsBySearchQueryWithHashtagAtToken } from '@store/post/useInfinitePostsBySearchQueryWithHashtagAtToken';
import { useInfinitePostsByTokenIdQuery } from '@store/post/useInfinitePostsByTokenIdQuery';
import { getFilterPostsToken } from '@store/settings/selectors';
import { showToast } from '@store/toast/actions';
import { TokenQuery } from '@store/token/tokens.generated';
import { getAllWalletPaths, getSlpBalancesAndUtxos, getWalletStatus } from '@store/wallet';
import { formatBalance, fromSmallestDenomination } from '@utils/cashMethods';
import { Image, Menu, Skeleton, Tabs, notification, Tag, Button } from 'antd';
import makeBlockie from 'ethereum-blockies-base64';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import InfiniteScroll from 'react-infinite-scroll-component';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import _ from 'lodash';
import { useCreateFollowTokenMutation, useDeleteFollowTokenMutation } from '@store/follow/follows.api';

export type TokenItem = TokenQuery['token'];
export type BurnTokenData = {
  data: TokenItem;
  burnForType: BurnForType.Token;
};
const StyledTokensFeed = styled.div`
  margin: 1rem auto;
  width: 100%;
  max-width: 816px;
  .content {
    display: flex;
    justify-content: space-between;
    position: relative;
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
        border-radius: var(--border-radius-primary);
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
        // margin-right: 150px;
        display: flex;
        flex-direction: column;
        justify-content: end;
        align-items: flex-start;
      }
      .token-name-follow {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-start;

        .title-ticker {
          margin: 0;
          font-size: 28px;
          line-height: 40px;
          color: #fff;
        }
      }
      .ant-space {
        flex-direction: row;
        justify-content: center;
        align-items: baseline;
        .type-name {
          font-size: 12px;
          font-weight: 600;
          min-width: 100px;
          text-align: left;
          color: #edeff099;
        }
        .content {
          font-size: 14px;
          text-align: left;
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
      gap: 1rem;
      flex-direction: column;
      .token-name-follow {
        justify-content: center !important;
      }
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

const TagContainer = styled.div`
  display: flex;
  margin-bottom: 8px;
  @media (max-width: 576px) {
    display: none;
  }
`;

const StyledTag = styled(Tag)`
  font-weight: bold;
  font-style: italic;
  font-size: 15px;
  height: 24px;
  margin-bottom: 5px;
  margin-right: 5px;
  cursor: pointer;
`;

type TokenProps = {
  token: any;
  checkIsFollowed: boolean;
  isMobile: boolean;
};

const TokensFeed = ({ token, checkIsFollowed, isMobile }: TokenProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [tokenDetailData, setTokenDetailData] = useState<any>(token);
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const walletStatus = useAppSelector(getWalletStatus);
  const failQueue = useAppSelector(getFailQueue);
  const selectedAccountId = useAppSelector(getSelectedAccountId);
  const filterValue = useAppSelector(getFilterPostsToken);
  const slpBalancesAndUtxosRef = useRef(slpBalancesAndUtxos);
  const [query, setQuery] = useState<any>('');
  const [hashtags, setHashtags] = useState<any>([]);

  let options = ['Withdraw', 'Rename', 'Export'];

  useEffect(() => {
    if (router.query.hashtags) {
      setHashtags((router.query.hashtags as string).split(' '));
    } else {
      setHashtags([]);
    }
  }, [router.query.hashtags]);

  useEffect(() => {
    if (router.query.q) {
      setQuery(router.query.q as string);
    } else {
      setQuery(null);
    }
  }, [router.query.q]);

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext, refetch } = useInfinitePostsByTokenIdQuery(
    {
      first: 20,
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
        field: HashtagOrderField.DanaBurnScore
      },
      id: token.id
    },
    false
  );

  const [
    createFollowTokenTrigger,
    {
      isLoading: isLoadingCreateFollowToken,
      isSuccess: isSuccessCreateFollowToken,
      isError: isErrorCreateFollowToken,
      error: errorOnCreateFollowToken
    }
  ] = useCreateFollowTokenMutation();

  const [
    deleteFollowTokenTrigger,
    {
      isLoading: isLoadingDeleteFollowToken,
      isSuccess: isSuccessDeleteFollowToken,
      isError: isErrorDeleteFollowToken,
      error: errorOnDelete
    }
  ] = useDeleteFollowTokenMutation();

  // useEffect(() => {
  //   const tokenId = token.id;
  //   const topHashtags = _.map(hashtagData, 'content');
  //   const tokenRecentHashtag = recentTagAtToken.find((page: any) => page.id === tokenId);
  //   const recentHashtags: string[] = tokenRecentHashtag?.hashtags || [];

  //   const combinedHashtags = [...topHashtags, ...recentHashtags.filter(tag => !topHashtags.includes(tag))];

  //   setSuggestedTags(combinedHashtags);
  // }, [recentTagAtToken, hashtagData]);

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
        query: query,
        hashtags: hashtags,
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
    dispatch(
      showToast('info', {
        message: intl.get('token.copyId'),
        description: id
      })
    );
  };

  const menus = options.map(option => <Menu.Item key={option}>{option}</Menu.Item>);

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
        extraArguments: {
          postQueryTag: PostsQueryTag.PostsByTokenId,
          tokenId: post.token?.id,
          minBurnFilter: filterValue,
          query: query,
          hashtags: hashtags
        }
      };

      dispatch(addBurnQueue(burnCommand));
      dispatch(addBurnTransaction(burnCommand));
    } catch (e) {
      const errorMessage = intl.get('post.unableToBurn');
      dispatch(
        showToast('error', {
          message: errorMessage,
          duration: 3
        })
      );
    }
  };

  const onTopHashtagClick = e => {
    const hashtag = e.currentTarget.innerText;
    if (router.query.hashtags) {
      //Check dup before adding to query
      const queryHashtags = (router.query.hashtags as string).split(' ');
      const hashtagExistedIndex = queryHashtags.findIndex(h => h.toLowerCase() === hashtag.toLowerCase());

      if (hashtagExistedIndex === -1) {
        router.replace({
          query: {
            ...router.query,
            hashtags: router.query.hashtags + ' ' + hashtag
          }
        });
      }
    } else {
      router.replace({
        query: {
          ...router.query,
          q: '',
          hashtags: hashtag
        }
      });
    }

    dispatch(addRecentHashtagAtToken({ id: token.id, hashtag: hashtag.substring(1) }));
  };

  const handleFollowToken = async () => {
    const createFollowTokenInput: CreateFollowTokenInput = {
      accountId: selectedAccountId,
      tokenId: token.tokenId
    };

    await createFollowTokenTrigger({ input: createFollowTokenInput });
  };

  const handleUnfollowToken = async () => {
    const deleteFollowTokenInput: DeleteFollowTokenInput = {
      accountId: selectedAccountId,
      tokenId: token.tokenId
    };

    await deleteFollowTokenTrigger({ input: deleteFollowTokenInput });
  };

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
                <PostListItem
                  index={index}
                  item={item}
                  key={item.id}
                  handleBurnForPost={handleBurnForPost}
                  addToRecentHashtags={hashtag =>
                    dispatch(addRecentHashtagAtToken({ id: token.id, hashtag: hashtag.substring(1) }))
                  }
                  postListType={PostListType.Token}
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
                  handleBurnForPost={handleBurnForPost}
                  addToRecentHashtags={hashtag =>
                    dispatch(addRecentHashtagAtToken({ id: token.id, hashtag: hashtag.substring(1) }))
                  }
                  postListType={PostListType.Token}
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
              <div className="token-name-follow">
                <h4 className="title-ticker">{tokenDetailData['ticker']}</h4>
              </div>
              <InfoSubCard typeName={intl.get('token.ticker')} content={tokenDetailData.ticker} />
              <InfoSubCard typeName={intl.get('token.name')} content={tokenDetailData.name} />
              <InfoSubCard typeName={intl.get('general.dana')} content={tokenDetailData.danaBurnUp} />
            </div>
            <div className="info-ticker__right">
              <CopyToClipboard text={tokenDetailData.tokenId}>
                <InfoSubCard
                  typeName={intl.get('token.id')}
                  content={tokenDetailData.tokenId.slice(0, 7) + '...' + tokenDetailData.tokenId.slice(-7)}
                  icon={CopyOutlined}
                  onClickIcon={() => {
                    handleOnCopy(tokenDetailData.tokenId);
                  }}
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
        {/* TODO: Temp remove func not working */}
        {/* <div className="score-ticker">
          <LikeOutlined style={{ marginRight: '10px', fontSize: '1.2rem' }} />
          <IconBurn
            imgUrl="/images/ico-burn-up.svg"
            burnValue={formatBalance(tokenDetailData?.danaBurnUp ?? 0)}
            key={`list-vertical-upvote-o-${tokenDetailData.id}`}
            dataItem={tokenDetailData}
            onClickIcon={() => {}}
          />
        </div> */}
        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
          <Button
            style={{ background: 'transparent !important', fontWeight: '700' }}
            onClick={checkIsFollowed ? handleUnfollowToken : handleFollowToken}
          >
            {checkIsFollowed ? intl.get('general.unfollow') : intl.get('general.follow')}
          </Button>
        </div>
      </BannerTicker>

      <SearchBar>
        <SearchBox />
      </SearchBar>
      <CreatePostCard hashtags={hashtags} tokenPrimaryId={tokenDetailData.id} query={query} />
      {hashtagData.length > 0 && (
        <TagContainer>
          {hashtagData &&
            hashtagData.map(tag => (
              <StyledTag key={tag.id} color="green" onClick={onTopHashtagClick}>
                {`#${tag.normalizedContent}`}
              </StyledTag>
            ))}
        </TagContainer>
      )}
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
