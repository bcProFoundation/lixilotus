import { CameraOutlined, CompassOutlined, EditOutlined, HomeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { PostsQueryTag } from '@bcpros/lixi-models/constants';
import { BurnForType, BurnQueueCommand, BurnType } from '@bcpros/lixi-models/lib/burn';
import { FilterType } from '@bcpros/lixi-models/lib/filter';
import CreatePostCard from '@components/Common/CreatePostCard';
import SearchBox, { SearchType } from '@components/Common/SearchBox';
import { FilterBurnt } from '@components/Common/FilterBurn';
import { currency } from '@components/Common/Ticker';
import PostListItem from '@components/Posts/PostListItem';
import {
  CreateFollowPageInput,
  DeleteFollowPageInput,
  HashtagOrderField,
  OrderDirection,
  PostOrderField,
  RepostInput
} from '@generated/types.generated';
import useDidMountEffectNotification from '@local-hooks/useDidMountEffectNotification';
import {
  addRecentHashtagAtPages,
  clearRecentHashtagAtPages,
  removeRecentHashtagAtPages,
  setTransactionReady
} from '@store/account/actions';
import { getRecentHashtagAtPages, getSelectedAccount, getSelectedAccountId } from '@store/account/selectors';
import { addBurnQueue, addBurnTransaction, clearFailQueue, getFailQueue } from '@store/burn';
import { useCreateFollowPageMutation, useDeleteFollowPageMutation } from '@store/follow/follows.api';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { openModal } from '@store/modal/actions';
import { useInfinitePostsByPageIdQuery } from '@store/post/useInfinitePostsByPageIdQuery';
import { getFilterPostsPage } from '@store/settings/selectors';
import { showToast } from '@store/toast/actions';
import { getAllWalletPaths, getSlpBalancesAndUtxos, getWalletStatus } from '@store/wallet';
import { fromSmallestDenomination, fromXpiToSatoshis } from '@utils/cashMethods';
import { Button, Skeleton, Space, Tabs } from 'antd';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useInfinitePostsBySearchQueryWithHashtagAtPage } from '@store/post/useInfinitePostsBySearchQueryWithHashtagAtPage';
import { useInfiniteHashtagByPageQuery } from '@store/hashtag/useInfiniteHashtagByPageQuery';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import { PageQuery } from '@store/page/pages.generated';
import { useRepostMutation } from '@store/post/posts.api';
import _ from 'lodash';

export type PageItem = PageQuery['page'];

type PageDetailProps = {
  page: PageItem;
  isMobile: boolean;
  checkIsFollowed: boolean;
};

const StyledContainerProfileDetail = styled.div`
  margin: 1rem auto;
  width: 100%;
  max-width: 816px;
  background: var(--bg-color-light-theme);
  border-radius: 20px;
  padding-bottom: 3rem;
  .reaction-container {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    border: 1px solid #c5c5c5;
    border-left: 0;
    border-right: 0;
  }

  .comment-item-meta {
    margin-bottom: 0.5rem;
    .ant-list-item-meta-avatar {
      margin-top: 3%;
    }
    .ant-list-item-meta-title {
      margin-bottom: 0.5rem;
    }
  }

  .input-comment {
    padding: 1rem 0 0 0;
  }
`;

const ProfileCardHeader = styled.div`
  border: 1px solid var(--boder-item-light);
  border-bottom: 0;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  .cover-img {
    width: 100%;
    height: 350px;
    border-top-right-radius: 20px;
    border-top-left-radius: 20px;
    object-fit: cover;
    @media (max-width: 768px) {
      border-radius: 0;
      height: 200px;
    }
  }
  .info-profile {
    display: flex;
    position: relative;
    justify-content: space-between;
    align-items: end;
    padding: 1rem 2rem 1rem 0;
    background: #fff;
    .wrapper-avatar {
      left: 2rem;
      top: -90px;
      position: absolute;
      padding: 5px;
      background: #fff;
      border-radius: 50%;
      .avatar-img {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        object-fit: cover;
      }
      @media (max-width: 768px) {
        left: auto;
      }
      .btn-upload-avatar {
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 35px;
        height: 35px;
        position: absolute;
        border-radius: 50%;
        bottom: 5%;
        right: 5%;
        background: linear-gradient(0deg, rgba(158, 42, 156, 0.08), rgba(158, 42, 156, 0.08)), #fffbff;
        .anticon {
          font-size: 20px;
          color: var(--color-primary);
        }
      }
    }
    .title-profile {
      margin-left: calc(160px + 48px);
      text-align: left;
      @media (max-width: 768px) {
        margin-left: 0;
        margin-top: 4rem;
        text-align: center;
      }
      h2 {
        font-weight: 600;
        margin-bottom: 0;
      }
    }
    .action-profile {
      display: flex;
      @media (max-width: 1001px) {
        text-align: center;
        button {
          margin-bottom: 4px;
        }
      }
    }
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: center;
      padding-right: 0;
    }
  }
`;

const ProfileContentContainer = styled.div`
  display: flex;
  gap: 1rem;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const LegacyProfile = styled.div`
  max-width: 35%;
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const AboutBox = styled.div`
  background: #ffffff;
  border-radius: 24px;
  margin-bottom: 1rem;
  padding: 24px;
  border: 1px solid var(--boder-item-light);
  h3 {
    text-align: left;
  }
  .about-content {
    padding: 1rem 0;
    text-align: left;
    display: flex;
    flex-direction: column;
  }
  @media (max-width: 426px) {
    margin: 0 4px 1rem 4px;
  }
`;

const PictureBox = styled.div`
  background: #ffffff;
  border-radius: 24px;
  margin-bottom: 1rem;
  padding: 24px;
  border: 1px solid var(--boder-item-light);
  h3 {
    text-align: left;
  }
  .picture-content {
    padding: 1rem 0;
    display: grid;
    grid-template-columns: auto auto auto;
    grid-gap: 10px;
    img {
      width: 110px;
      height: 110px;
      @media (max-width: 768px) {
        width: 95%;
      }
    }
  }
  .blank-picture {
    img {
      width: 100%;
    }
  }
  @media (max-width: 426px) {
    margin: 0 4px 1rem 4px;
  }
`;

const FriendBox = styled.div`
  background: #ffffff;
  border-radius: 24px;
  margin-bottom: 1rem;
  padding: 24px;
  border: 1px solid var(--boder-item-light);
  h3 {
    text-align: left;
  }
  .friend-content {
    display: grid;
    grid-template-columns: auto auto auto;
    grid-column-gaps: 10px;
    grid-row-gap: 1rem;
    padding: 1rem 0;
    .friend-item {
      img {
        width: 110px;
        height: 110px;
        border-radius: 50%;
        @media (max-width: 768px) {
          width: 95%;
        }
      }
      p {
        margin: 0;
        color: #4e444b;
        letter-spacing: 0.4px;
        font-size: 12px;
        line-height: 24px;
        width: 110px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    }
  }
  .blank-friend {
    img {
      width: 100%;
    }
    button {
      width: 100%;
      white-space: break-spaces;
    }
  }
  @media (max-width: 426px) {
    margin: 0 4px 1rem 4px;
  }
`;

const ContentTimeline = styled.div`
  .search-bar {
    display: grid;
    grid-template-columns: 75% 25%;

    @media (max-width: 650px) {
      display: flex;
      flex-direction: column-reverse;
    }
  }
`;

const Timeline = styled.div`
  border-radius: 24px;
  width: 100%;
  margin-right: 1rem;
  margin-bottom: 1rem;
  .blank-timeline {
    background: #ffffff;
    border: 1px solid rgba(128, 116, 124, 0.12);
    border-radius: 24px;
    padding: 1rem 0;
    img {
      max-width: 650px;
      max-height: 650px;
      @media (max-width: 426px) {
        max-width: 100%;
      }
    }
    p {
      color: rgba(30, 26, 29, 0.6);
    }
  }
`;

const StyledSpace = styled(Space)`
  margin-bottom: 1rem;
  .ant-space-item {
    height: fit-content;
    .anticon {
      font-size: 18px;
      color: rgba(30, 26, 29, 0.38);
    }
  }
`;

const StyledMenu = styled(Tabs)`
  width: 100%;
  .ant-tabs-nav {
    border-bottom-right-radius: 20px;
    border-bottom-left-radius: 20px;
    padding: 1rem 24px;
    border: 1px solid var(--boder-item-light);
    background: white;
    &:before {
      content: none;
    }
  }
`;

const SubAbout = ({
  icon,
  text,
  dataItem,
  imgUrl,
  onClickIcon
}: {
  icon?: React.FC;
  text?: string;
  dataItem?: any;
  imgUrl?: string;
  onClickIcon: () => void;
}) => (
  <StyledSpace onClick={onClickIcon}>
    {icon && React.createElement(icon)}
    {imgUrl && React.createElement('img', { src: imgUrl }, null)}
    {text}
  </StyledSpace>
);

const PageDetail = ({ page, checkIsFollowed, isMobile }: PageDetailProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const selectedAccountId = useAppSelector(getSelectedAccountId);
  const [pageDetailData, setPageDetailData] = useState<any>(page);
  const [isFollowed, setIsFollowed] = useState<boolean>(checkIsFollowed);
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const walletStatus = useAppSelector(getWalletStatus);
  const failQueue = useAppSelector(getFailQueue);
  const filterValue = useAppSelector(getFilterPostsPage);
  const slpBalancesAndUtxosRef = useRef(slpBalancesAndUtxos);
  const recentTagAtPages = useAppSelector(getRecentHashtagAtPages);
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [hashtags, setHashtags] = useState([]);
  const [suggestedHashtag, setSuggestedTags] = useState([]);

  useEffect(() => {
    if (router.query.hashtag) {
      addHashtag(`#${router.query.hashtag}`);
    }
  }, []);

  const [
    createFollowPageTrigger,
    {
      isLoading: isLoadingCreateFollowPage,
      isSuccess: isSuccessCreateFollowPage,
      isError: isErrorCreateFollowPage,
      error: errorOnCreate
    }
  ] = useCreateFollowPageMutation();

  const [
    deleteFollowPageTrigger,
    {
      isLoading: isLoadingDeleteFollowPage,
      isSuccess: isSuccessDeleteFollowPage,
      isError: isErrorDeleteFollowPage,
      error: errorOnDelete
    }
  ] = useDeleteFollowPageMutation();

  useEffect(() => {
    if (isSuccessCreateFollowPage) setIsFollowed(true);
  }, [isSuccessCreateFollowPage]);

  useEffect(() => {
    if (isSuccessDeleteFollowPage) setIsFollowed(false);
  }, [isSuccessDeleteFollowPage]);

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext, refetch } = useInfinitePostsByPageIdQuery(
    {
      first: 10,
      minBurnFilter: filterValue ?? 1,
      accountId: selectedAccountId ?? undefined,
      orderBy: [
        {
          direction: OrderDirection.Desc,
          field: PostOrderField.UpdatedRepostAt
        },
        {
          direction: OrderDirection.Desc,
          field: PostOrderField.UpdatedAt
        }
      ],
      id: page.id
    },
    false
  );

  const { data: hashtagData } = useInfiniteHashtagByPageQuery(
    {
      first: 3,
      orderBy: {
        direction: OrderDirection.Desc,
        field: HashtagOrderField.LotusBurnScore
      },
      id: page.id
    },
    false
  );

  useEffect(() => {
    const pageId = page.id;
    const topHashtags = _.map(hashtagData, 'content');
    const pageRecentHashtag = recentTagAtPages.find((page: any) => page.id === pageId);
    const recentHashtags: string[] = pageRecentHashtag?.hashtags || [];

    const combinedHashtags = [...topHashtags, ...recentHashtags.filter(tag => !topHashtags.includes(tag))];

    setSuggestedTags(combinedHashtags);
  }, [recentTagAtPages, hashtagData]);

  const loadMoreItems = () => {
    if (hasNext && !isFetching) {
      fetchNext();
    } else if (hasNext) {
      fetchNext();
    }
  };

  const navigateEditPage = () => {
    dispatch(openModal('EditPageModal', { page: pageDetailData }));
  };

  const uploadModal = (isAvatar: boolean) => {
    dispatch(openModal('UploadAvatarCoverModal', { page: pageDetailData, isAvatar: isAvatar }));
  };

  useEffect(() => {
    if (slpBalancesAndUtxos === slpBalancesAndUtxosRef.current) return;
    dispatch(setTransactionReady());
  }, [slpBalancesAndUtxos.nonSlpUtxos]);

  useDidMountEffectNotification();

  const handleBurnForPost = async (isUpVote: boolean, post: any) => {
    try {
      const burnValue = '1';
      if (failQueue.length > 0) dispatch(clearFailQueue());
      const fundingFirstUtxo = slpBalancesAndUtxos.nonSlpUtxos[0];
      const currentWalletPath = walletPaths.filter(acc => acc.xAddress === fundingFirstUtxo.address).pop();
      const { hash160, xAddress } = currentWalletPath;
      const burnType = isUpVote ? BurnType.Up : BurnType.Down;
      const burnedBy = hash160;
      const burnForId = post.id;
      let tipToAddresses: { address: string; amount: string }[] = [
        {
          address: page.pageAccount.address,
          amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(0.04)).valueOf().toString()
        }
      ];

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
        postQueryTag: PostsQueryTag.PostsByPageId,
        pageId: post.page?.id,
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

  const handleFollowPage = async () => {
    const createFollowPageInput: CreateFollowPageInput = {
      accountId: selectedAccountId,
      pageId: pageDetailData.id
    };

    await createFollowPageTrigger({ input: createFollowPageInput });
  };

  const handleUnfollowPage = async () => {
    const deleteFollowPageInput: DeleteFollowPageInput = {
      accountId: selectedAccountId,
      pageId: pageDetailData.id
    };

    await deleteFollowPageTrigger({ input: deleteFollowPageInput });
  };

  const searchPost = (value: string, hashtagsValue?: string[]) => {
    setSearchValue(value);

    if (hashtagsValue && hashtagsValue.length > 0) setHashtags([...hashtagsValue]);

    hashtagsValue.map(hashtag => {
      dispatch(addRecentHashtagAtPages({ id: page.id, hashtag: hashtag.substring(1) }));
    });
  };

  const onDeleteQuery = () => {
    setSearchValue(null);
    setHashtags([]);
  };

  const onDeleteHashtag = (hashtagsValue: string[]) => {
    setHashtags([...hashtagsValue]);
  };

  //#region QueryVirtuoso
  const { queryData, fetchNextQuery, hasNextQuery, isQueryFetching, isFetchingQueryNext, isQueryLoading, noMoreQuery } =
    useInfinitePostsBySearchQueryWithHashtagAtPage(
      {
        first: 20,
        minBurnFilter: filterValue ?? 1,
        query: searchValue,
        hashtags: hashtags,
        pageId: page.id,
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
  const addHashtag = hashtag => {
    if (!hashtags.includes(hashtag)) {
      setHashtags(prevHashtag => {
        return [...prevHashtag, hashtag];
      });
    }
  };

  const [repostTrigger, { isLoading: isLoadingRepost, isSuccess: isSuccessRepost, isError: isErrorRepost }] =
    useRepostMutation();

  const handleRepost = async (post: any) => {
    const repostInput: RepostInput = {
      accountId: selectedAccountId,
      postId: post.id
    };

    try {
      await repostTrigger({ input: repostInput });
      isSuccessRepost &&
        dispatch(
          showToast('success', {
            message: 'Success',
            description: intl.get('post.repostSuccessful'),
            duration: 5
          })
        );
    } catch (error) {
      dispatch(
        showToast('error', {
          message: 'Error',
          description: intl.get('post.repostFailure'),
          duration: 5
        })
      );
    }
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
                <PostListItem
                  index={index}
                  item={item}
                  key={item.id}
                  handleBurnForPost={handleBurnForPost}
                  repost={handleRepost}
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
                  repost={handleRepost}
                  addHashtag={addHashtag}
                />
              );
            })}
          </InfiniteScroll>
        )}
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <StyledContainerProfileDetail>
        <ProfileCardHeader>
          <div className="container-img">
            <img className="cover-img" src={pageDetailData.cover || '/images/default-cover.jpg'} alt="" />
          </div>
          <div className="info-profile">
            <div className="wrapper-avatar">
              <picture>
                <img className="avatar-img" src={pageDetailData.avatar || '/images/default-avatar.jpg'} alt="" />
              </picture>
              {/* TODO: implement in the future */}
              {selectedAccountId == pageDetailData?.pageAccountId && (
                <div className="btn-upload-avatar" onClick={() => uploadModal(true)}>
                  <CameraOutlined />
                </div>
              )}
            </div>
            <div className="title-profile">
              <h2>{pageDetailData.name}</h2>
              <p>{intl.get('category.' + pageDetailData.category.name)}</p>
            </div>
            {/* TODO: implement in the future */}
            {selectedAccountId == pageDetailData?.pageAccountId && (
              <div className="action-profile">
                <Button
                  style={{ marginRight: '1rem' }}
                  type="primary"
                  className="outline-btn"
                  onClick={navigateEditPage}
                >
                  <EditOutlined />
                  {intl.get('page.editPage')}
                </Button>
                <Button type="primary" className="outline-btn" onClick={() => uploadModal(false)}>
                  <CameraOutlined />
                  {intl.get('page.editCoverPhoto')}
                </Button>
              </div>
            )}
            {/* Follow */}
            {selectedAccountId != pageDetailData?.pageAccountId && (
              <div>
                <Button onClick={isFollowed ? handleUnfollowPage : handleFollowPage}>
                  {isFollowed ? intl.get('general.unfollow') : intl.get('general.follow')}
                </Button>
              </div>
            )}
          </div>
        </ProfileCardHeader>
        <ProfileContentContainer>
          <StyledMenu defaultActiveKey="post">
            <Tabs.TabPane tab="Post" key="post">
              {/* TODO: implement in the future */}
              {/* <LegacyProfile>
                <AboutBox>
                  <h3>About</h3>
                  {pageDetailData && !pageDetailData.description && (
                    <div className="blank-about">
                      <img src="/images/about-blank.svg" alt="" />
                      <p>Let people know more about you (description, hobbies, address...</p>
                      <Button type="primary" className="outline-btn">
                        Update info
                      </Button>
                    </div>
                  )}
                  <div className="about-content">
                    <SubAbout
                      dataItem={pageDetailData?.description}
                      onClickIcon={() => {}}
                      icon={InfoCircleOutlined}
                      text={pageDetailData?.description}
                    />
                    <SubAbout
                      dataItem={pageDetailData?.address}
                      onClickIcon={() => {}}
                      icon={CompassOutlined}
                      text={pageDetailData?.address}
                    />
                    <SubAbout
                      dataItem={pageDetailData?.website}
                      onClickIcon={() => {}}
                      icon={HomeOutlined}
                      text={pageDetailData?.website}
                    />
                    {selectedAccountId == pageDetailData?.pageAccountId && (
                      <Button type="primary" className="outline-btn" onClick={navigateEditPage}>
                        Edit your profile
                      </Button>
                    )}
                  </div>
                </AboutBox>
                <PictureBox>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3>Pictures</h3>
                    {listsPicture && listsPicture.length > 0 && (
                      <Button type="primary" className="no-border-btn" style={{ padding: '0' }}>
                        See all
                      </Button>
                    )}
                  </div>
                  {listsPicture && listsPicture.length == 0 && (
                    <div className="blank-picture">
                      <img src="/images/photo-blank.svg" alt="" />
                      <p>Photos uploaded in posts, or posts that have tag of your name</p>
                      <Button type="primary" className="outline-btn">
                        Update picture
                      </Button>
                    </div>
                  )}
                  {listsPicture && listsPicture.length > 0 && (
                    <div className="picture-content">
                      {listsPicture.map((item: any, index: number) => {
                        if (index < 9) return <img key={item.id} src={item.download_url} alt={item.author} />;
                      })}
                    </div>
                  )}
                </PictureBox>
                <FriendBox>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h3>Friends</h3>
                      <p
                        style={{
                          margin: '0',
                          fontSize: '13px',
                          letterSpacing: '0.5px',
                          color: 'rgba(30, 26, 29, 0.6)'
                        }}
                      >
                        {listsFriend.length > 0 ? listsFriend.length + ' friends' : ''}
                      </p>
                    </div>
                    {listsFriend && listsFriend.length > 0 && (
                      <Button type="primary" className="no-border-btn" style={{ padding: '0' }}>
                        See all
                      </Button>
                    )}
                  </div>
                  {listsFriend && listsFriend.length == 0 && (
                    <div className="blank-friend">
                      <img src="/images/friend-blank.svg" alt="" />
                      <p>Connect with people you know in LixiLotus.</p>
                      <Button type="primary" className="outline-btn">
                        Discover LixiLotus social network
                      </Button>
                    </div>
                  )}
                  {listsFriend && listsFriend.length > 0 && (
                    <div className="friend-content">
                      {listsFriend.map((item: any, index: number) => {
                        if (index < 9)
                          return (
                            <div key={item.id} className="friend-item">
                              <img src={item.download_url} alt="" />
                              <p>{item.author}</p>
                            </div>
                          );
                      })}
                    </div>
                  )}
                </FriendBox>
              </LegacyProfile> */}
              <ContentTimeline>
                <div className="search-bar">
                  <SearchBox
                    searchPost={searchPost}
                    searchValue={searchValue}
                    hashtags={hashtags}
                    onDeleteHashtag={onDeleteHashtag}
                    onDeleteQuery={onDeleteQuery}
                    suggestedHashtag={suggestedHashtag}
                  />
                  <FilterBurnt filterForType={FilterType.PostsPage} />
                </div>
                <CreatePostCard page={page} hashtags={hashtags} query={searchValue} />
                <Timeline>
                  {data.length == 0 && (
                    <div className="blank-timeline">
                      <img className="time-line-blank" src="/images/time-line-blank.svg" alt="" />
                      <p>Become a first person post on the page...</p>
                    </div>
                  )}
                  {showPosts()}
                </Timeline>
              </ContentTimeline>
            </Tabs.TabPane>
            <Tabs.TabPane tab="About" key="about">
              <LegacyProfile>
                <AboutBox>
                  <h3>About</h3>
                  {pageDetailData && !pageDetailData.description && (
                    <div className="blank-about">
                      <img src="/images/about-blank.svg" alt="" />
                      <p>Let people know more about you description, hobbies, address...</p>
                      <Button type="primary" className="outline-btn">
                        Update info
                      </Button>
                    </div>
                  )}
                  <div className="about-content">
                    <SubAbout
                      dataItem={pageDetailData?.description}
                      onClickIcon={() => {}}
                      icon={InfoCircleOutlined}
                      text={pageDetailData?.description}
                    />
                    <SubAbout
                      dataItem={pageDetailData?.address}
                      onClickIcon={() => {}}
                      icon={CompassOutlined}
                      text={pageDetailData?.address}
                    />
                    <SubAbout
                      dataItem={pageDetailData?.website}
                      onClickIcon={() => {}}
                      icon={HomeOutlined}
                      text={pageDetailData?.website}
                    />
                    {/* {selectedAccountId == pageDetailData?.pageAccountId && (
                      <Button type="primary" className="outline-btn" onClick={navigateEditPage}>
                        Edit your profile
                      </Button>
                    )} */}
                  </div>
                </AboutBox>
              </LegacyProfile>
            </Tabs.TabPane>
            {/* TODO: implement in the future */}
            {/* <Tabs.TabPane tab="Friend" key="friend"></Tabs.TabPane>
            <Tabs.TabPane tab="Picture" key="picture"></Tabs.TabPane> */}
          </StyledMenu>
        </ProfileContentContainer>
      </StyledContainerProfileDetail>
    </React.Fragment>
  );
};

export default PageDetail;
