import {
  DownOutlined,
  EditOutlined,
  GiftOutlined,
  HomeOutlined,
  PlusCircleOutlined,
  RightOutlined,
  SendOutlined,
  SettingOutlined,
  ShopOutlined,
  WalletOutlined,
  BarcodeOutlined
} from '@ant-design/icons';
import BalanceHeader from '@bcpros/lixi-components/components/Common/BalanceHeader';
import { currency } from '@bcpros/lixi-components/components/Common/Ticker';
import { Account } from '@bcpros/lixi-models';
import ScanBarcode from '@bcpros/lixi-components/components/Common/ScanBarcode';
import { getAllAccounts, getSelectedAccount } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { openModal } from '@store/modal/actions';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { Button, Layout, message, Space } from 'antd';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Logged } from './SideBarRanking';
import axiosClient from '@utils/axiosClient';
import intl from 'react-intl-universal';
import { CreateLixiFormModal } from '@components/Lixi/CreateLixiFormModal';

const { Sider } = Layout;

export const ItemAccess = ({
  icon,
  text,
  href,
  active,
  onClickItem
}: {
  icon: React.FC;
  text: string;
  href?: string;
  active: boolean;
  onClickItem?: () => void;
}) => (
  <Link onClick={onClickItem} href={href}>
    <a>
      <Space className={'item-access'}>
        <div className={classNames('icon-item', { 'active-item-access': active })}>{React.createElement(icon)}</div>
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
      <Space className={'item-access'}>
        <div className={classNames('icon-item', { 'active-item-access': active })}>{React.createElement(icon)}</div>
        <span className="text-item">{component}</span>
      </Space>
    </a>
  </Link>
);

export const CointainerAccess = styled.div`
  background: #fff;
  box-shadow: 0px 2px 10px rgb(0 0 0 / 5%);
  border-radius: 20px;
  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    h3 {
      align-self: center;
      font-weight: 600;
    }
  }
  .item-access {
    margin: 8px 0;
    cursor: pointer;
    .anticon {
      font-size: 25px;
      color: #12130f;
    }
    .icon-item {
      margin-right: 1rem;
      padding: 6px;
      &.active-item-access {
        background: #ffd24d;
        border-radius: 8px;
      }
    }
    .text-item {
      font-size: 16px;
      font-weight: 600;
      color: #12130f;
    }
  }
  .wrapper {
    padding: 0 2rem 2rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    @media (min-width: 768px) and (max-width: 1000px) {
      padding: 0 1rem 1rem 1rem !important;
    }
  }
`;

const StyledLogo = styled.div`
  ::before {
    left: 0;
    top: 46px;
    width: 10px;
    height: 60px;
    content: '';
    position: absolute;
    background: #7342cc;
    border-radius: 0px 10px 10px 0px;
  }
  margin: 3rem 1rem 3rem 0;
`;

const CointainerWallet = styled.div`
  margin-top: 20px;
  border-radius: 20px;
  border: none;
  background: #fff;
  padding: 2rem;
  box-shadow: 0px 2px 10px rgb(0 0 0 / 5%);
  text-align: left;
  .header-box-wallet {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    h3 {
      margin: 0;
      font-weight: 600;
    }
    .anticon {
      color: var(--color-primary);
      font-size: 17px;
    }
  }
`;

const ShortcutSideBar = styled(Sider)`
  height: 60vh;
  left: 2rem;
  max-width: inherit !important;
  background: var(--bg-color-light-theme);

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
`;

const StyledLogged = styled(Logged)`
  .account-logged {
    padding: 0;
    span {
      font-size: 16px;
      text-transform: uppercase;
      font-weight: 500;
    }
    img {
      width: 34px;
    }
  }
  .balance {
    > div {
      font-size: 16px;
      font-weight: 500;
      span {
        color: var(--color-primary);
      }
    }
  }
`;

const SidebarShortcut = () => {
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const savedAccounts: Account[] = useAppSelector(getAllAccounts);
  const [isCollapse, setIsCollapse] = useState(false);
  const router = useRouter();
  const selectedKey = router.pathname ?? '';
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

  return (
    <ShortcutSideBar>
      <CointainerAccess>
        <div className="wrapper">
          <StyledLogo>
            <img width="120px" src="/images/lixilotus-logo.svg" alt="lixilotus" />
          </StyledLogo>
          <ItemAccess icon={HomeOutlined} text={'Home'} active={selectedKey === '/'} key="home" href={'/'} />
          <ItemAccess
            icon={ShopOutlined}
            text={'Page'}
            active={selectedKey.includes('/page')}
            key="page-feed"
            href={'/page/feed'}
          />
          <ItemAccess
            icon={WalletOutlined}
            text={'Accounts'}
            active={selectedKey === '/wallet'}
            key="wallet-lotus"
            href={'/wallet'}
          />
          <ItemAccess icon={GiftOutlined} text={'Lixi'} active={selectedKey === '/lixi'} key="lixi" href={'/lixi'} />
          <ItemAccess
            icon={SettingOutlined}
            text={'Settings'}
            active={selectedKey === '/settings'}
            key="settings"
            href={'/settings'}
          />
          <ItemAccess
            icon={SendOutlined}
            text={'Send Lotus'}
            active={false}
            key="send-lotus"
            href={'https://sendlotus.com'}
          />
          <ItemAccess
            icon={ShopOutlined}
            text={'Lotusia Shop'}
            active={false}
            key="lotusia-shop"
            href={'https://lotusia.shop/'}
          />
          <ItemAccessBarcode
            icon={BarcodeOutlined}
            key="scan-barcode"
            active={false}
            component={<ScanBarcode loadWithCameraOpen={false} onScan={onScan} id={Date.now().toString()} />}
          />
        </div>
      </CointainerAccess>
      <CointainerWallet>
        <div className="header-box-wallet">
          <h3>Wallet</h3>
          {!isCollapse && <RightOutlined onClick={() => setIsCollapse(!isCollapse)} />}
          {isCollapse && <DownOutlined onClick={() => setIsCollapse(!isCollapse)} />}
        </div>
        {!selectedAccount && <div className="content-box-wallet">Please Login to access this feature</div>}
        {savedAccounts &&
          savedAccounts.map(
            acc =>
              isCollapse && (
                <StyledLogged>
                  <div className="account-logged">
                    <img src="/images/xpi.svg" alt="" />
                    <span>{acc?.name || ''}</span>
                  </div>
                  <div className="balance">
                    <BalanceHeader balance={fromSmallestDenomination(acc?.balance ?? 0)} ticker={currency.ticker} />
                  </div>
                </StyledLogged>
              )
          )}
      </CointainerWallet>
    </ShortcutSideBar>
  );
};
export default SidebarShortcut;
