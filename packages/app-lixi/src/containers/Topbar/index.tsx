import { BellTwoTone, CloseCircleOutlined, MenuOutlined } from "@ant-design/icons";
import { Account, NotificationDto as Notification } from "@bcpros/lixi-models";
import { getSelectedAccount } from "@store/account/selectors";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { downloadExportedLixi } from "@store/lixi/actions";
import { deleteNotification, fetchNotifications, readNotification, startChannel, stopChannel } from "@store/notification/actions";
import { getAllNotifications } from "@store/notification/selectors";
import { toggleCollapsedSideNav } from "@store/settings/actions";
import { getNavCollapsed } from "@store/settings/selectors";
import { Badge, Comment, Popover, Space } from "antd";
import { Header } from "antd/lib/layout/layout";
import moment from 'moment';
import { useEffect } from "react";
import { isMobile } from "react-device-detect";
import SwipeToDelete from 'react-swipe-to-delete-ios';
import styled from 'styled-components';

export type TopbarProps = {
  className?: string,
}

export type NotificationMenuProps = {
  notifications: Notification[],
  className?: string,
}

const StyledBell = styled(BellTwoTone)`
  font-size: 22px;
  position: relative;
  top: 7px;
  cursor: pointer;
`;

const StyledComment = styled(Comment)`
  border-radius: 5px;
  border-bottom: 1px solid #e8e8e8;
  padding: 5px;

  &:hover {
    background-color: #eceff5;
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

  @media (max-width: 568px) {
    width:250px
  }
`

const StyledTextLeft = styled.span`
  float: left;
  font-size: 16px;
  font-weight: bold;
`

const StyledTextRight = styled.span`
  float: right;
  font-size: 10px;
  font-style: italic;
`



const NotificationMenu = (notifications: Notification[], account: Account) => {
  const dispatch = useAppDispatch();

  const handleDelete = (account: Account, notificationId: string) => {
    dispatch(deleteNotification({ mnemonichHash: account.mnemonicHash, notificationId }));
  }

  const handleRead = (account: Account, notification: Notification) => {
    dispatch(readNotification({ mnemonichHash: account.mnemonicHash, notificationId: notification.id }));
    if (notification.notificationTypeId === 3) {
      const { parentId, mnemonicHash, fileName } = notification.additionalData as any;
      dispatch(downloadExportedLixi({ lixiId: parentId, mnemonicHash, fileName }));
    }
  }

  return notifications && notifications.length > 0 && (
    <>
      {notifications.map(notification => (
        <>
          {isMobile ? (
            <div onClick={() => handleRead(account, notification)}>
              <SwipeToDelete
                key={notification.id}
                onDelete={() => handleDelete(account, notification.id)}
                deleteColor="#6f2dbd"
              >
                <StyledComment
                  key={notification.id}
                  style={{ backgroundColor: notification.readAt == null ? "#eceff5" : "#fff" }}
                  author={
                    <StyledAuthor >
                      <StyledTextLeft></StyledTextLeft>
                      <StyledTextRight >{moment(notification.createdAt).local().format("MMMM Do YYYY, h:mm a")}</StyledTextRight>
                    </StyledAuthor>
                  }
                  content={
                    <div style={{ fontWeight: notification.readAt != null ? "normal" : "bold" }}>{notification.message}</div>
                  }
                />
              </SwipeToDelete>
            </div>
          ) : (
            <StyledComment
              key={notification.id}
              style={{ borderRadius: "10px", backgroundColor: notification.readAt == null ? "#eceff5" : "#fff", marginBottom: "5px" }}
              author={
                <StyledAuthor >
                  <StyledTextLeft></StyledTextLeft>
                  <StyledTextRight >{moment(notification.createdAt).local().format("MMMM Do YYYY, h:mm a")}</StyledTextRight>
                </StyledAuthor>
              }
              content={
                <Space>
                  <div
                    style={{ fontWeight: notification.readAt != null ? "normal" : "bold", cursor: "pointer" }}
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
  )
}

const StyledPopover = styled(Popover)`
  .ant-popover {
    width: 350px;
    position: relative;
    top: 40px !important;
    left: -315px !important;

    @media (max-width: 768px) {
      top: 40px !important;
      left: -315px !important;
    }

    @media (max-width: 576px) {
      top: 40px !important;
      left: -265px !important;
      width: 350px;
    }
  }

  .ant-popover-title {
    font-weight: bold;
    color: #fff;
    border: none;
    background:  ${props => props.theme.primary};
    border-radius: 5px 5px 0px 0px;
  }

   @media (max-width: 576px) {
    .ant-popover-arrow {
      right: 65px ;
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
`

const Topbar = ({
  className
}: TopbarProps) => {
  const dispatch = useAppDispatch();
  const navCollapsed = useAppSelector(getNavCollapsed);
  const selectedAccount = useAppSelector(getSelectedAccount);
  const notifications = useAppSelector(getAllNotifications);

  useEffect(() => {
    if (selectedAccount) {
      dispatch(fetchNotifications({
        accountId: selectedAccount.id,
        mnemonichHash: selectedAccount.mnemonicHash
      }));
    }
  }, [])

  useEffect(() => {
    dispatch(startChannel());
    return () => {
      stopChannel();
    }
  }, []);

  const handleMenuClick = (e) => {
    dispatch(toggleCollapsedSideNav(!navCollapsed));
  }

  return (
    <Header className={className}>
      <MenuOutlined style={{ fontSize: '32px' }} onClick={handleMenuClick} />
      <img src='/images/lixilotus-logo.png' alt='lixilotus' />
      <Space direction="horizontal" size={25} >
        <StyledPopover content={NotificationMenu(notifications, selectedAccount)} placement="bottomRight"
          getPopupContainer={(trigger) => trigger} trigger={notifications.length != 0 ? "click" : ""} title="Notifications">
          <Badge count={notifications.length} overflowCount={9} offset={[notifications.length < 10 ? 0 : 5, 25]} color="#6f2dbd">
            <StyledBell twoToneColor="#6f2dbd" />
          </Badge>
        </StyledPopover>
        <img src='/images/lotus-logo-small.png' alt='lotus' />
      </Space>
    </Header>
  )
}

const StyledTopbar = styled(Topbar)`
  display: flex;
  align-items: center;
  justify-content: space-between !important;
  width: 100%;
  padding: 10px 0 15px;
  margin-bottom: 20px;
  justify-content: space-between;
  border-bottom: 1px solid ${props => props.theme.wallet.borders.color};

  a {
    color: ${props => props.theme.wallet.text.secondary};

    :hover {
      color: ${props => props.theme.primary};
    }
  }

  @media (max-width: 768px) {
    a {
      font-size: 12px;
    }
    padding: 20px 0 20px;
  }
`;

export default StyledTopbar;
