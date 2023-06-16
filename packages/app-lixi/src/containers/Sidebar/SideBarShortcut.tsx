import { Account, NotificationDto } from '@bcpros/lixi-models';
import { getAllAccounts, getSelectedAccount, getSelectedAccountId } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { Layout, message, Space, Modal, Popover, Button, Badge } from 'antd';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import axiosClient from '@utils/axiosClient';
import intl from 'react-intl-universal';
import { getAllNotifications } from '@store/notification/selectors';
import { fetchNotifications } from '@store/notification/actions';
import _ from 'lodash';
import { setGraphqlRequestLoading } from '@store/account/actions';
import { OrderDirection, PostOrderField } from '@generated/types.generated';
import { getFilterPostsHome, getNavCollapsed } from '@store/settings/selectors';
import { api as postApi } from '@store/post/posts.api';
import { useInfinitePostsQuery } from '@store/post/useInfinitePostsQuery';
import { push } from 'connected-next-router';

const { Sider } = Layout;

export const ItemAccess = ({
  icon,
  text,
  href,
  active,
  direction,
  onClickItem
}: {
  icon: string;
  text?: string;
  href?: string;
  active: boolean;
  direction?: string;
  onClickItem?: () => void;
}) => {
  return (
    <div className={active ? 'active-item-access' : ''} onClick={onClickItem}>
      <Space direction={direction === 'horizontal' ? 'horizontal' : 'vertical'} className={'item-access'}>
        <div className={classNames('icon-item')}>
          <img src={icon} />
        </div>
        {text && <span className="text-item">{text}</span>}
      </Space>
    </div>
  );
};

export const ItemAccessNotification = ({
  icon,
  text,
  href,
  active,
  direction,
  notifications,
  onClickItem
}: {
  icon: string;
  text: string;
  href?: string;
  active: boolean;
  direction?: string;
  notifications: NotificationDto[];
  onClickItem?: () => void;
}) => {
  return (
    <div className={active ? 'active-item-access' : ''} onClick={onClickItem}>
      <Space direction={direction === 'horizontal' ? 'horizontal' : 'vertical'} className={'item-access'}>
        <div className={classNames('icon-item')}>
          <Badge
            count={notifications.filter(item => _.isNil(item.readAt)).length}
            overflowCount={9}
            offset={[notifications?.length < 10 ? 0 : 5, 8]}
            color="var(--color-primary)"
          >
            <img src={icon} />
          </Badge>
        </div>
        <span className="text-item">{text}</span>
      </Space>
    </div>
  );
};

export const ItemAccessBarcode = ({
  icon,
  component,
  active
}: {
  icon: React.FC;
  component: JSX.Element;
  active: boolean;
}) => (
  <Link href="">
    <a>
      <Space direction="vertical" className={'item-access'}>
        <div className={classNames('icon-item', { 'active-item-access': active })}>{React.createElement(icon)}</div>
        <span className="text-item">{component}</span>
      </Space>
    </a>
  </Link>
);

export const ContainerAccess = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
  background: #fff;
  .item-access {
    cursor: pointer;
    gap: 8px !important;
    &:hover {
      .text-item {
        color: var(--color-primary);
      }
      .icon-item {
        img {
          filter: var(--filter-color-primary);
        }
      }
    }
    @media (max-height: 768px) {
      margin-bottom: 1rem;
    }
    @media (max-height: 610px) {
      margin-bottom: 0.5rem;
    }
    @media (max-height: 530px) {
      margin-bottom: 0.2rem;
    }
    .anticon {
      font-size: 25px;
      color: #12130f;
    }
    .icon-item {
      padding: 6px;
      img {
        filter: invert(24%) sepia(10%) saturate(603%) hue-rotate(266deg) brightness(95%) contrast(82%);
        width: 25px;
        height: 25px;
      }
      @media (max-height: 530px) {
        padding: 8px;
      }
    }
    .text-item {
      font-size: 13px;
      font-weight: 400;
      color: #4e444b;
      @media (max-height: 610px) {
        font-size: 12px;
      }
      @media (max-height: 530px) {
        font-size: 10px;
      }
    }
  }
  .wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #fff;
    .social-menu,
    .social-feature {
      width: 100%;
      text-align: left;
      padding: 1rem;

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
    }
  }
`;

const StyledLogo = styled.div`
  margin: 2rem 0;
  cursor: pointer;
  background: #fff;
  @media (max-height: 768px) {
    margin: 0.8rem 0;
  }
`;

const ShortcutSideBar = styled(Sider)`
  position: sticky !important;
  background: transparent !important;
  top: 0px;
  height: 100vh;
  flex: none !important;
  overflow: auto;
  background: var(--bg-color-light-theme);
  box-shadow: 0 0 30px rgb(80 181 255 / 5%);
  min-width: 220px !important;
  max-width: 220px !important;
  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: transparent;
  }
  &.show-scroll {
    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background-image: linear-gradient(180deg, #d0368a 0%, #708ad4 99%) !important;
      box-shadow: inset 2px 2px 5px 0 rgba(#fff, 0.5);
      border-radius: 100px;
    }
  }

  @media (max-width: 960px) {
    display: none;
  }

  &.minimize-short-cut {
    min-width: 70px !important;
    max-width: 70px !important;
    .text-item {
      display: none;
    }
    h3 {
      text-align: center;
    }
  }
`;

const UserControl = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 2rem;
  .img-bell {
    margin-bottom: 1rem;
  }
  @media (max-height: 610px) {
    margin-bottom: 8px;
    img {
      width: 20px;
      height: 20px;
    }
    .img-bell {
      margin-bottom: 8px;
    }
  }
`;

const SidebarShortcut = () => {
  const refSidebarShortcut = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const savedAccounts: Account[] = useAppSelector(getAllAccounts);
  const [isCollapse, setIsCollapse] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const navCollapsed = useAppSelector(getNavCollapsed);
  const router = useRouter();
  const currentPathName = router.pathname ?? '';
  const notifications = useAppSelector(getAllNotifications);
  const filterValue = useAppSelector(getFilterPostsHome);
  const selectedAccountId = useAppSelector(getSelectedAccountId);

  let pastScan;

  const onScan = async (result: string) => {
    if (pastScan !== result) {
      pastScan = result;

      await axiosClient
        .post('api/lixies/check-valid', { lixiBarcode: result })
        .then(res => {
          message.success(res.data);
        })
        .catch(err => {
          const { response } = err;
          message.error(response.data.message ? response.data.message : intl.get('lixi.unableGetLixi'));
        });
    }
  };

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

  const triggerSrollbar = e => {
    const sidebarShortcutNode = refSidebarShortcut.current;
    sidebarShortcutNode.classList.add('show-scroll');
    setTimeout(() => {
      sidebarShortcutNode.classList.remove('show-scroll');
    }, 700);
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

  const handleIconClick = (newPath?: string) => {
    if (currentPathName === '/' && newPath === '/') {
      dispatch(postApi.util.resetApiState());
      refetch();
      dispatch(setGraphqlRequestLoading());
    } else {
      dispatch(push(newPath));
    }
  };
  const classNameShortCut = () => {
    let className = '';
    if (!navCollapsed) {
      className = '';
    } else {
      className = 'minimize-short-cut';
    }
    return className;
  };

  return (
    <>
      <ShortcutSideBar
        className={classNameShortCut()}
        id="short-cut-sidebar"
        ref={refSidebarShortcut}
        onScroll={e => triggerSrollbar(e)}
      >
        <ContainerAccess>
          <div className="wrapper">
            {!navCollapsed && (
              <>
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
              </>
            )}
            {navCollapsed && (
              <>
                <div className="social-menu">
                  <h3>-</h3>
                  <ItemAccess
                    icon={'/images/ico-newfeeds.svg'}
                    active={currentPathName === '/' || currentPathName.includes('/post')}
                    direction="horizontal"
                    key="home"
                    onClickItem={() => handleIconClick('/')}
                  />
                  <ItemAccess
                    icon={'/images/ico-page.svg'}
                    active={currentPathName.includes('/page')}
                    direction="horizontal"
                    key="page-feed"
                    onClickItem={() => handleIconClick('/page/feed')}
                  />
                  <ItemAccess
                    icon={'/images/ico-notifications.svg'}
                    active={currentPathName === '/notifications'}
                    direction="horizontal"
                    key="notifications"
                    onClickItem={() => handleIconClick('/notifications')}
                  />
                </div>
                <div className="social-feature">
                  <h3>-</h3>
                  <ItemAccess
                    icon={'/images/ico-tokens.svg'}
                    active={currentPathName.includes('/token')}
                    direction="horizontal"
                    key="tokens-feed"
                    onClickItem={() => handleIconClick('/token/listing')}
                  />
                  <ItemAccess
                    icon={'/images/ico-account.svg'}
                    active={currentPathName === '/wallet'}
                    direction="horizontal"
                    key="wallet-lotus"
                    onClickItem={() => handleIconClick('/wallet')}
                  />
                  <ItemAccess
                    icon={'/images/ico-lixi.svg'}
                    active={currentPathName.includes('/lixi')}
                    direction="horizontal"
                    key="lixi"
                    onClickItem={() => handleIconClick('/lixi')}
                  />
                  <ItemAccess
                    icon={'/images/ico-setting.svg'}
                    active={currentPathName === '/settings'}
                    direction="horizontal"
                    key="settings"
                    onClickItem={() => handleIconClick('/settings')}
                  />
                </div>
              </>
            )}
          </div>
        </ContainerAccess>
      </ShortcutSideBar>
    </>
  );
};
export default SidebarShortcut;
