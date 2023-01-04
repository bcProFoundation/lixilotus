import React from 'react';
import { CloseCircleOutlined } from '@ant-design/icons';
import { Space, Popover, Comment } from 'antd';
import { useAppDispatch } from '@store/hooks';
import styled from 'styled-components';
import { Account, NotificationDto as Notification } from '@bcpros/lixi-models';
import SwipeToDelete from 'react-swipe-to-delete-ios';
import moment from 'moment';
import { isMobile } from 'react-device-detect';
import { deleteNotification, readNotification } from '@store/notification/actions';
import { downloadExportedLixi } from '@store/lixi/actions';
import { useRouter } from 'next/router';
import intl from 'react-intl-universal';

export type NotificationMenuProps = {
  notifications: Notification[];
  className?: string;
};

export const StyledPopover = styled(Popover)`
  .ant-popover {
    width: 350px;
    position: relative;
    left: auto !important;

    @media (max-width: 768px) {
      top: 40px !important;
      left: -312px !important;
    }

    @media (max-width: 576px) {
      left: -263px !important;
      width: 350px;
    }
  }

  .ant-popover-title {
    font-weight: bold;
    color: #fff;
    border: none;
    background: ${props => props.theme.primary};
    border-radius: 5px 5px 0px 0px;
  }

  @media (max-width: 576px) {
    .ant-popover-arrow {
      right: 65px;
    }
  }

  .ant-popover-arrow > .ant-popover-arrow-content::before {
    background: ${props => props.theme.primary};
  }

  .ant-popover-inner {
    background: #fff;
    border-radius: 0px 0px 5px 5px;
  }

  .ant-popover-inner-content {
    padding: 10px !important;
    height: 300px !important;
    overflow: auto;

    #delete {
      border-radius: 8px;
    }
  }
`;

const StyledComment = styled(Comment)`
  border-radius: 5px;
  border: 1px solid var(--boder-item-light);
  padding: 5px;

  &:hover {
    background-color: #eceff5 !important;
  }

  .ant-comment-inner {
    padding: 0px;
    color: black;
  }
`;

const StyledAuthor = styled.div`
  font-size: 14px;
  color: black;
  display: inline-block;
  width: 300px;

  &:hover {
    color: black;
  }
`;

const StyledTextLeft = styled.span`
  float: left;
  font-size: 16px;
  font-weight: bold;
`;

const StyledTextRight = styled.span`
  float: right;
  font-size: 10px;
  font-style: italic;
`;

const StyledSwipeToDelete = styled(SwipeToDelete)`
  --rstdiHeight: 100% !important;
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const StyledReadAll = styled.div`
  cursor: pointer;
  color: ${props => props.theme.primary};
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 6px;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #eceff5 !important;
  }
`;

const NotificationPopup = (notifications: Notification[], account: Account) => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleDelete = (account: Account, notificationId: string) => {
    dispatch(deleteNotification({ mnemonichHash: account.mnemonicHash, notificationId }));
  };

  const handleRead = (account: Account, notification: Notification) => {
    dispatch(readNotification({ mnemonichHash: account.mnemonicHash, notificationId: notification.id }));
    if (notification.notificationTypeId === 3) {
      const { parentId, mnemonicHash, fileName } = notification.additionalData as any;
      dispatch(downloadExportedLixi({ lixiId: parentId, mnemonicHash, fileName }));
    }
  };

  return (
    <>
      <StyledHeader>
        <h1 style={{ fontSize: '18px', margin: '0px' }}>{intl.get('notification.earlier')}</h1>
        <StyledReadAll onClick={() => router.push('/notifications')}>{intl.get('notification.readAll')}</StyledReadAll>
      </StyledHeader>
      {notifications &&
        notifications.length > 0 &&
        notifications.map(notification => (
          <>
            {isMobile ? (
              <div onClick={() => handleRead(account, notification)}>
                <StyledSwipeToDelete
                  key={notification.id}
                  onDelete={() => handleDelete(account, notification.id)}
                  deleteColor="var(--color-primary)"
                >
                  <StyledComment
                    key={notification.id}
                    style={{ backgroundColor: notification.readAt == null ? '#eceff5' : '#fff', borderRadius: '0px' }}
                    author={
                      <StyledAuthor>
                        <StyledTextLeft></StyledTextLeft>
                        <StyledTextRight>
                          {moment(notification.createdAt).local().format('MMMM Do YYYY, h:mm a')}
                        </StyledTextRight>
                      </StyledAuthor>
                    }
                    content={
                      <div style={{ fontWeight: notification.readAt != null ? 'normal' : 'bold' }}>
                        {notification.message}
                      </div>
                    }
                  />
                </StyledSwipeToDelete>
              </div>
            ) : (
              <StyledComment
                key={notification.id}
                style={{
                  borderRadius: '10px',
                  backgroundColor: notification.readAt == null ? '#eceff5' : '#fff',
                  marginBottom: '5px'
                }}
                author={
                  <StyledAuthor>
                    <StyledTextLeft></StyledTextLeft>
                    <StyledTextRight>
                      {moment(notification.createdAt).local().format('MMMM Do YYYY, h:mm a')}
                    </StyledTextRight>
                  </StyledAuthor>
                }
                content={
                  <Space>
                    <div
                      style={{ fontWeight: notification.readAt != null ? 'normal' : 'bold', cursor: 'pointer' }}
                      onClick={() => handleRead(account, notification)}
                    >
                      {notification.message}
                    </div>
                    <CloseCircleOutlined onClick={() => handleDelete(account, notification.id)} />
                  </Space>
                }
              />
            )}
          </>
        ))}
    </>
  );
};

export default NotificationPopup;
