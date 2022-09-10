import { Layout, Space } from 'antd';
import { EditOutlined, PlusCircleOutlined, SendOutlined, WalletOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import React from 'react';
import Link from 'next/link';

const { Sider } = Layout;

const ItemAccess = ({ icon, text, href }: { icon: React.FC; text: string; href: string }) => (
  <Link href={href}>
    <a>
      <Space className="item-access">
        {React.createElement(icon)}
        <span className="text-item">{text}</span>
      </Space>
    </a>
  </Link>
);

const ShortcutSideBar = styled(Sider)`
  position: fixed !important;
  height: 100vh;
  left: 0;
  max-width: inherit !important;
  background: #fff;
  border: 1px solid #e0e0e0;
  padding: 2rem 1rem;
  box-shadow: rgb(0 0 0 / 4%) 0px 1px 2px, rgb(0 0 0 / 8%) 0px 2px 6px 2px;
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
      color: var(--color-primary);
    }
    .text-item {
      font-weight: 600;
    }
  }
  @media (max-width: 1000px) {
    display: none;
  }
  @media (min-width: 1001px) and (max-width: 1150px) {
    width: 200px !important;
  }
  @media (min-width: 1151px) and (max-width: 1300px) {
    width: 300px !important;
  }
  @media (min-width: 1301px) {
    width: 350px !important;
  }
`;

const SidebarShortcut = ({ heightHeader }) => {
  return (
    <ShortcutSideBar style={{ top: heightHeader }}>
      <h3>Quick Access</h3>
      <ItemAccess icon={SendOutlined} text={'Send Lotus'} key="send-lotus" href={'https://sendlotus.com'} />
      <ItemAccess icon={EditOutlined} text={'Register Pack'} key="register-pack" href={'/admin/pack-register'} />
      <ItemAccess icon={WalletOutlined} text={'Wallet'} key="wallet-lotus" href={'/wallet'} />
      <ItemAccess icon={SendOutlined} text={'Send'} key="send" href={'/send'} />
      <ItemAccess icon={PlusCircleOutlined} text={'Create Page'} key="create-page" href={'/page/create'} />
    </ShortcutSideBar>
  );
};
export default SidebarShortcut;
