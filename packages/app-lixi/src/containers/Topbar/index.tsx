import Icon, { UserSwitchOutlined, SendOutlined, CopyOutlined, SyncOutlined } from '@ant-design/icons';
import { Account } from '@bcpros/lixi-models';
import { FilterType } from '@bcpros/lixi-models/lib/filter';
import AvatarUser from '@components/Common/AvatarUser';
import { FilterBurnt } from '@components/Common/FilterBurn';
import SearchBox from '@components/Common/SearchBox';
import NotificationPopup from '@components/NotificationPopup';
import { ItemAccess } from '@containers/Sidebar/SideBarShortcut';
import { selectAccount, setGraphqlRequestLoading } from '@store/account/actions';
import { getAccountInfoTemp, getAllAccounts, getSelectedAccount, getSelectedAccountId } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getAllNotifications } from '@store/notification/selectors';
import { api as postApi } from '@store/post/posts.api';
import { saveTopPostsFilter, toggleCollapsedSideNav } from '@store/settings/actions';
import { getCurrentThemes, getFilterPostsHome, getIsTopPosts, getNavCollapsed } from '@store/settings/selectors';
import { Badge, Button, Popover, Space, Switch } from 'antd';
import { Header } from 'antd/lib/layout/layout';
import { push } from 'connected-next-router';
import * as _ from 'lodash';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import intl from 'react-intl-universal';
import { fromSmallestDenomination } from '@utils/cashMethods';
import styled from 'styled-components';
import FollowSvg from '@assets/icons/follow.svg';
import { AuthorizationContext } from '@context/index';
import useAuthorization from '../../components/Common/Authorization/use-authorization.hooks';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Link from 'next/link';
import { getModals } from '@store/modal/selectors';
import { showToast } from '@store/toast/actions';
import { getWalletHasUpdated, getWalletStatus } from '@store/wallet';
import { ReactSVG } from 'react-svg';
import { currency } from '@bcpros/lixi-components/components/Common/Ticker';
import { openActionSheet } from '@store/action-sheet/actions';
import { usePageQuery } from '@store/page/pages.generated';
import { useGetAccountByAddressQuery } from '@store/account/accounts.generated';
import { FilterLevel } from '../../components/Common/FilterLevel';
import useDetectMobileView from '@local-hooks/useDetectMobileView';

export type TopbarProps = {
  className?: string;
};

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
        }
      }
      .unit {
        font-size: 9px;
        font-weight: 600;
        color: var(--color-primary);
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

const PathDirection = styled.div`
  display: flex;
  gap: 0;
  align-items: center;
  @media (max-width: 960px) {
    .logo-app {
      width: 60px;
      height: 60px;
    }
  }
  .logo-app-desktop {
    padding: 1rem 0.5rem;
    cursor: pointer;
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
    margin-right: 8px;
    @media (max-width: 960px) {
      display: block;
    }
    max-width: 22px;
    max-height: 22px;
  }

  .navigate-back-btn {
    cursor: pointer;
    width: 32px;
    height: 30px;
    margin: 0 8px;
  }

  .path-direction-text {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    line-clamp: 1;
    -webkit-line-clamp: 1;
    box-orient: vertical;
    -webkit-box-orient: vertical;
    text-align: left;
    word-break: break-all;
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
      display: flex;
      align-items: center;
      gap: 0.5rem;
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
    &:last-child {
      margin-bottom: 1rem;
    }
  }

  .current-name {
    margin: 0;
    color: var(--color-primary);
  }
  .profile-feature {
    display: flex;
    gap: 2rem;
    align-items: center;
    span:first-child {
      flex: 1;
      font-size: 12px;
    }
    span:last-child {
      font-size: 18px;
      color: var(--color-primary);
      padding: 0 3px;
      cursor: pointer;
    }
  }
`;

const StyledImagePathDirection = styled.img`
  width: 30px;
  height: 30px;
  object-fit: cover;
`;

export const PopoverStyled = styled.div`
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

export const TitleFilterStyled = styled.span`
  display: flex;
  justify-content: space-between;
  .follow-title {
    font-weight: 500;
  }
  svg {
    width: 12px;
    height: 12px;
    filter: invert(50%) sepia(12%) saturate(19%) hue-rotate(251deg) brightness(92%) contrast(85%);
    margin-right: 7px;
  }
`;
const BadgeStyled = styled(Badge)`
  .ant-badge-count {
    min-width: 10px !important;
    height: 10px !important;
    margin-top: 0 !important;
    right: 5px !important;
    top: 5px;
  }
  .ant-scroll-number-only {
    display: none !important;
  }
  @media (max-width: 960px) {
    display: none !important;
  }
`;

const StyledHeader = styled(Header)`
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
  .home-btn {
    .anticon {
      svg {
        width: 28px;
        height: 28px;
      }
    }
  }
  @media (max-width: 960px) {
    position: fixed;
    top: 0;
    z-index: 9;
    width: 100%;
    height: 64px;
    grid-template-columns: 1fr auto;
    .action-bar-header {
      .home-btn {
        display: none !important;
      }
    }
    .filter-bar {
      display: none !important;
    }
  }
  @media (max-width: 526px) {
    &.hide-header {
      display: none;
    }
  }
`;

export const ButtonTopbar = styled(Button)`
  width: 44px !important;
  height: 44px !important;
  background: var(--bg-color-light-theme);
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-self: center;
  align-items: center;
  justify-content: center;
  &.filter-btn {
    @media (max-width: 960px) {
      display: none;
    }
  }
`;

const Topbar: React.FC<any> = ({ className }: { className: string }) => {
  const dispatch = useAppDispatch();
  const navCollapsed = useAppSelector(getNavCollapsed);
  const selectedAccount = useAppSelector(getSelectedAccount);
  const accountInfoTemp = useAppSelector(getAccountInfoTemp);
  const router = useRouter();
  const currentPathName = router.pathname ?? '';
  const currentAbsolutePathName = router.asPath ?? '';
  const pathDirection = currentPathName.split('/', 2);
  const notifications = useAppSelector(getAllNotifications);
  const [openMoreOption, setOpenMoreOption] = useState(false);
  const [openProfileOption, setOpenProfileOption] = useState(false);
  const savedAccounts: Account[] = useAppSelector(getAllAccounts);
  let isTop = useAppSelector(getIsTopPosts);
  const currentTheme = useAppSelector(getCurrentThemes);
  const isMobile = useDetectMobileView();
  const authorization = useContext(AuthorizationContext);
  const askAuthorization = useAuthorization();
  const currentModal = useAppSelector(getModals);
  const walletStatus = useAppSelector(getWalletStatus);
  const walletHasUpdated = useAppSelector(getWalletHasUpdated);

  const slug: string = _.isArray(router?.query?.slug) ? router?.query?.slug[0] : router?.query?.slug;
  const { currentData: currentDataPageQuery } = usePageQuery({ id: slug }, { skip: !slug });
  const { currentData: currentDataGetAccount } = useGetAccountByAddressQuery(
    {
      address: slug
    },
    { skip: !slug || router.pathname.includes('/page/') }
  );

  const handlePathDirection = useMemo(() => {
    let pathName = '';
    if (router.pathname === '/page/[slug]') {
      pathName = currentDataPageQuery?.page?.name || 'Page';
    } else if (router.pathname === '/profile/[slug]') {
      pathName = currentDataGetAccount?.getAccountByAddress?.name || 'Profile';
    } else {
      pathName = pathDirection[1];
    }
    return pathName;
  }, [currentDataPageQuery, currentDataGetAccount, router]);

  const handleImagePathDirection = useMemo(() => {
    let pathImageUrl = '';
    if (router.pathname === '/page/[slug]') {
      pathImageUrl = currentDataPageQuery?.page?.avatar || '';
    } else if (router.pathname === '/profile/[slug]') {
      pathImageUrl = currentDataGetAccount?.getAccountByAddress?.avatar || '';
    }
    return pathImageUrl;
  }, [currentDataPageQuery, currentDataGetAccount, router]);
  const otherAccounts = useMemo(() => {
    return _.filter(savedAccounts, acc => acc && acc.id !== selectedAccount?.id);
  }, [savedAccounts]);

  const handleMenuClick = e => {
    dispatch(toggleCollapsedSideNav(!navCollapsed));
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

  const handleIconClick = (newPath?: string) => {
    if (currentPathName === '/' && newPath === '/') {
      dispatch(postApi.util.resetApiState());
      dispatch(setGraphqlRequestLoading());
    } else {
      dispatch(push(newPath));
    }
    setOpenMoreOption(false);
  };

  const handleClickInstall = () => {
    setOpenMoreOption(false);
    dispatch(openActionSheet('InstallPwaGuide', {}));
  };

  const handleMenuPosts = (checked: boolean) => {
    dispatch(saveTopPostsFilter(checked));
  };

  const balanceAccount = (acc?: any) => {
    const balanceString = fromSmallestDenomination(walletStatus.balances.totalBalanceInSatoshis ?? 0);
    return `~ ${balanceString.toFixed(2)}`;
  };

  const handleOnCopy = () => {
    dispatch(
      showToast('info', {
        message: intl.get('toast.info'),
        description: intl.get('lixi.addressCopied')
      })
    );
  };

  const handleNavigateBack = () => {
    router.back();
  };

  const contentNotification = <PopoverStyled>{NotificationPopup(notifications, selectedAccount, true)}</PopoverStyled>;

  const contentFilterBurn = (
    <>
      {router?.pathname && router?.pathname != '/' ? (
        <PopoverStyled>
          <TitleFilterStyled>
            <p className="follow-title">
              {intl.get('general.postFilter')} <Icon component={() => <FollowSvg />} />
            </p>
            <Switch
              checkedChildren={intl.get('general.on')}
              unCheckedChildren={intl.get('general.off')}
              defaultChecked={true}
              onChange={handleMenuPosts}
            />
          </TitleFilterStyled>
          <FilterBurnt filterForType={filterType()} />
        </PopoverStyled>
      ) : (
        <PopoverStyled>
          <FilterLevel />
        </PopoverStyled>
      )}
    </>
  );

  const contentSelectAccount = (
    <AccountBox>
      {selectedAccount && (
        <>
          <div>
            <h3>Current Account</h3>
            <div>
              <h3
                className="current-name"
                onClick={() => isMobile && router.push(`/profile/${selectedAccount.address}`)}
              >
                {selectedAccount?.name}
              </h3>
              <CopyToClipboard text={selectedAccount?.address} onCopy={handleOnCopy}>
                <div className="profile-feature">
                  <span>{selectedAccount?.address.slice(-8) + ' '}</span>
                  <span>
                    <CopyOutlined />
                  </span>
                </div>
              </CopyToClipboard>
            </div>

            <div className="profile-feature">
              {walletHasUpdated ? (
                <span>
                  {balanceAccount(selectedAccount)} {currency.ticker}
                </span>
              ) : (
                <div>
                  <SyncOutlined spin /> {currency.ticker}
                </div>
              )}

              <div onClick={() => handleClickProfile()}>
                <span>
                  <SendOutlined style={{ fontSize: '16px' }} />
                </span>
              </div>
            </div>
          </div>
        </>
      )}
      {otherAccounts.length > 0 && (
        <>
          <h3 style={{ marginTop: '1rem' }}>Switch Accounts</h3>
          {otherAccounts &&
            otherAccounts.map((acc, index) => {
              return (
                <div className="sub-account" key={index}>
                  <div className="sub-account-info">
                    <AvatarUser name={acc?.name || null} icon={acc?.avatar} isMarginRight={false} />
                    <span className="name">{acc?.name}</span>
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
        </>
      )}
    </AccountBox>
  );
  const contentMoreAction = (
    <PopoverStyled>
      <div className="social-menu">
        <h3>Social</h3>
        <ItemAccess
          icon={'/images/ico-message-heart-circle.svg'}
          text={'Messenger'}
          active={currentPathName === '/page-message'}
          direction="horizontal"
          key="support"
          onClickItem={() => {
            if (authorization.authorized) {
              handleIconClick('/page-message');
            } else {
              askAuthorization();
            }
          }}
        />
        <ItemAccess
          icon={'/images/ico-page.svg'}
          text={intl.get('general.page')}
          active={
            currentPathName.includes('/page') &&
            !currentAbsolutePathName.includes('page/clbm6r1v91486308n7w6za1qcu') &&
            !currentAbsolutePathName.includes('/page-message')
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
          onClickItem={() => {
            if (authorization.authorized) handleIconClick('/notifications');
            else {
              currentModal.length === 0 && askAuthorization();
            }
          }}
        />
        <ItemAccess
          icon={'/images/ico-support.png'}
          text={intl.get('general.support')}
          active={currentAbsolutePathName.includes('page/clbm6r1v91486308n7w6za1qcu')}
          direction="horizontal"
          key="support"
          onClickItem={() => handleIconClick('/page/clbm6r1v91486308n7w6za1qcu')}
        />
        <ItemAccess
          icon={'/images/ico-download.svg'}
          text={intl.get('general.installApp')}
          active={null}
          direction="horizontal"
          key="support"
          onClickItem={handleClickInstall}
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
          onClickItem={() => {
            if (authorization.authorized) handleIconClick('/wallet');
            else {
              currentModal.length === 0 && askAuthorization();
            }
          }}
        />
        <ItemAccess
          icon={'/images/ico-setting.svg'}
          text={intl.get('general.settings')}
          active={currentPathName === '/settings'}
          direction="horizontal"
          key="settings"
          onClickItem={() => {
            if (authorization.authorized) handleIconClick('/settings');
            else {
              currentModal.length === 0 && askAuthorization();
            }
          }}
        />
      </div>
    </PopoverStyled>
  );

  const handleClickProfile = () => {
    router.push('/send');
    setOpenProfileOption(false);
  };
  return (
    <>
      <StyledHeader style={{ boxShadow: '0 10px 30px rgb(0 0 0 / 5%)' }} className={`${className} header-component`}>
        <PathDirection>
          {currentPathName !== '/' && (
            <img className="navigate-back-btn" src="/images/ico-back-topbar.svg" alt="" onClick={handleNavigateBack} />
          )}
          {(currentPathName === '/' || currentPathName === '/page/[slug]') && (
            <img
              className="menu-mobile"
              style={{ marginLeft: currentPathName === '/page/[slug]' ? '0' : '10px' }}
              src="/images/ico-list-bullet_2.svg"
              alt=""
              onClick={handleMenuClick}
            />
          )}
          {(currentPathName == '/' || currentPathName == '/page-message') && (
            <picture>
              {isMobile ? (
                <>
                  <img
                    className={'logo-app'}
                    height={'64px'}
                    src={'/images/lixilotus-logo.svg'}
                    alt="lixilotus-logo"
                    onClick={() => handleIconClick('/')}
                  />
                  <img
                    className={'logo-app'}
                    height={'64px'}
                    src={'/images/lixilotus-text.svg'}
                    alt="lixilotus-logo"
                    onClick={() => handleIconClick('/')}
                  />
                </>
              ) : (
                <img
                  className={'logo-app-desktop logo-app'}
                  height={'64px'}
                  src={'/images/lixilotus-text.svg'}
                  alt="lixilotus-logo"
                  onClick={() => handleIconClick('/')}
                />
              )}
            </picture>
          )}
          {pathDirection[1] != '' && currentPathName != '/page-message' && (
            <>
              {handleImagePathDirection && (
                <StyledImagePathDirection
                  style={{ borderRadius: currentPathName === '/page/[slug]' ? 'var(--border-radius-primary)' : '50%' }}
                  src={handleImagePathDirection}
                  alt=""
                />
              )}
              <h3
                style={{
                  marginLeft: currentPathName === '/page/[slug]' || currentPathName === '/profile/[slug]' ? '8px' : '0'
                }}
                className="path-direction-text"
              >
                {handlePathDirection}
              </h3>
            </>
          )}
        </PathDirection>
        <div className="filter-bar">
          <SearchBox />
        </div>
        <SpaceStyled direction="horizontal" size={15}>
          <div className="action-bar-header">
            {!isMobile && (
              <ButtonTopbar
                onClick={() => handleIconClick('/')}
                className="btn-topbar"
                type="text"
                icon={<ReactSVG wrapper="span" className="anticon" src={'/images/ico-home-topbar.svg'} />}
              />
            )}
            <ButtonTopbar
              onClick={() => {
                if (authorization.authorized) {
                  handleIconClick('/page-message');
                } else {
                  askAuthorization();
                }
              }}
              className="btn-topbar home-btn"
              type="text"
              icon={<ReactSVG wrapper="span" className="anticon" src={'/images/ico-message-heart-circle-topbar.svg'} />}
            />
            <Popover
              overlayClassName={`${currentTheme === 'dark' ? 'popover-dark' : ''}`}
              arrow={false}
              content={contentFilterBurn}
              placement="bottom"
            >
              <ButtonTopbar
                className="btn-topbar filter-btn"
                type="text"
                icon={<ReactSVG wrapper="span" className="anticon" src={'/images/ico-filter.svg'} />}
              />
            </Popover>
            <Popover
              overlayClassName={`${currentTheme === 'dark' ? 'popover-dark' : ''} nofication-btn`}
              arrow={false}
              content={contentNotification}
              placement="bottom"
            >
              <BadgeStyled
                count={notifications.filter(item => _.isNil(item.readAt)).length > 0 ? 1 : null}
                overflowCount={9}
                offset={[notifications?.length < 10 ? 0 : 5, 8]}
                color="var(--color-primary)"
              >
                <ButtonTopbar
                  className="btn-topbar animate__animated animate__heartBeat"
                  type="text"
                  icon={<ReactSVG wrapper="span" className="anticon" src={'/images/ico-notification.svg'} />}
                />
              </BadgeStyled>
            </Popover>
            <Popover
              onOpenChange={visible => setOpenMoreOption(visible)}
              overlayClassName={`${currentTheme === 'dark' ? 'popover-dark' : ''} more-btn`}
              arrow={false}
              content={contentMoreAction}
              placement="bottom"
              open={openMoreOption}
            >
              <ButtonTopbar
                className="btn-topbar filter-btn"
                type="text"
                icon={<ReactSVG wrapper="span" className="anticon" src={'/images/ico-category.svg'} />}
              />
            </Popover>
          </div>
          <div className="account-bar">
            <Popover
              onOpenChange={visible => setOpenProfileOption(visible)}
              overlayClassName={`${currentTheme === 'dark' ? 'popover-dark' : ''} account-popover`}
              arrow={false}
              content={contentSelectAccount}
              placement="bottom"
              open={openProfileOption}
            >
              <div
                onClick={() => {
                  if (authorization.authorized) !isMobile && router.push(`/profile/${selectedAccount.address}`);
                  else askAuthorization();
                }}
              >
                <AvatarUser name={selectedAccount?.name || null} icon={accountInfoTemp?.avatar} isMarginRight={false} />
                <p className="account-info">
                  <span className="account-name">{selectedAccount?.name}</span>
                  {walletHasUpdated ? (
                    <span className="account-balance">
                      {balanceAccount(selectedAccount)} <span className="unit">{currency.ticker}</span>
                    </span>
                  ) : (
                    <span>
                      <SyncOutlined spin /> <span className="unit">{currency.ticker}</span>
                    </span>
                  )}
                </p>
              </div>
            </Popover>
          </div>
        </SpaceStyled>
      </StyledHeader>
    </>
  );
};

export default React.memo(Topbar);
