import {
  AppstoreOutlined,
  BellOutlined,
  FilterOutlined,
  HomeOutlined,
  SwapOutlined,
  UserSwitchOutlined
} from '@ant-design/icons';
import { Account } from '@bcpros/lixi-models';
import { FilterType } from '@bcpros/lixi-models/lib/filter';
import { AvatarUser } from '@components/Common/AvatarUser';
import { FilterBurnt } from '@components/Common/FilterBurn';
import SearchBox from '@components/Common/SearchBox';
import NotificationPopup from '@components/NotificationPopup';
import { ItemAccess } from '@containers/Sidebar/SideBarShortcut';
import { OrderDirection, PostOrderField } from '@generated/types.generated';
import { selectAccount, setGraphqlRequestLoading } from '@store/account/actions';
import { getAllAccounts, getSelectedAccount, getSelectedAccountId } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { fetchNotifications, startChannel, stopChannel } from '@store/notification/actions';
import { getAllNotifications } from '@store/notification/selectors';
import { api as postApi } from '@store/post/posts.api';
import { useInfinitePostsQuery } from '@store/post/useInfinitePostsQuery';
import { saveTopPostsFilter, setDarkTheme, toggleCollapsedSideNav } from '@store/settings/actions';
import { getCurrentThemes, getFilterPostsHome, getIsTopPosts, getNavCollapsed } from '@store/settings/selectors';
import { Badge, Button, Popover, Space, Switch } from 'antd';
import { Header } from 'antd/lib/layout/layout';
import { push } from 'connected-next-router';
import * as _ from 'lodash';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import intl from 'react-intl-universal';
import { fromSmallestDenomination } from 'src/utils/cashMethods';
import styled from 'styled-components';
import useWindowDimensions from '@hooks/useWindowDimensions';

export type TopbarProps = {
  className?: string;
};

const PathDirection = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  @media (max-width: 960px) {
    gap: 0;
    .logo-app {
      width: 80%;
    }
  }
  .logo-app-desktop {
    padding: 1rem 0.5rem;
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
      padding: 4px;
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

const BadgeStyled = styled(Badge)`
  .ant-badge-count {
    min-width: 10px !important;
    height: 10px !important;
    margin-top: 0 !important;
    right: 0px !important;
  }
  .ant-scroll-number-only {
    display: none !important;
  }
  @media (max-width: 960px) {
    display: none !important;
  }
`;

// eslint-disable-next-line react/display-name
const Topbar = React.forwardRef(({ className }: TopbarProps, ref: React.RefCallback<HTMLElement>) => {
  const dispatch = useAppDispatch();
  const navCollapsed = useAppSelector(getNavCollapsed);
  const selectedAccount = useAppSelector(getSelectedAccount);
  const router = useRouter();
  const currentPathName = router.pathname ?? '';
  const currentAbsolutePathName = router.asPath ?? '';
  const pathDirection = currentPathName.split('/', 2);
  const filterValue = useAppSelector(getFilterPostsHome);
  const selectedAccountId = useAppSelector(getSelectedAccountId);
  const notifications = useAppSelector(getAllNotifications);
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [hashtags, setHashtags] = useState([]);
  const [otherAccounts, setOtherAccounts] = useState<Account[]>([]);
  const savedAccounts: Account[] = useAppSelector(getAllAccounts);
  let isTop = useAppSelector(getIsTopPosts);
  const currentTheme = useAppSelector(getCurrentThemes);
  const [isMobile, setIsMobile] = useState(false);
  const { width } = useWindowDimensions();

  useEffect(() => {
    const isMobile = width < 968 ? true : false;
    setIsMobile(isMobile);
  }, [width]);

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
      orderBy: [
        {
          direction: OrderDirection.Desc,
          field: PostOrderField.UpdatedAt
        }
      ]
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

  const HandleMenuPosts = (checked: boolean) => {
    dispatch(saveTopPostsFilter(checked));
  };

  const contentNotification = <PopoverStyled>{NotificationPopup(notifications, selectedAccount, true)}</PopoverStyled>;

  const contentFilterBurn = (
    <>
      {router?.pathname == '/' && (
        <PopoverStyled>
          {intl.get('general.postFilter')}
          <Switch
            checkedChildren={intl.get('general.allPost')}
            unCheckedChildren={intl.get('general.topPost')}
            defaultChecked={isTop}
            onChange={HandleMenuPosts}
          />
        </PopoverStyled>
      )}
      <PopoverStyled>
        <FilterBurnt filterForType={filterType()} />
      </PopoverStyled>
    </>
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
      <h3>Switch Theme</h3>
      <Button
        type="primary"
        className="outline-btn"
        icon={<SwapOutlined />}
        onClick={() => {
          dispatch(setDarkTheme(!currentTheme));
        }}
      >
        {!currentTheme ? 'Dark theme' : 'Light theme'}
      </Button>
    </AccountBox>
  );

  const contentMoreAction = (
    <PopoverStyled>
      <div className="social-menu">
        <h3>Social</h3>
        <ItemAccess
          icon={'/images/ico-page.svg'}
          text={intl.get('general.page')}
          active={
            currentPathName.includes('/page') && !currentAbsolutePathName.includes('page/clbm6r1v91486308n7w6za1qcu')
          }
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
        <ItemAccess
          icon={'/images/ico-support.png'}
          text={intl.get('general.support')}
          active={currentAbsolutePathName.includes('page/clbm6r1v91486308n7w6za1qcu')}
          direction="horizontal"
          key="support"
          onClickItem={() => handleIconClick('/page/clbm6r1v91486308n7w6za1qcu')}
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

  // <Header
  //     style={{ boxShadow: 'none', position: 'fixed', zIndex: '999', top: 0, width: '100%' }}
  //     className={className}
  //   >

  return (
    <Header style={{ boxShadow: '0 10px 30px rgb(0 0 0 / 5%)' }} className={className}>
      <PathDirection>
        <img className="menu-mobile" src="/images/ico-menu.svg" alt="" onClick={handleMenuClick} />
        {currentPathName == '/' && (
          <picture>
            <img
              className={`${isMobile ? '' : 'logo-app-desktop'} "logo-app`}
              height={'64px'}
              src={`${isMobile ? '/images/lixilotus-logo.svg' : '/images/lixilotus-text.svg'}`}
              alt="lixilotus-logo"
              onClick={() => handleLogoClick()}
            />
          </picture>
        )}
        <div
          onClick={handleMenuClick}
          style={{ marginLeft: currentPathName == '/' ? '2rem' : '0.5rem' }}
          className="menu-hamburger"
        >
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
          <Popover
            overlayClassName={`${currentTheme ? 'popover-dark' : ''} filter-btn`}
            arrow={false}
            content={contentFilterBurn}
            placement="bottom"
          >
            <Button className="animate__animated animate__heartBeat" type="text" icon={<FilterOutlined />} />
          </Popover>
          <Popover
            overlayClassName={`${currentTheme ? 'popover-dark' : ''} nofication-btn`}
            arrow={false}
            content={contentNotification}
            placement="bottom"
          >
            <BadgeStyled
              count={1}
              overflowCount={9}
              offset={[notifications?.length < 10 ? 0 : 5, 8]}
              color="var(--color-primary)"
            >
              <Button className="animate__animated animate__heartBeat" type="text" icon={<BellOutlined />} />
            </BadgeStyled>
          </Popover>
          <Popover
            overlayClassName={`${currentTheme ? 'popover-dark' : ''} more-btn`}
            arrow={false}
            content={contentMoreAction}
            placement="bottom"
          >
            <Button className="animate__animated animate__heartBeat" type="text" icon={<AppstoreOutlined />} />
          </Popover>
        </div>
        <div className="account-bar">
          <Popover
            overlayClassName={`${currentTheme ? 'popover-dark' : ''}`}
            arrow={false}
            content={contentSelectAccount}
            placement="bottom"
          >
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
    align-items: baseline !important;
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
