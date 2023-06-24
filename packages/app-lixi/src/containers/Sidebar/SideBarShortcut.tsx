import { Account, NotificationDto } from '@bcpros/lixi-models';
import { getAllAccounts, getSelectedAccount, getSelectedAccountId } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { Layout, message, Space, Modal, Popover, Button, Badge, Avatar } from 'antd';
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
import { transformShortName } from '@components/Common/AvatarUser';
import { stripHtml } from 'string-strip-html';
import moment from 'moment';
import { currency } from '@components/Common/Ticker';
import { toggleCollapsedSideNav } from '@store/settings/actions';

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
    .social-digest {
      padding: 0 0.5rem;
      width: 100%;
      text-align: left;
      padding-bottom: 5rem;
      h3 {
        padding: 1rem 0;
        margin: 0;
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
  min-width: 250px !important;
  max-width: 250px !important;
  // &::-webkit-scrollbar {
  //   width: 5px;
  // }
  // &::-webkit-scrollbar-thumb {
  //   background: transparent;
  // }
  // &.show-scroll {
  //   &::-webkit-scrollbar {
  //     width: 5px;
  //   }
  //   &::-webkit-scrollbar-thumb {
  //     background-image: linear-gradient(180deg, #d0368a 0%, #708ad4 99%) !important;
  //     box-shadow: inset 2px 2px 5px 0 rgba(#fff, 0.5);
  //     border-radius: 100px;
  //   }
  // }

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

const SpaceShorcutItem = styled(Space)`
  width: 100%;
  gap: 8px !important;
  padding: 8px;
  border: 1px solid var(--border-color-base);
  cursor: pointer;
  margin-bottom: 0.5rem;
  &:hover {
    background: var(--border-color-base);
    .page-name {
      color: var(--color-primary);
    }
  }
  .ant-space-item {
    &:last-child {
      flex: 1;
    }
  }
  .avatar-account {
    border: 1px solid #fbf1fb;
    border-radius: 50%;
    width: fit-content;
    .ant-avatar {
      display: flex;
      align-items: center;
      font-size: 14px !important;
      width: 46px;
      height: 46px;
    }
    img {
      object-fit: cover;
      border-radius: 50%;
      width: 46px;
      height: 46px;
    }
  }
  .content-account {
    display: flex;
    .info-account {
      flex: 1;
      p {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        line-clamp: 1;
        -webkit-line-clamp: 1;
        box-orient: vertical;
        -webkit-box-orient: vertical;
        margin: 0;
        text-align: left;
        line-height: 16px;
      }
      .page-name {
        font-size: 14px;
        font-weight: 500;
      }
      .account-name {
        font-size: 12px;
      }
      .content {
        font-size: 11px;
        color: gray;
      }
    }
    .time-score {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-end;
      gap: 8px;
      p {
        margin: 0;
        color: gray;
        &.create-date {
          font-size: 10px;
        }
        &.lotus-burn-score {
          font-size: 10px;
          color: #fff;
        }
      }
      .content-score {
        padding: 2px 4px;
        background: #bfbfbf;
        border-radius: 12px;
      }
    }
  }
  &.collapse {
    img {
      width: 30px;
      height: 30px;
    }
    .ant-avatar {
      width: 30px;
      height: 30px;
    }
  }
`;

const transformCreatedAt = date => {
  let dateFormated = '';
  const today = new Date();
  if (moment(date).isSame(today, 'day')) {
    dateFormated = moment(date).format('HH:SS');
  } else if (moment(date).isSame(today, 'week')) {
    dateFormated = moment(date).format('ddd');
  } else {
    dateFormated = moment(date).format('DD/MM');
  }
  return dateFormated;
};

export const ShortCutItem = ({
  item,
  classStyle,
  isCollapse,
  onClickIcon
}: {
  item?: any;
  classStyle?: string;
  isCollapse?: boolean;
  onClickIcon?: (e: any) => void;
}) => (
  <SpaceShorcutItem
    className={isCollapse ? 'collapse card' : 'card'}
    onClick={() => onClickIcon(item?.page?.id || item?.token?.tokenId || item?.postAccount?.address)}
    size={5}
  >
    <div className="avatar-account">
      {item?.page && <img src={item?.page?.avatar || '/images/default-avatar.jpg'} />}
      {item?.token && <img src={`${currency.tokenIconsUrl}/64/${item?.token?.tokenId}.png`} />}
      {!item?.page && !item?.token && <Avatar>{transformShortName(item?.postAccount?.name)}</Avatar>}
    </div>
    {!isCollapse && (
      <>
        <div className="content-account">
          <div className="info-account">
            {item?.page?.name && <p className="page-name">{item?.page?.name}</p>}
            {item?.token?.name && <p className="page-name">{item?.token?.name}</p>}
            <p className={!item?.page?.name && !item?.token?.name ? 'page-name' : 'account-name'}>
              {item?.postAccount?.name}
            </p>
            <p className="content">
              {item?.content.includes('twitter') ? 'Via Twitter' : stripHtml(item?.content).result}
            </p>
          </div>
          <div className="time-score">
            <p className="create-date">{transformCreatedAt(item?.createdAt)}</p>
            <div className="content-score">
              <p className="lotus-burn-score">{item?.lotusBurnScore}</p>
            </div>
          </div>
        </div>
      </>
    )}
  </SpaceShorcutItem>
);

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
  const [notificationsSelected, setNotificationsSelected] = useState([]);
  const notifications = useAppSelector(getAllNotifications);
  const filterValue = useAppSelector(getFilterPostsHome);
  const selectedAccountId = useAppSelector(getSelectedAccountId);
  const [filterGroup, setFilterGroup] = useState([]);

  let pastScan;

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext } = useInfinitePostsQuery(
    {
      first: 30,
      minBurnFilter: filterValue,
      accountId: selectedAccountId ?? null,
      orderBy: [
        {
          direction: OrderDirection.Desc,
          field: PostOrderField.UpdatedAt
        }
      ]
    },
    false
  );

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

  useEffect(() => {
    const newArrFilter = _.uniqBy(data, item => {
      return item?.page?.id || item?.token?.tokenId || item?.postAccount.address;
    });
    setFilterGroup([...newArrFilter]);
  }, [data]);

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
      orderBy: [
        {
          direction: OrderDirection.Desc,
          field: PostOrderField.UpdatedAt
        }
      ]
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

  const handleMenuClick = e => {
    dispatch(toggleCollapsedSideNav(!navCollapsed));
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

  const pathShortcutItem = (item, path) => {
    let fullPath = '';
    if (item?.page) {
      return (fullPath = `/page/${path}`);
    }
    if (item?.token) {
      return (fullPath = `/token/${path}`);
    }
    if (item?.postAccount) {
      return (fullPath = `/profile/${path}`);
    }
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
                <div className="social-digest">
                  <h3>Digest</h3>
                  {filterGroup.map(item => {
                    return <ShortCutItem item={item} onClickIcon={path => router.push(pathShortcutItem(item, path))} />;
                  })}
                </div>
              </>
            )}
            {navCollapsed && (
              <>
                <h3 style={{ marginBottom: '0' }} onClick={handleMenuClick}>
                  <img width={22} height={22} src="/images/ico-hambuger.svg" alt="" />
                </h3>
                <div className="social-feature" style={{ padding: navCollapsed ? '0.5rem' : '1rem' }}>
                  {filterGroup.map(item => {
                    return (
                      <ShortCutItem
                        item={item}
                        isCollapse={navCollapsed}
                        onClickIcon={path => router.push(pathShortcutItem(item, path))}
                      />
                    );
                  })}
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
