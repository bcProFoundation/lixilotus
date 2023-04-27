import React, { useEffect } from 'react';
import { BellTwoTone, MenuOutlined, SearchOutlined } from '@ant-design/icons';
import { Space, Badge, Button } from 'antd';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { toggleCollapsedSideNav } from '@store/settings/actions';
import { getFilterPostsHome, getNavCollapsed } from '@store/settings/selectors';
import { Header } from 'antd/lib/layout/layout';
import styled from 'styled-components';
import { getSelectedAccount, getSelectedAccountId } from '@store/account/selectors';
import { fetchNotifications, startChannel, stopChannel } from '@store/notification/actions';
import { useRouter } from 'next/router';
import { AvatarUser } from '@components/Common/AvatarUser';
import { useInfinitePostsQuery } from '@store/post/useInfinitePostsQuery';
import { OrderDirection, PostOrderField } from '@generated/types.generated';
import { api as postApi } from '@store/post/posts.api';
import { setGraphqlRequestLoading } from '@store/account/actions';

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
  const filterValue = useAppSelector(getFilterPostsHome);
  const selectedAccountId = useAppSelector(getSelectedAccountId);

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

  const { refetch } = useInfinitePostsQuery(
    {
      first: 20,
      minBurnFilter: filterValue,
      accountId: selectedAccountId,
      orderBy: {
        direction: OrderDirection.Desc,
        field: PostOrderField.UpdatedAt
      }
    },
    false
  );

  const handleLogoClick = () => {
    if (currentPathName === '/') {
      dispatch(postApi.util.resetApiState());
      refetch();
      dispatch(setGraphqlRequestLoading());
    }
  };

  return (
    <Header ref={ref} className={className}>
      <PathDirection>
        <img src="/images/ico-menu.svg" alt="" onClick={handleMenuClick} />
        {currentPathName == '/' && (
          <picture>
            <img width="98px" src="/images/lixilotus-logo.svg" alt="lixilotus-logo" onClick={() => handleLogoClick()} />
          </picture>
        )}
        {pathDirection[1] != '' && <h3>{pathDirection[1]}</h3>}
      </PathDirection>
      <Space direction="horizontal" size={15}>
        {/* <Button type="text" icon={<SearchOutlined style={{ fontSize: '18px', color: '4E444B' }} />}></Button> */}
        <div style={{ cursor: 'pointer' }} onClick={() => router.push(`/profile/${selectedAccount?.address}`)}>
          <AvatarUser name={selectedAccount?.name} isMarginRight={false} />
        </div>
      </Space>
    </Header>
  );
});

const StyledTopbar = styled(Topbar)`
  display: flex;
  background: transparent !important;
  padding-inline: 0px !important;
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
