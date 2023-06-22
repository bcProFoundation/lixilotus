import React, { useEffect, useState } from 'react';
import { FilterOutlined, BellOutlined, HomeOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { Space, Badge, Button, Popover } from 'antd';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { toggleCollapsedSideNav } from '@store/settings/actions';
import { getFilterPostsHome, getNavCollapsed } from '@store/settings/selectors';
import { Header } from 'antd/lib/layout/layout';
import styled from 'styled-components';
import { getAllAccounts, getSelectedAccount, getSelectedAccountId } from '@store/account/selectors';
import { fetchNotifications, startChannel, stopChannel } from '@store/notification/actions';
import { useRouter } from 'next/router';
import { AvatarUser } from '@components/Common/AvatarUser';
import { useInfinitePostsQuery } from '@store/post/useInfinitePostsQuery';
import { OrderDirection, PostOrderField } from '@generated/types.generated';
import { api as postApi } from '@store/post/posts.api';
import { selectAccount, setGraphqlRequestLoading } from '@store/account/actions';
import SearchBox from '@components/Common/SearchBox';
import { FilterBurnt } from '@components/Common/FilterBurn';
import { FilterType } from '@bcpros/lixi-models/lib/filter';
import { getAllNotifications } from '@store/notification/selectors';
import NotificationPopup from '@components/NotificationPopup';
import { Account } from '@bcpros/lixi-models';
import * as _ from 'lodash';
import { fromSmallestDenomination } from 'src/utils/cashMethods';
import { push } from 'connected-next-router';
import { ItemAccess } from '@containers/Sidebar/SideBarShortcut';
import intl from 'react-intl-universal';

export type TopbarProps = {
  className?: string;
};

const PathDirection = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  @media (max-width: 960px) {
    gap: 0;
  }
  h3 {
    text-transform: capitalize;
    font-weight: 400;
    font-size: 28px;
    line-height: 40px;
    color: #1e1a1d;
    margin: 0;
  }

  .menu-mobile {
    display: none;
    margin-left: 6px;
    @media (max-width: 960px) {
      display: block;
    }
  }

  .checkbox {
    position: absolute;
    display: block;
    height: 32px;
    width: 32px;
    z-index: 5;
    opacity: 0;
    cursor: pointer;
  }

  .hamburger-lines {
    display: block;
    height: 20px;
    width: 26px;
    position: absolute;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .menu-hamburger {
    position: relative;
    width: 20px;
    height: 20px;
    margin-left: 2rem;
    @media (max-width: 960px) {
      display: none;
    }
  }

  .hamburger-lines .line {
    display: block;
    height: 2px;
    width: 100%;
    border-radius: 10px;
    background: #0e2431;
  }

  .hamburger-lines .line1 {
    transform-origin: 0% 0%;
    transition: transform 0.4s ease-in-out;
  }

  .hamburger-lines .line2 {
    transition: transform 0.2s ease-in-out;
  }

  .hamburger-lines .line3 {
    transform-origin: 0% 100%;
    transition: transform 0.4s ease-in-out;
  }

  input[type='checkbox']:checked ~ .hamburger-lines .line1 {
    transform: rotate(45deg);
  }

  input[type='checkbox']:checked ~ .hamburger-lines .line2 {
    transform: scaleY(0);
  }

  input[type='checkbox']:checked ~ .hamburger-lines .line3 {
    transform: rotate(-45deg);
  }
`;

const AccountBox = styled.div`
  .sub-account {
    display: flex;
    gap: 2rem;
    margin-top: 1rem;
    cursor: pointer;
    &:hover {
      .name {
        color: var(--color-primary);
      }
    }
    .sub-account-info {
      flex: 1;
      p {
        margin: 0;
        &.name {
          font-size: 14px;
          font-weight: 500;
        }
        &.address {
          font-size: 12px;
        }
      }
    }
  }
`;

const PopoverStyled = styled.div`
  .social-menu,
  .social-feature {
    width: 100%;
    text-align: left;
    padding-bottom: 0.5rem;

    h3 {
      font-size: 14px !important;
      margin-bottom: 0.5rem !important;
    }

    .active-item-access {
      padding: 4px !important;
    }

    img {
      width: 16px;
      height: 16px;
    }

    .text-item {
      font-size: 12px !important;
    }

    h3 {
      margin-bottom: 1rem;
    }

    div:not(.ant-space-item) {
      margin-bottom: 1rem;
      &:last-child {
        margin-bottom: 0;
      }
    }

    .active-item-access {
      background: var(--bg-color-light-theme);
      padding: 2px 0;
      border-radius: var(--border-radius-primary);
      img {
        filter: var(--filter-color-primary);
      }
      .text-item {
        color: var(--color-primary);
      }
    }

    .item-access {
      cursor: pointer;
      &:hover {
        .text-item {
          color: var(--color-primary) !important;
        }
      }
    }
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
  const notifications = useAppSelector(getAllNotifications);
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [hashtags, setHashtags] = useState([]);
  const [otherAccounts, setOtherAccounts] = useState<Account[]>([]);
  const savedAccounts: Account[] = useAppSelector(getAllAccounts);

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
    setOtherAccounts(_.filter(savedAccounts, acc => acc && acc.id !== selectedAccount?.id));
  }, [savedAccounts]);

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

  const searchPost = (value: string, hashtagsValue?: string[]) => {
    setSearchValue(value);

    if (hashtagsValue && hashtagsValue.length > 0) setHashtags([...hashtagsValue]);
  };

  const onDeleteQuery = () => {
    setSearchValue(null);
    setHashtags([]);
  };

  const onDeleteHashtag = (hashtagsValue: string[]) => {
    setHashtags([...hashtagsValue]);
  };

  const filterType = () => {
    switch (pathDirection[1]) {
      case '':
        return FilterType.PostsHome;
      case 'page':
        return FilterType.PostsPage;
      case 'profile':
        return FilterType.PostsProfile;
      case 'token':
        return FilterType.PostsToken;

      default:
        return FilterType.PostsHome;
    }
  };

  const SearchBoxType = () => {
    switch (pathDirection[1]) {
      case '':
        return 'posts';
      case 'page':
        return 'page';
      case 'token':
        return 'token';
      default:
        return 'posts';
    }
  };

  const handleIconClick = (newPath?: string) => {
    if (currentPathName === '/' && newPath === '/') {
      dispatch(postApi.util.resetApiState());
      refetch();
      dispatch(setGraphqlRequestLoading());
    } else {
      dispatch(push(newPath));
    }
  };

  const contentNotification = <PopoverStyled>{NotificationPopup(notifications, selectedAccount)}</PopoverStyled>;

  const contentFilterBurn = (
    <PopoverStyled>
      <FilterBurnt filterForType={filterType()} />
    </PopoverStyled>
  );

  const contentSelectAccount = (
    <AccountBox>
      <h3>Switch accounts</h3>
      {otherAccounts &&
        otherAccounts.map((acc, index) => {
          return (
            <div className="sub-account" key={index}>
              <div className="sub-account-info">
                <p className="name">{acc?.name}</p>
                <p className="address">~{fromSmallestDenomination(acc?.balance).toFixed(2)} XPI</p>
              </div>
              <Button
                type="primary"
                className="outline-btn"
                icon={<UserSwitchOutlined />}
                onClick={() => {
                  dispatch(selectAccount(acc.id));
                }}
              ></Button>
            </div>
          );
        })}
    </AccountBox>
  );

  const contentMoreAction = (
    <PopoverStyled>
      <div className="social-menu">
        <h3>Socical</h3>
        <ItemAccess
          icon={'/images/ico-newfeeds.svg'}
          text={intl.get('general.newsfeed')}
          active={currentPathName === '/' || currentPathName.includes('/post')}
          direction="horizontal"
          key="home"
          onClickItem={() => handleIconClick('/')}
        />
        <ItemAccess
          icon={'/images/ico-page.svg'}
          text={intl.get('general.page')}
          active={currentPathName.includes('/page')}
          direction="horizontal"
          key="page-feed"
          onClickItem={() => handleIconClick('/page/feed')}
        />
        <ItemAccess
          icon={'/images/ico-notifications.svg'}
          text={intl.get('general.notifications')}
          active={currentPathName === '/notifications'}
          direction="horizontal"
          key="notifications"
          onClickItem={() => handleIconClick('/notifications')}
        />
      </div>
      <div className="social-feature">
        <h3>Feature</h3>
        <ItemAccess
          icon={'/images/ico-tokens.svg'}
          text={intl.get('general.tokens')}
          active={currentPathName.includes('/token')}
          direction="horizontal"
          key="tokens-feed"
          onClickItem={() => handleIconClick('/token/listing')}
        />
        <ItemAccess
          icon={'/images/ico-account.svg'}
          text={intl.get('general.accounts')}
          active={currentPathName === '/wallet'}
          direction="horizontal"
          key="wallet-lotus"
          onClickItem={() => handleIconClick('/wallet')}
        />
        <ItemAccess
          icon={'/images/ico-lixi.svg'}
          text={intl.get('general.lixi')}
          active={currentPathName.includes('/lixi')}
          direction="horizontal"
          key="lixi"
          onClickItem={() => handleIconClick('/lixi')}
        />
        <ItemAccess
          icon={'/images/ico-setting.svg'}
          text={intl.get('general.settings')}
          active={currentPathName === '/settings'}
          direction="horizontal"
          key="settings"
          onClickItem={() => handleIconClick('/settings')}
        />
      </div>
    </PopoverStyled>
  );

  return (
    <Header style={{ boxShadow: '0 10px 30px rgb(0 0 0 / 5%)' }} ref={ref} className={className}>
      <PathDirection>
        <img className="menu-mobile" src="/images/ico-menu.svg" alt="" onClick={handleMenuClick} />
        {currentPathName == '/' && (
          <picture>
            <img
              height={'64px'}
              src="/images/lixilotus-logo.svg"
              alt="lixilotus-logo"
              onClick={() => handleLogoClick()}
            />
          </picture>
        )}
        <div onClick={handleMenuClick} className="menu-hamburger">
          <input className="checkbox" type="checkbox" name="" id="" checked={navCollapsed} />
          <div className="hamburger-lines">
            <span className="line line1"></span>
            <span className="line line2"></span>
            <span className="line line3"></span>
          </div>
        </div>
        {pathDirection[1] != '' && <h3>{pathDirection[1]}</h3>}
      </PathDirection>
      <div className="filter-bar">
        <SearchBox />
      </div>
      <SpaceStyled direction="horizontal" size={15}>
        <div className="action-bar-header">
          <Button
            onClick={() => handleIconClick('/')}
            className="home-btn animate__animated animate__heartBeat"
            type="text"
            icon={<HomeOutlined />}
          />
          <Popover className="filter-btn" arrow={false} content={contentFilterBurn} placement="bottom">
            <Button className="animate__animated animate__heartBeat" type="text" icon={<FilterOutlined />} />
          </Popover>
          <Popover className="nofication-btn" arrow={false} content={contentNotification} placement="bottom">
            <Badge
              count={notifications.filter(item => _.isNil(item.readAt)).length}
              overflowCount={9}
              offset={[notifications?.length < 10 ? 0 : 5, 8]}
              color="var(--color-primary)"
            >
              <Button className="animate__animated animate__heartBeat" type="text" icon={<BellOutlined />} />
            </Badge>
          </Popover>
          <Popover className="more-btn" arrow={false} content={contentMoreAction} placement="bottom">
            <Button
              className="animate__animated animate__heartBeat"
              type="text"
              icon={<img src="/images/ico-grid.svg" />}
            />
          </Popover>
        </div>
        <div className="account-bar">
          <Popover arrow={false} content={contentSelectAccount} placement="bottom">
            <AvatarUser name={selectedAccount?.name} isMarginRight={false} />
            <p className="account-info">
              <span className="account-name">{selectedAccount?.name}</span>
              <span className="account-balance">
                ~ {fromSmallestDenomination(selectedAccount?.balance).toFixed(2)} <span className="unit">XPI</span>
              </span>
            </p>
          </Popover>
        </div>
      </SpaceStyled>
    </Header>
  );
});

const SpaceStyled = styled(Space)`
  justify-self: end;
  .ant-space-item {
    div {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
  .anticon {
    font-size: 20px;
    color: var(--color-primary);
  }
  .account-bar {
    cursor: pointer;
    padding-right: 1rem;
    &:hover {
      .account-name {
        color: var(--color-primary);
      }
      .account-balance {
        color: #000 !important;
      }
    }

    & > span {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
    }

    .account-info {
      margin: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      span {
        line-height: initial;
        &.account-name {
          font-size: 13px;
          font-weight: 500;
        }
        &.account-balance {
          font-size: 12px;
          color: #a9a8a9;
          .unit {
            font-size: 9px;
            font-weight: 600;
            color: var(--color-primary);
          }
        }
      }
    }

    @media (max-width: 960px) {
      padding-right: 8px;
      .account-info {
        display: none !important;
      }
    }
  }
`;

const StyledTopbar = styled(Topbar)`
  background: #fff;
  display: grid;
  padding: 0;
  grid-template-columns: auto auto auto;
  max-height: 64px;

  .filter-bar {
    display: flex;
    align-items: center;
  }
  .action-bar-header {
    display: flex;
    align-items: center;
    gap: 8px;
    .anticon {
      font-size: 20px;
    }
    .more-btn {
      display: flex;
      justify-content: center;
      img {
        width: 20px;
        height: 20px;
        filter: var(--filter-color-primary);
      }
    }
  }

  @media (max-width: 960px) {
    grid-template-columns: auto auto;
    .action-bar-header {
      .nofication-btn,
      .home-btn {
        display: none !important;
      }
    }
    .filter-bar {
      display: none !important;
    }
  }
`;

export default StyledTopbar;
