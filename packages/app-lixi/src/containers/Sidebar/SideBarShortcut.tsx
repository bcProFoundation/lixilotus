import { Layout, Space } from 'antd';
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
  WalletOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import React, { useState } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import { useAppSelector } from '@store/hooks';
import { getAllAccounts, getSelectedAccount } from '@store/account/selectors';
import { Logged } from './SideBarRanking';
import { fromSmallestDenomination } from '@utils/cashMethods';
import BalanceHeader from '@bcpros/lixi-components/components/Common/BalanceHeader';
import { currency } from '@bcpros/lixi-components/components/Common/Ticker';
import { useRouter } from 'next/router';
import { Account } from '@bcpros/lixi-models';

const { Sider } = Layout;

export const ItemAccess = ({
  icon,
  text,
  href,
  active
}: {
  icon: React.FC;
  text: string;
  href: string;
  active: boolean;
}) => (
  <Link href={href}>
    <a>
      <Space className={'item-access'}>
        <div className={classNames('icon-item', { 'active-item-access': active })}>{React.createElement(icon)}</div>
        <span className="text-item">{text}</span>
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
  left: 20px;
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
  const selectedAccount = useAppSelector(getSelectedAccount);
  const savedAccounts: Account[] = useAppSelector(getAllAccounts);
  const [isCollapse, setIsCollapse] = useState(false);
  const router = useRouter();
  const selectedKey = router.pathname ?? '';

  return (
    <ShortcutSideBar>
      <CointainerAccess>
        <div className="wrapper">
          <StyledLogo>
            <img width="120px" src="/images/lixilotus-logo.svg" alt="lixilotus" />
          </StyledLogo>
          <ItemAccess icon={HomeOutlined} text={'Home'} active={selectedKey === '/'} key="send-lotus" href={'/'} />
          <ItemAccess
            icon={WalletOutlined}
            text={'Accounts'}
            active={selectedKey === '/wallet'}
            key="wallet-lotus"
            href={'/wallet'}
          />
          <ItemAccess
            icon={GiftOutlined}
            text={'Lixi'}
            active={selectedKey === '/admin/lixi'}
            key="send"
            href={'/admin/lixi'}
          />
          <ItemAccess icon={SendOutlined} text={'Send'} active={selectedKey === '/send'} key="send" href={'/send'} />
          <ItemAccess
            icon={EditOutlined}
            text={'Register Pack'}
            active={selectedKey === '/admin/pack-register'}
            key="register-pack"
            href={'/admin/pack-register'}
          />
          <ItemAccess
            icon={PlusCircleOutlined}
            text={'Create Page'}
            active={selectedKey === '/page/create'}
            key="create-page"
            href={'/page/create'}
          />
          <ItemAccess
            icon={SettingOutlined}
            text={'Setting'}
            active={selectedKey === '/admin/settings'}
            key="setting"
            href={'/admin/settings'}
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
            key="send-lotus"
            href={'https://lotusia.shop/'}
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
