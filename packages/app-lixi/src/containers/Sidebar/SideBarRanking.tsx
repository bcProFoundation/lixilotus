import { Badge, Layout } from 'antd';
import styled from 'styled-components';
import InfoCardUser from '@components/Common/InfoCardUser';
import { SmartButton } from '@components/Common/PrimaryButton';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getSelectedAccount } from '@store/account/selectors';
import { BellTwoTone } from '@ant-design/icons';
import { getAllNotifications } from '@store/notification/selectors';
import { fetchNotifications } from '@store/notification/actions';
import Link from 'next/link';
import NotificationPopup, { StyledPopover } from '@components/NotificationPopup';
import intl from 'react-intl-universal';
import { useRouter } from 'next/router';

const { Sider } = Layout;

const RankingSideBar = styled(Sider)`
  height: 50vh;
  right: 2rem;
  max-width: inherit !important;
  background: var(--bg-color-light-theme);
  border-radius: 20px;
  padding-bottom: 2rem;
  position: relative;
  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }
  @media (max-width: 768px) {
    display: none;
  }
  @media (min-width: 1001px) {
    flex: none;
    min-width: 290px !important;
    width: 290px !important;
  }
  @media (min-width: 1366px) {
    flex: none;
    min-width: 312px !important;
    width: 312px !important;
  }

  .login-session {
    background: #fff;
    width: 100%;
    padding: 2rem 2rem 1rem 2rem;
    border-radius: 20px;
    box-shadow: 0px 2px 10px rgb(0 0 0 / 5%);
    margin-bottom: 2rem;
    &::before {
      top: 35px;
      left: 0;
      width: 8px;
      height: 40px;
      content: '';
      position: absolute;
      background: #7342cc;
      border-radius: 0px 10px 10px 0px;
    }
    button {
      margin-top: 1rem;
      padding: 5px;
      font-size: 14px;
    }
  }

  .right-bar {
    width: 100%;
    .menu {
      display: flex;
      .menu-item {
        margin-right: 1rem;
        padding: 5px;
        img {
          width: 24px;
        }
        &.active-item {
          background-color: rgb(255, 210, 77);
          border-radius: 8px;
        }
      }
    }
    .content {
      margin-top: 2rem;
      > div {
        background: #fff;
        padding: 20px;
        margin-bottom: 8px;
        border-radius: 20px;
        box-shadow: 0px 2px 10px rgb(0 0 0 / 5%);
        display: flex;
        justify-content: space-between;
        img {
          width: 24px;
        }
      }
      h3 {
        font-size: 18px;
        text-align: left;
        font-weight: 600;
      }
    }
  }
`;

export const Logged = styled.div`
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .account-logged {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    background: var(--bg-color-light-theme);
    border-radius: 20px;
    img {
      width: 20px;
      margin-right: 8px;
    }
  }
  .address-logged {
    padding: 0.5rem 1rem;
    background: var(--bg-color-light-theme);
    border-radius: 20px;
  }
`;

const StyledBell = styled(BellTwoTone)`
  font-size: 25px;
  position: relative;
  top: 7px;
  cursor: pointer;
`;

const StyledBadge = styled(Badge)`
  position: absolute;
  top: 2rem;
  right: 2rem;
`;

const SidebarRanking = () => {
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const notifications = useAppSelector(getAllNotifications);
  const router = useRouter();

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

  return (
    <RankingSideBar>
      <div className="login-session">
        <InfoCardUser imgUrl={null} name={'Anonymous'} title={'@anonymous'}></InfoCardUser>
        {!selectedAccount && (
          <Link href="/admin/register-account" passHref>
            <SmartButton>Sign in to connect wallet</SmartButton>
          </Link>
        )}
        {selectedAccount && (
          <Logged>
            <div className="account-logged">
              <img src="/images/xpi.svg" alt="" />
              <span>{selectedAccount?.name || ''}</span>
            </div>
            <div className="address-logged">
              {selectedAccount?.address.slice(6, 11) + '...' + selectedAccount?.address.slice(-5)}
            </div>
          </Logged>
        )}
        {selectedAccount && (
          <StyledPopover
            content={NotificationPopup(notifications, selectedAccount)}
            placement="bottomRight"
            getPopupContainer={trigger => trigger}
            trigger={notifications.length != 0 && router.pathname !== '/notifications' ? 'click' : ''}
            title={intl.get('general.notification')}
          >
            <StyledBadge
              count={notifications.length}
              overflowCount={9}
              offset={[notifications.length < 10 ? 0 : 5, 25]}
              color="var(--color-primary)"
            >
              <StyledBell twoToneColor="#6f2dbd" />
            </StyledBadge>
          </StyledPopover>
        )}
      </div>
      <div className="right-bar">
        <div className="menu">
          <div className="menu-item active-item">
            <img src="/images/trend-ico.svg" alt="" />
          </div>
          <div className="menu-item">
            <img src="/images/x-ico.svg" alt="" />
          </div>
          <div className="menu-item">
            <img src="/images/tag-ico.svg" alt="" />
          </div>
        </div>
        <div className="content">
          <h3>Trending Experience</h3>
          <div>
            <InfoCardUser imgUrl={null} name={'Nguyen Tanh'} title={'@ericson'}></InfoCardUser>
            <img src="/images/three-dot-ico.svg" alt="" />
          </div>
          <div>
            <InfoCardUser imgUrl={null} name={'Binh Vo'} title={'@kensaurús'}></InfoCardUser>
            <img src="/images/three-dot-ico.svg" alt="" />
          </div>
          <div>
            <InfoCardUser imgUrl={null} name={'Tan Vu'} title={'@talkyorn'}></InfoCardUser>
            <img src="/images/three-dot-ico.svg" alt="" />
          </div>
          <div>
            <InfoCardUser imgUrl={null} name={'Viet Tran'} title={'@vince8x'}></InfoCardUser>
            <img src="/images/three-dot-ico.svg" alt="" />
          </div>
          <div>
            <InfoCardUser imgUrl={null} name={'Nghia Cao'} title={'@nghiacc'}></InfoCardUser>
            <img src="/images/three-dot-ico.svg" alt="" />
          </div>
        </div>
      </div>
    </RankingSideBar>
  );
};

export default SidebarRanking;
