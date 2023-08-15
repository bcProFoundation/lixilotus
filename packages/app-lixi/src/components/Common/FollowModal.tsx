import { Button, Descriptions, message, Modal, Skeleton, Space, Tabs } from 'antd';
import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import { CloseCircleOutlined, CopyOutlined } from '@ant-design/icons';
import { QRCode } from './QRCodeModal';
import { AntdFormWrapper } from './EnhancedInputs';
import { closeModal } from '@store/modal/actions';
import { useAppDispatch } from '@store/hooks';
import { useInfinitePagesByFollowerIdQuery } from '@store/page/useInfinitePagesByFollowerIdQuery';
import { useInfiniteFollowingsByFollowerQuery } from '@store/account/useInfiniteFollowingsByFollowerQuery';
import { useInfiniteFollowersByFollowingQuery } from '@store/account/useInfiniteFollowersByFollowingQuery';
import InfiniteScroll from 'react-infinite-scroll-component';
import Link from 'next/link';
import { AvatarUser } from './AvatarUser';
import { currency } from './Ticker';

const { TabPane } = Tabs;

const ShortcutItemAccess = ({
  icon,
  name,
  href,
  onClickItem
}: {
  icon: string;
  name: string;
  burnValue?: number;
  href?: string;
  onClickItem?: () => void;
}) => (
  <Link href={href}>
    <a onClick={onClickItem}>
      <Space className={'item-access'}>
        <AvatarUser icon={icon} name={name} isMarginRight={false} />
        <div> {name} </div>
      </Space>
    </a>
  </Link>
);

export type FollowModalProps = {
  accountId: number;
  type: string;
  classStyle?: string;
};

export const FollowModal: React.FC<FollowModalProps> = (props: FollowModalProps) => {
  const dispatch = useAppDispatch();
  const StyledModel = styled(Modal)`
    .ant-descriptions-bordered .ant-descriptions-view {
      border: none;
    }
    .ant-modal-body {
      border-radius: 20px !important;
    }

    .ant-descriptions-bordered .ant-descriptions-item-label,
    .ant-descriptions-bordered .ant-descriptions-item-content {
      padding: 0px 24px;
      border-right: none;
    }
  `;

  const StyledInfiniteScroll = styled(InfiniteScroll)`
    display: grid;

    a {
      &:hover {
        border-radius: 5px;
        background: rgba(0, 0, 0, 0.25);
      }

      .item-access {
        display: flex;
        padding: 10px;
      }
    }
  `;

  // Followers
  const {
    data: followers,
    fetchNext: followersFetchNext,
    hasNext: followersHasNext,
    isFetching: followersIsFetching
  } = useInfiniteFollowersByFollowingQuery(
    {
      first: 10,
      followingAccountId: props.accountId
    },
    false
  );
  const loadMoreFollowers = () => {
    if (followersHasNext && !followersIsFetching) {
      followersFetchNext();
    } else if (followersHasNext) {
      followersFetchNext();
    }
  };

  // Following accounts
  const {
    data: followings,
    fetchNext: followingsFetchNext,
    hasNext: followingsHasNext,
    isFetching: followingsIsFetching
  } = useInfiniteFollowingsByFollowerQuery(
    {
      first: 10,
      followerAccountId: props.accountId
    },
    false
  );
  const loadMoreFollowings = () => {
    if (followingsHasNext && !followingsIsFetching) {
      followingsFetchNext();
    } else if (followingsHasNext) {
      followingsFetchNext();
    }
  };

  // Following pages
  const {
    data: followingPages,
    fetchNext: followingPagesFetchNext,
    hasNext: followingPagesHasNext,
    isFetching: followingPagesIsFetching
  } = useInfinitePagesByFollowerIdQuery(
    {
      first: 10,
      id: props.accountId
    },
    false
  );
  const loadMoreFollowingPages = () => {
    if (followingPagesHasNext && !followingPagesIsFetching) {
      followingPagesFetchNext();
    } else if (followingPagesHasNext) {
      followingPagesFetchNext();
    }
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  return (
    <>
      <StyledModel
        className={`${props.classStyle}`}
        width={490}
        open={true}
        onOk={null}
        onCancel={handleCloseModal}
        closable={false}
        footer={null}
      >
        <Tabs type="card" defaultActiveKey={props.type}>
          {/* Followers s*/}
          <Tabs.TabPane tab={intl.get('general.followers')} key="followers">
            <React.Fragment>
              <StyledInfiniteScroll
                dataLength={followers.length}
                next={loadMoreFollowers}
                hasMore={followersHasNext}
                loader={<Skeleton avatar active />}
                scrollableTarget="scrollableDiv"
              >
                {followers.length == 0 ? (
                  <p>{intl.get('follow.noFollowers')}</p>
                ) : (
                  followers.map((item, index) => {
                    return (
                      <React.Fragment key={index}>
                        <ShortcutItemAccess
                          icon={item?.avatar ? item.avatar : ""}
                          name={item.name}
                          href={`/profile/${item.address}`}
                          onClickItem={handleCloseModal}
                        />
                      </React.Fragment>
                    );
                  })
                )}
              </StyledInfiniteScroll>
            </React.Fragment>
          </Tabs.TabPane>

          {/* Following accounts */}
          <Tabs.TabPane tab={intl.get('general.youFollow')} key="youFollow">
            <React.Fragment>
              <StyledInfiniteScroll
                dataLength={followings.length}
                next={loadMoreFollowings}
                hasMore={followingsHasNext}
                loader={<Skeleton avatar active />}
                scrollableTarget="scrollableDiv"
              >
                {followings.length == 0 ? (
                  <p>{intl.get('follow.noFollowings')}</p>
                ) : (
                  followings.map((item, index) => {
                    return (
                      <React.Fragment key={index}>
                        <ShortcutItemAccess
                          icon={item?.avatar ? item.avatar : ""}
                          name={item.name}
                          href={`/profile/${item.address}`}
                          onClickItem={handleCloseModal}
                        />
                      </React.Fragment>
                    );
                  })
                )}
              </StyledInfiniteScroll>
            </React.Fragment>
          </Tabs.TabPane>

          {/* Following page */}
          <Tabs.TabPane tab={intl.get('general.followingPages')} key="followingPages">
            <React.Fragment>
              <StyledInfiniteScroll
                dataLength={followingPages.length}
                next={loadMoreFollowingPages}
                hasMore={followingPagesHasNext}
                loader={<Skeleton avatar active />}
                scrollableTarget="scrollableDiv"
              >
                {followingPages.length == 0 ? (
                  <p>{intl.get('follow.noFollowingPages')}</p>
                ) : (
                  followingPages.map((item, index) => {
                    return (
                      <React.Fragment key={index}>
                        <ShortcutItemAccess
                          icon={
                            item.token
                              ? `${currency.tokenIconsUrl}/32/${item.token.tokenId}.png`
                              : item.page
                              ? item.page.avatar
                              : '/images/default-avatar.jpg'
                          }
                          name={item.page ? item.page.name : item.token.name}
                          href={item.page ? `/page/${item.page.id}` : `/token/${item.token.tokenId}`}
                          onClickItem={handleCloseModal}
                        />
                      </React.Fragment>
                    );
                  })
                )}
              </StyledInfiniteScroll>
            </React.Fragment>
          </Tabs.TabPane>
        </Tabs>
      </StyledModel>
    </>
  );
};
