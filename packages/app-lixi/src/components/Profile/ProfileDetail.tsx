import { PostsQueryTag } from '@bcpros/lixi-models/constants';
import { BurnForType, BurnQueueCommand, BurnType } from '@bcpros/lixi-models/lib/burn';
import { FilterType } from '@bcpros/lixi-models/lib/filter';
import { Follow } from '@bcpros/lixi-models/lib/follow/follow.model';
import { FilterBurnt } from '@components/Common/FilterBurn';
import PostListItem from '@components/Posts/PostListItem';
import {
  CreateFollowAccountInput,
  DeleteFollowAccountInput,
  OrderDirection,
  PostOrderField
} from '@generated/types.generated';
import useDidMountEffectNotification from '@local-hooks/useDidMountEffectNotification';
import { renameAccount, setTransactionReady } from '@store/account/actions';
import { getAccountInfoTemp, getSelectedAccount, getSelectedAccountId } from '@store/account/selectors';
import { addBurnQueue, addBurnTransaction, clearFailQueue, getFailQueue } from '@store/burn';
import { useCreateFollowAccountMutation, useDeleteFollowAccountMutation } from '@store/follow/follows.api';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { openModal } from '@store/modal/actions';
import { useInfinitePostsByUserIdQuery } from '@store/post/useInfinitePostsByUserIdQuery';
import { getFilterPostsProfile } from '@store/settings/selectors';
import { showToast } from '@store/toast/actions';
import { getAllWalletPaths, getSlpBalancesAndUtxos, getWalletStatus } from '@store/wallet';
import { fromSmallestDenomination, fromXpiToSatoshis } from '@utils/cashMethods';
import { Button, Skeleton, Space, Tabs } from 'antd';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { useRouter } from 'next/router';
import { currency } from '@components/Common/Ticker';
import React, { useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import { WithAuthorizeAction } from '../Common/Authorization/WithAuthorizeAction';
import { CameraOutlined, EditOutlined } from '@ant-design/icons';
import { ReactSVG } from 'react-svg';
import { Account, RenameAccountCommand } from '@bcpros/lixi-models';
import { RenameAccountModalProps } from '@components/Settings/RenameAccountModal';

const URL_AVATAR_DEFAULT = '/images/default-avatar.jpg';
const URL_COVER_DEFAULT = '/images/default-avatar.jpg';

const AuthorizedButton = WithAuthorizeAction(Button);

type UserDetailProps = {
  user: any;
  isMobile: boolean;
  checkIsFollowed: boolean;
};

const StyledContainerProfileDetail = styled.div`
  margin: 1rem auto;
  width: 100%;
  max-width: 816px;
  background: var(--bg-color-light-theme);
  border-radius: var(--border-radius-primary);
  padding-bottom: 3rem;
  .reaction-container {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    border: 1px solid var(--border-color);
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
  .container-img {
    position: relative;
    .cover-img {
      object-fit: cover;
      width: 100%;
      height: 200px;
      border-top-right-radius: var(--border-radius-item);
      border-top-left-radius: var(--border-radius-item);
      @media (max-width: 768px) {
        border-radius: 0;
        height: 200px;
      }
    }
    button {
      display: block;
      position: absolute;
      bottom: 0.5rem;
      right: 0.5rem;
    }
    @media (max-width: 960px) {
      button {
        display: none;
      }
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
        object-fit: cover;
        border-radius: 50%;
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
      width: 100%;
      margin-left: calc(160px + 48px);
      text-align: left;
      display: flex;
      justify-content: space-between;
      @media (max-width: 768px) {
        margin-left: 0;
        margin-top: 4rem;
        text-align: center;
        justify-content: center;
      }
      h2 {
        font-weight: 600;
        margin-bottom: 0;
        text-transform: capitalize;
      }
    }
    .action-profile {
      display: flex;
      align-self: center;
      gap: 8px;
      .btn-edit-cover {
        display: none;
      }
      @media (max-width: 960px) {
        text-align: center;
        button {
          margin-bottom: 4px;
        }
        .btn-edit-cover {
          display: block;
        }
      }
      button {
        .anticon-custom {
          svg {
            filter: var(--filter-color-primary);
            width: 16px;
            height: 16px;
          }
        }
      }
    }
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: center;
      padding-right: 0;
    }
  }
  .description-profile {
    width: 100%;
    background: #fff;
    padding-left: calc(0px + 48px);
    padding-bottom: 15px;
    text-align: left;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 8px;
    button {
      height: fit-content;
      @media (min-width: 768px) {
        display: inline-flex;
        gap: 4px;
      }
    }
    @media (max-width: 768px) {
      margin-left: 0;
      text-align: center;
      padding-left: 0;
      justify-content: center;
    }
    h2 {
      font-weight: 600;
      margin-bottom: 0;
      text-transform: capitalize;
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
  border-radius: var(--border-radius-primary);
  margin-bottom: 1rem;
  border: 1px solid var(--border-item-light);
  padding: 24px;
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
  border-radius: var(--border-radius-primary);
  margin-bottom: 1rem;
  border: 1px solid var(--border-item-light);
  padding: 24px;
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
  border-radius: var(--border-radius-primary);
  margin-bottom: 1rem;
  padding: 24px;
  border: 1px solid var(--border-item-light);
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
  border-radius: var(--border-radius-primary);
  width: 100%;
  margin-right: 1rem;
  margin-bottom: 1rem;
  margin-top: 1rem;
  .blank-timeline {
    background: #ffffff;
    border: 1px solid rgba(128, 116, 124, 0.12);
    border-radius: var(--border-radius-primary);
    padding: 1rem 0;
    margin-top: 1rem;
    img {
      max-height: 45vh;
      @media (max-width: 426px) {
        max-width: 100%;
        max-height: 45vh;
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
  .ant-tabs-nav {
    border-bottom-right-radius: 20px;
    border-bottom-left-radius: 20px;
    padding: 1rem 24px;
    border: 1px solid var(--border-item-light);
    background: white;
  }
  .ant-tabs-tabpane {
    gap: 1rem;
    display: flex;
    flex-direction: row;
    @media (max-width: 768px) {
      flex-direction: column;
    }
  }
  &.ant-tabs {
    width: 100%;
  }
  .ant-tabs-nav {
    &::before {
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

const ProfileDetail = ({ user, checkIsFollowed, isMobile }: UserDetailProps) => {
  const dispatch = useAppDispatch();
  const walletPaths = useAppSelector(getAllWalletPaths);
  const walletStatus = useAppSelector(getWalletStatus);
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const slpBalancesAndUtxosRef = useRef(slpBalancesAndUtxos);
  const failQueue = useAppSelector(getFailQueue);
  const filterValue = useAppSelector(getFilterPostsProfile);
  const [isFollowed, setIsFollowed] = useState<boolean>(checkIsFollowed);
  const [listsPicture, setListsPicture] = useState<any>([]);
  const selectedAccountId = useAppSelector(getSelectedAccountId);
  const accountInfoTemp = useAppSelector(getAccountInfoTemp);
  const selectedAccount = useAppSelector(getSelectedAccount);

  const [
    createFollowAccountTrigger,
    {
      isLoading: isLoadingCreateFollowAccount,
      isSuccess: isSuccessCreateFollowAccount,
      isError: isErrorCreateFollowAccount,
      error: errorOnCreate
    }
  ] = useCreateFollowAccountMutation();

  const [
    deleteFollowAccountTrigger,
    {
      isLoading: isLoadingDeleteFollowAccount,
      isSuccess: isSuccessDeleteFollowAccount,
      isError: isErrorDeleteFollowAccount,
      error: errorOnDelete
    }
  ] = useDeleteFollowAccountMutation();

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext, refetch, isLoading } =
    useInfinitePostsByUserIdQuery(
      {
        first: 10,
        minBurnFilter: filterValue ?? 1,
        orderBy: {
          direction: OrderDirection.Desc,
          field: PostOrderField.UpdatedAt
        },
        id: user.id.toString()
      },
      false
    );

  useEffect(() => {
    if (slpBalancesAndUtxos === slpBalancesAndUtxosRef.current) return;
    dispatch(setTransactionReady());
  }, [slpBalancesAndUtxos.nonSlpUtxos]);

  useEffect(() => {
    if (isSuccessCreateFollowAccount) setIsFollowed(true);
  }, [isSuccessCreateFollowAccount]);

  useEffect(() => {
    if (isSuccessDeleteFollowAccount) setIsFollowed(false);
  }, [isSuccessDeleteFollowAccount]);

  const loadMoreItems = () => {
    if (hasNext && !isFetching) {
      fetchNext();
    } else if (hasNext) {
      fetchNext();
    }
  };

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
          address: user.address,
          amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(currency.burnFee)).valueOf().toString()
        }
      ];

      tipToAddresses = tipToAddresses.filter(item => item.address != user.address);
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
        extraArguments: {
          postQueryTag: PostsQueryTag.PostsByUserId,
          userId: post.postAccount?.id as string,
          minBurnFilter: filterValue
        }
      };

      dispatch(addBurnQueue(burnCommand));
      dispatch(addBurnTransaction(burnCommand));
    } catch (e) {
      const errorMessage = e.message || intl.get('post.unableToBurn');
      dispatch(
        showToast('error', {
          message: intl.get('toast.error'),
          description: errorMessage,
          duration: 3
        })
      );
    }
  };

  useDidMountEffectNotification();

  const handleFollow = async () => {
    const createFollowAccountInput: CreateFollowAccountInput = {
      followingAccountId: parseInt(user.id),
      followerAccountId: selectedAccountId
    };

    await createFollowAccountTrigger({ input: createFollowAccountInput });
  };

  const handleUnfollow = async () => {
    const deleteFollowAccountInput: DeleteFollowAccountInput = {
      followingAccountId: parseInt(user.id),
      followerAccountId: selectedAccountId
    };

    await deleteFollowAccountTrigger({ input: deleteFollowAccountInput });
  };

  const openFollowModal = (type: Follow) => {
    dispatch(openModal('FollowModal', { accountId: selectedAccountId, type: type }));
  };

  const uploadModal = (isAvatar: boolean) => {
    dispatch(openModal('UploadAvatarCoverModal', { profile: user, isAvatar: isAvatar }));
  };

  const getAvatarAccount = () => {
    let urlAvatarAccount = '';
    if (selectedAccountId == user.id) {
      urlAvatarAccount = accountInfoTemp?.avatar || URL_AVATAR_DEFAULT;
    } else {
      const cfUrl = `${process.env.NEXT_PUBLIC_CF_IMAGES_DELIVERY_URL}/${process.env.NEXT_PUBLIC_CF_ACCOUNT_HASH}/${user?.avatar?.upload?.cfImageId}/public`;
      urlAvatarAccount = cfUrl.includes('undefined') ? URL_AVATAR_DEFAULT : cfUrl;
    }
    return urlAvatarAccount;
  };

  const getCoverAccount = () => {
    let urlCoverAccount = '';
    if (selectedAccountId == user?.id) {
      urlCoverAccount = accountInfoTemp?.cover || URL_COVER_DEFAULT;
    } else {
      const cfUrl = `${process.env.NEXT_PUBLIC_CF_IMAGES_DELIVERY_URL}/${process.env.NEXT_PUBLIC_CF_ACCOUNT_HASH}/${user?.cover?.upload?.cfImageId}/public`;
      urlCoverAccount = cfUrl.includes('undefined') ? URL_COVER_DEFAULT : cfUrl;
    }
    return urlCoverAccount;
  };

  const showPopulatedRenameAccountModal = (account: Account) => {
    const command: RenameAccountCommand = {
      id: account.id,
      mnemonic: account.mnemonic,
      name: account.name
    };
    const renameAcountModalProps: RenameAccountModalProps = {
      account: account,
      onOkAction: renameAccount(command)
    };
    dispatch(openModal('RenameAccountModal', renameAcountModalProps));
  };

  return (
    <>
      <StyledContainerProfileDetail className="profile-detail">
        <ProfileCardHeader>
          <div className="container-img">
            <img className="cover-img" src={getCoverAccount()} alt="" />
            {selectedAccountId == user.id && (
              <Button type="primary" className="no-border-btn" onClick={() => uploadModal(false)}>
                <CameraOutlined />
                {intl.get('page.editCoverPhoto')}
              </Button>
            )}
          </div>
          <div className="info-profile">
            <div className="wrapper-avatar">
              <picture>
                <img className="avatar-img" src={getAvatarAccount()} alt="" />
              </picture>
              {selectedAccountId == user.id && (
                <div className="btn-upload-avatar" onClick={() => uploadModal(true)}>
                  <CameraOutlined />
                </div>
              )}
            </div>
            <div className="title-profile">
              <div>
                <h2>{user.name}</h2>
                <p className="add">{user?.address.slice(6, 11) + '...' + user?.address.slice(-5)}</p>
              </div>
            </div>
            {/* Follow */}
            {user.id != selectedAccountId && (
              <AuthorizedButton id="follow-button" onClick={isFollowed ? () => handleUnfollow() : () => handleFollow()}>
                {isFollowed ? intl.get('general.unfollow') : intl.get('general.follow')}
              </AuthorizedButton>
            )}

            {/* TODO: implement in the future */}
            {selectedAccountId == user.id && (
              <div className="action-profile">
                {/* <Button
                  style={{ marginRight: '1rem' }}
                  type="primary"
                  className="outline-btn"
                  onClick={navigateEditPage}
                >
                  <EditOutlined />
                  Edit profile
                </Button> */}
                <Button
                  type="primary"
                  icon={
                    <ReactSVG wrapper="span" className="anticon anticon-custom" src="/images/ico-edit-square.svg" />
                  }
                  className="outline-btn"
                  onClick={() => showPopulatedRenameAccountModal(selectedAccount as Account)}
                >
                  {intl.get('account.edit')}
                </Button>
                <Button type="primary" className="outline-btn btn-edit-cover" onClick={() => uploadModal(false)}>
                  <CameraOutlined />
                  {intl.get('page.editCoverPhoto')}
                </Button>
              </div>
            )}
          </div>
          {selectedAccountId == user.id && (
            <div className="description-profile">
              <Button onClick={() => openFollowModal(Follow.Followers)}>
                {user.followersCount}
                <br />
                {intl.get('general.followers')}
              </Button>
              <Button onClick={() => openFollowModal(Follow.Followees)}>
                {user.followingsCount} <br /> {intl.get('general.followings')}
              </Button>
              <Button onClick={() => openFollowModal(Follow.FollowingPages)}>
                {user.followingPagesCount} <br /> {intl.get('general.followingPages')}
              </Button>
            </div>
          )}
        </ProfileCardHeader>

        <ProfileContentContainer>
          <StyledMenu defaultActiveKey="post">
            <Tabs.TabPane tab="Post" key="post">
              {/* TODO: implement in the future */}
              {/* <LegacyProfile>
                <AboutBox>
                  <h3>About</h3>
                  {userDetailData && (
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
                      dataItem={userDetailData?.address}
                      onClickIcon={() => {}}
                      icon={CompassOutlined}
                      text={userDetailData?.address}
                    />
                    {selectedAccountId == userDetailData.id && (
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
                      <p>Connect with people you know in Lixi.</p>
                      <Button type="primary" className="outline-btn">
                        Discover Lixi social network
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
                {/* <div className="search-bar">
                  <FilterBurnt filterForType={FilterType.PostsProfile} />
                </div> */}

                <Timeline>
                  {data.length == 0 && !isLoading && (
                    <div className="blank-timeline">
                      <img className="time-line-blank" src="/images/time-line-blank.svg" alt="" />
                      <p>Sharing your thinking...</p>
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

            {/* TODO: implement in the future */}
            {/* <Tabs.TabPane tab="About" key="about"></Tabs.TabPane>
            <Tabs.TabPane tab="Friend" key="friend"></Tabs.TabPane>
            <Tabs.TabPane tab="Picture" key="picture"></Tabs.TabPane> */}
          </StyledMenu>
        </ProfileContentContainer>
      </StyledContainerProfileDetail>
    </>
  );
};

export default ProfileDetail;
