import { Account } from '@bcpros/lixi-models';
import { getAllAccounts, getSelectedAccount } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { Layout, message, Space, Modal, Popover, Button, Badge } from 'antd';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Logged } from './SideBarRanking';
import axiosClient from '@utils/axiosClient';
import intl from 'react-intl-universal';
import { getAllNotifications } from '@store/notification/selectors';
import NotificationPopup from '@components/NotificationPopup';
import { fetchNotifications } from '@store/notification/actions';
import { AvatarUser } from '@components/Common/AvatarUser';

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
  text: string;
  href?: string;
  active: boolean;
  direction?: string;
  onClickItem?: () => void;
}) => (
  <Link onClick={onClickItem} href={href}>
    <a>
      <Space direction={direction === 'horizontal' ? 'horizontal' : 'vertical'} className={'item-access'}>
        <div className={classNames('icon-item', { 'active-item-access': active })}>
          <img src={icon} />
        </div>
        <span className="text-item">{text}</span>
      </Space>
    </a>
  </Link>
);

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
  background: linear-gradient(0deg, rgba(158, 42, 156, 0.08), rgba(158, 42, 156, 0.08)), #fffbff;
  border-right: 1px solid #f4e3f4;
  .item-access {
    margin-bottom: 2rem;
    cursor: pointer;
    gap: 0 !important;
    .anticon {
      font-size: 25px;
      color: #12130f;
    }
    .icon-item {
      padding: 6px;
      &.active-item-access {
        max-width: 50px;
        margin: auto;
        background: #ffd24d;
        border-radius: 8px;
      }
    }
    .text-item {
      font-size: 14px;
      font-weight: 400;
      letter-spacing: 0.5px;
      color: #4e444b;
    }
  }
  .wrapper {
    // position: absolute;
    padding: 0;
    // top: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: linear-gradient(0deg, rgba(158, 42, 156, 0.08), rgba(158, 42, 156, 0.08)), #fffbff;
    @media (min-width: 768px) and (max-width: 1000px) {
      padding: 0 1rem 1rem 1rem !important;
    }
  }
`;

const StyledLogo = styled.div`
  margin: 2rem 0;
  cursor: pointer;
  background: linear-gradient(0deg, rgba(158, 42, 156, 0.08), rgba(158, 42, 156, 0.08)), #fffbff;
`;

const ShortcutSideBar = styled(Sider)`
  position: sticky;
  top: 0px;
  height: 100vh;
  flex: none !important;
  overflow: auto;
  background: var(--bg-color-light-theme);
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
  @media (min-width: 960px) and (max-width: 1400px) {
    min-width: 220px !important;
    max-width: 220px !important;
  }
  @media (min-width: 1400px) {
    min-width: 250px !important;
    max-width: 250px !important;
  }
`;

const UserControl = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 2rem;
`;

const SidebarShortcut = () => {
  const refSidebarShortcut = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const savedAccounts: Account[] = useAppSelector(getAllAccounts);
  const [isCollapse, setIsCollapse] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const router = useRouter();
  const currentPathName = router.pathname ?? '';
  const notifications = useAppSelector(getAllNotifications);
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

  const content = (
    <div className="popover-content-more">
      <ItemAccess
        icon={'images/ico-lixi.svg'}
        text={intl.get('general.lixi')}
        active={currentPathName === '/lixi'}
        key="lixi"
        href={'/lixi'}
      />
      <ItemAccess
        icon={'images/ico-setting.svg'}
        text={intl.get('general.settings')}
        active={currentPathName === '/settings'}
        key="settings"
        href={'/settings'}
      />
    </div>
  );

  return (
    <>
      <ShortcutSideBar id="short-cut-sidebar" ref={refSidebarShortcut} onScroll={e => triggerSrollbar(e)}>
        <ContainerAccess>
          <div className="wrapper">
            <StyledLogo>
              <Link href="/" passHref>
                <img width="137px" height="56px" src="/images/lixilotus-logo.svg" alt="lixilotus" />
              </Link>
            </StyledLogo>
            <ItemAccess
              icon={'/images/ico-home.svg'}
              text={intl.get('general.home')}
              active={currentPathName === '/' || currentPathName.includes('/post')}
              key="home"
              href={'/'}
            />
            <ItemAccess
              icon={'/images/ico-page.svg'}
              text={intl.get('general.page')}
              active={currentPathName.includes('/page')}
              key="page-feed"
              href={'/page/feed'}
            />
            <ItemAccess
              icon={'/images/ico-tokens.svg'}
              text={intl.get('general.tokens')}
              active={currentPathName.includes('/token')}
              key="tokens-feed"
              href={'/token/listing'}
            />
            <ItemAccess
              icon={'/images/ico-account.svg'}
              text={intl.get('general.accounts')}
              active={currentPathName === '/wallet'}
              key="wallet-lotus"
              href={'/wallet'}
            />
            <ItemAccess
              icon={'/images/ico-lixi.svg'}
              text={intl.get('general.lixi')}
              active={currentPathName.includes('/lixi')}
              key="lixi"
              href={'/lixi'}
            />
            <ItemAccess
              icon={'/images/ico-setting.svg'}
              text={intl.get('general.settings')}
              active={currentPathName === '/settings'}
              key="settings"
              href={'/settings'}
            />
            {/* TODO: show more shortcut  */}
            {/* {showMore && (
              <>
                <ItemAccess
                  icon={'images/ico-lixi.svg'}
                  text={intl.get('general.lixi')}
                  active={selectedKey === '/lixi'}
                  key="lixi"
                  href={'/lixi'}
                />
                <ItemAccess
                  icon={'images/ico-setting.svg'}
                  text={intl.get('general.settings')}
                  active={selectedKey === '/settings'}
                  key="settings"
                  href={'/settings'}
                />
              </>
            )}
            {!showMore && (
              <>
                <Popover overlayClassName="popover-more" placement="top" title={null} content={content} trigger="click">
                  <Button type="text">
                    <ItemAccess
                      icon={'images/ico-more.svg'}
                      text={intl.get('general.more')}
                      active={selectedKey === '/more'}
                      key="more"
                      href={'/settings'}
                    />
                  </Button>
                </Popover>
              </>
            )} */}
          </div>
          <UserControl>
            <Badge
              count={notifications.length}
              overflowCount={9}
              offset={[notifications.length < 10 ? 0 : 5, 8]}
              color="var(--color-primary)"
            >
              <img
                style={{ marginBottom: '2rem' }}
                src="/images/ico-notifications.svg"
                alt="ico-notifications"
                onClick={() => router.push('/notifications')}
              />
            </Badge>
            <div style={{ cursor: 'pointer' }} onClick={() => router.push(`/profile/${selectedAccount?.address}`)}>
              <AvatarUser name={selectedAccount?.name} isMarginRight={false} />
            </div>
          </UserControl>
        </ContainerAccess>
      </ShortcutSideBar>
    </>
  );
};
export default SidebarShortcut;
