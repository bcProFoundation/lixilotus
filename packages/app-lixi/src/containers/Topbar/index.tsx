import { useEffect, useState } from "react";
import { BellTwoTone, MenuOutlined } from "@ant-design/icons"
import { Space, Menu, Popover, Badge } from "antd";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { toggleCollapsedSideNav } from "@store/settings/actions";
import { getNavCollapsed } from "@store/settings/selectors";
import { Header } from "antd/lib/layout/layout";
import styled from 'styled-components';
import { getSelectedAccount } from "@store/account/selectors";
import { fetchNotifications } from "@store/notification/actions";
import { getAllNotifications } from "@store/notification/selectors";
import { NotificationDto as Notification } from "@bcpros/lixi-models";

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



const NotificationMenu = (notifications: Notification[]) => {
  return notifications && notifications.length > 0 ?
    (
      <Menu style={{ color: "black", border: "none" }}>
        {notifications.map(item => <Menu.Item key={item.id}>{item.notificationType.template}</Menu.Item>)}
      </Menu>
    ) : <></>
}

const StyledPopover = styled(Popover)`

  .ant-popover {
    width: 200px;
    position: relative;
    top: 40px !important;
    left: -165px !important;

    @media (max-width: 768px) {
      top: 40px !important;
      left: -165px !important;
    }

    @media (max-width: 576px) {
      top: 40px !important;
      left: -165px !important;
    }
  }

  .ant-popover-title {
    font-weight: bold;
    color: #fff;
    border: none;
    background:  ${props => props.theme.primary};
  }

  .ant-popover-arrow > .ant-popover-arrow-content::before {
    background: ${props => props.theme.primary};
  }

  .ant-popover-inner-content {
    padding: 0 !important;
    border: 2px solid ${props => props.theme.primary} !important;
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


  const handleMenuClick = (e) => {
    dispatch(toggleCollapsedSideNav(!navCollapsed));
  }

  return (
    <Header className={className}>
      <MenuOutlined style={{ fontSize: '32px' }} onClick={handleMenuClick} />
      <img src='/images/lixilotus-logo.png' alt='lixilotus' />
      <Space direction="horizontal" size={25} >
        <StyledPopover content={NotificationMenu(notifications)} placement="bottomRight"
          getPopupContainer={(trigger) => trigger} trigger="click" title="Notifications">
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
