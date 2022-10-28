import React, { useEffect } from 'react';
import { BellTwoTone, MenuOutlined } from '@ant-design/icons';
import { Space, Badge } from 'antd';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { toggleCollapsedSideNav } from '@store/settings/actions';
import { getNavCollapsed } from '@store/settings/selectors';
import { Header } from 'antd/lib/layout/layout';
import styled from 'styled-components';
import { getSelectedAccount } from '@store/account/selectors';
import { fetchNotifications, startChannel, stopChannel } from '@store/notification/actions';
import { getAllNotifications } from '@store/notification/selectors';
import { NotificationDto as Notification } from '@bcpros/lixi-models';
import NotificationPopup, { StyledPopover } from '@components/NotificationPopup';

export type TopbarProps = {
  className?: string;
};

export type NotificationMenuProps = {
  notifications: Notification[];
  className?: string;
};

const StyledBell = styled(BellTwoTone)`
  font-size: 22px;
  position: relative;
  top: 7px;
  cursor: pointer;
`;

// eslint-disable-next-line react/display-name
const Topbar = React.forwardRef(({ className }: TopbarProps, ref: React.RefCallback<HTMLElement>) => {
  const dispatch = useAppDispatch();
  const navCollapsed = useAppSelector(getNavCollapsed);
  const selectedAccount = useAppSelector(getSelectedAccount);
  const notifications = useAppSelector(getAllNotifications);

  useEffect(() => {
    if (selectedAccount) {
      dispatch(
        fetchNotifications({
          accountId: selectedAccount.id,
          mnemonichHash: selectedAccount.mnemonicHash
        })
      );
    }
  }, []);

  useEffect(() => {
    dispatch(startChannel());
    return () => {
      stopChannel();
    };
  }, []);

  const handleMenuClick = e => {
    dispatch(toggleCollapsedSideNav(!navCollapsed));
  };

  return (
    <Header ref={ref} className={className}>
      <MenuOutlined className="collapse-menu" style={{ fontSize: '32px' }} onClick={handleMenuClick} />
      <img width="120px" src="/images/lixilotus-logo.svg" alt="lixilotus" />
      <Space direction="horizontal" size={25}>
        <StyledPopover
          content={NotificationPopup(notifications, selectedAccount)}
          placement="bottomRight"
          getPopupContainer={trigger => trigger}
          trigger={notifications.length != 0 ? 'click' : ''}
          title="Notifications"
        >
          <Badge
            count={notifications.length}
            overflowCount={9}
            offset={[notifications.length < 10 ? 0 : 5, 25]}
            color="var(--color-primary)"
          >
            <StyledBell twoToneColor="#6f2dbd" />
          </Badge>
        </StyledPopover>
        <img src="/images/lotus-logo-small.png" alt="lotus" />
      </Space>
    </Header>
  );
});

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

  @media (min-width: 768px) {
    display: none;
    padding: 1rem 2rem;
    position: fixed;
    z-index: 999;
    .collapse-menu {
      display: none;
    }
  }
`;

export default StyledTopbar;
