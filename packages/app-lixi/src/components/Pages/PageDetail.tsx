import {
  CameraOutlined,
  CompassOutlined,
  EditOutlined,
  FireTwoTone,
  HomeOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import CreatePostCard from '@components/Common/CreatePostCard';
import SearchBox from '@components/Common/SearchBox';
import PostListItem from '@components/Posts/PostListItem';
import { getSelectedAccount, getSelectedAccountId } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { openModal } from '@store/modal/actions';
import { useInfinitePostsByPageIdQuery } from '@store/post/useInfinitePostsByPageIdQuery';
import intl from 'react-intl-universal';
import { Button, Space, Tabs, Skeleton, notification } from 'antd';
import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { OrderDirection, PostOrderField } from '@generated/types.generated';
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroll-component';
import { BurnForType, BurnType, BurnQueueCommand } from '@bcpros/lixi-models/lib/burn';
import { fromSmallestDenomination, fromXpiToSatoshis } from '@utils/cashMethods';
import { PostsQueryTag } from '@bcpros/lixi-models/constants';
import { currency } from '@components/Common/Ticker';
import { addBurnQueue, addBurnTransaction, getBurnQueue, getFailQueue, clearFailQueue } from '@store/burn';
import { getAllWalletPaths, getSlpBalancesAndUtxos, getWalletStatus } from '@store/wallet';
import BigNumber from 'bignumber.js';
import { showToast } from '@store/toast/actions';
import { setTransactionReady } from '@store/account/actions';
import { getFilterPostsPage } from '@store/settings/selectors';
import { FilterBurnt } from '@components/Common/FilterBurn';
import { FilterType } from '@bcpros/lixi-models/lib/filter';
import useDidMountEffectNotification from '@local-hooks/useDidMountEffectNotification';
import { CreateFollowPageInput, DeleteFollowPageInput } from '@generated/types.generated';
import { useCreateFollowPageMutation, useDeleteFollowPageMutation } from '@store/follow/follows.api';

type PageDetailProps = {
  page: any;
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
      @media (max-width: 1001px) {
        max-width: 160px;
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
  width: 100%;
  .search-bar {
    display: flex;
    gap: 1rem;
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
  const selectedAccount = useAppSelector(getSelectedAccount);
  const baseUrl = process.env.NEXT_PUBLIC_LIXI_URL;
  const router = useRouter();
  const selectedAccountId = useAppSelector(getSelectedAccountId);
  const [pageDetailData, setPageDetailData] = useState<any>(page);
  const [isFollowed, setIsFollowed] = useState<boolean>(checkIsFollowed);
  const [listsFriend, setListsFriend] = useState<any>([]);
  const [listsPicture, setListsPicture] = useState<any>([]);
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const burnQueue = useAppSelector(getBurnQueue);
  const walletStatus = useAppSelector(getWalletStatus);
  const failQueue = useAppSelector(getFailQueue);
  const filterValue = useAppSelector(getFilterPostsPage);
  const slpBalancesAndUtxosRef = useRef(slpBalancesAndUtxos);

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
      orderBy: {
        direction: OrderDirection.Desc,
        field: PostOrderField.UpdatedAt
      },
      id: page.id
    },
    false
  );

  useEffect(() => {
    // fetchListFriend();
  }, []);

  useEffect(() => {
    // fetchListPicture();
  }, []);

  const fetchListFriend = () => {
    return axios
      .get('https://picsum.photos/v2/list?page=1&limit=10', {
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      })
      .then(response => {
        setListsFriend(response.data);
      });
  };

  const fetchListPicture = () => {
    return axios
      .get('https://picsum.photos/v2/list?page=2&limit=20', {
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      })
      .then(response => {
        setListsPicture(response.data);
      });
  };

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
          address: post.postAccount.address,
          amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(0.04)).valueOf().toString()
        }
      ];

      if (burnType === BurnType.Up && selectedAccount.address !== post.postAccount.address) {
        tipToAddresses.push({
          address: post.postAccount.address,
          amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(0.04)).valueOf().toString()
        });
      }

      tipToAddresses = tipToAddresses.filter(item => item.address != selectedAccount.address);

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

  return (
    <>
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
              <p>{pageDetailData.title}</p>
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
                  <SearchBox />
                  <FilterBurnt filterForType={FilterType.PostsPage} />
                </div>
                <CreatePostCard pageId={page.id} />
                <Timeline>
                  {data.length == 0 && (
                    <div className="blank-timeline">
                      <img className="time-line-blank" src="/images/time-line-blank.svg" alt="" />
                      <p>Become a first person post on the page...</p>
                    </div>
                  )}

                  <React.Fragment>
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
                          <PostListItem index={index} item={item} key={item.id} handleBurnForPost={handleBurnForPost} />
                        );
                      })}
                    </InfiniteScroll>
                  </React.Fragment>
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
    </>
  );
};

export default PageDetail;
