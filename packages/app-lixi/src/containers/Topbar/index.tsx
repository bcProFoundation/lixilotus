import React, { useEffect } from 'react';
import { BellTwoTone, MenuOutlined, SearchOutlined } from '@ant-design/icons';
import { Space, Badge, Button } from 'antd';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { toggleCollapsedSideNav } from '@store/settings/actions';
import { getNavCollapsed } from '@store/settings/selectors';
import { Header } from 'antd/lib/layout/layout';
import styled from 'styled-components';
import { getSelectedAccount } from '@store/account/selectors';
import { fetchNotifications, startChannel, stopChannel } from '@store/notification/actions';
import { useRouter } from 'next/router';
import Link from 'next/link';

export type TopbarProps = {
  className?: string;
};

const PathDirection = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  h3 {
    text-transform: capitalize;

    font-weight: 400;
    font-size: 28px;
    line-height: 40px;
    color: #1e1a1d;
    margin: 0;
  }
`;

// eslint-disable-next-line react/display-name
const Topbar = React.forwardRef(({ className }: TopbarProps, ref: React.RefCallback<HTMLElement>) => {
  const dispatch = useAppDispatch();
  const navCollapsed = useAppSelector(getNavCollapsed);
  const selectedAccount = useAppSelector(getSelectedAccount);
  const router = useRouter();
  const currentPathName = router.pathname ?? '';
  const pathDirection = currentPathName.split('/', 2);

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
      <PathDirection>
        <img src="/images/ico-menu.svg" alt="" onClick={handleMenuClick} />
        {currentPathName == '/' && <img width="98px" src="/images/lixilotus-logo.svg" alt="" />}
        {pathDirection[1] != '' && <h3>{pathDirection[1]}</h3>}
      </PathDirection>
      <Space direction="horizontal" size={15}>
        {/* <Button type="text" icon={<SearchOutlined style={{ fontSize: '18px', color: '4E444B' }} />}></Button> */}
        <Link href={'/wallet'}>
          <img width={40} height={40} src="/images/anonymous-ava.svg" alt="lotus" />
        </Link>
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
  justify-content: space-between;
  background: ${props => props.theme.wallet.background};
  a {
    color: ${props => props.theme.wallet.text.secondary};

    :hover {
      color: ${props => props.theme.primary};
    }
  }

  @media (max-width: 960px) {
    a {
      font-size: 12px;
    }
    padding: 20px 0 20px;
  }

  @media (min-width: 960px) {
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
