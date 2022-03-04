import { Layout, Spin } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { getSelectedAccount } from 'src/store/account/selectors';
import { useAppSelector } from 'src/store/hooks';
import styled, { DefaultTheme, ThemeProvider } from 'styled-components';

import {
  GiftOutlined, LoadingOutlined, SettingOutlined, UserOutlined, WalletOutlined
} from '@ant-design/icons';
import { Footer, NavButton } from '@bcpros/lixi-components/components';

import ModalManager from '../../Common/ModalManager';
import OnboardingComponent from '../../Onboarding/Onboarding';
import { GlobalStyle } from './GlobalStyle';
import { theme } from './theme';
import Sidebar from '@containers/Sidebar';
import Topbar from '@containers/Topbar';

const { Content, Sider, Header } = Layout;

export const LoadingIcon = <LoadingOutlined className="loadingIcon" />;

const LixiApp = styled.div`
  text-align: center;
  font-family: 'Gilroy', sans-serif;
  background-color: ${props => props.theme.app.background};
`;

const AppBody = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  background-image: ${props => props.theme.app.gradient};
  background-attachment: fixed;
`;

export const AppContainer = styled.div`
  position: relative;
  width: 500px;
  background-color: ${props => props.theme.footerBackground};
  min-height: 100vh;
  padding: 10px 30px 120px 30px;
  overflow: hidden;
  background: ${props => props.theme.wallet.background};
  -webkit-box-shadow: 0px 0px 24px 1px ${props => props.theme.wallet.shadow};
  -moz-box-shadow: 0px 0px 24px 1px ${props => props.theme.wallet.shadow};
  box-shadow: 0px 0px 24px 1px ${props => props.theme.wallet.shadow};
  @media (max-width: 768px) {
    width: 100%;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
    box-shadow: none;
  }
`;

export const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start !important;
  width: 100%;
  padding: 10px 0 15px;
  margin-bottom: 20px;
  justify-content: space-between;
  border-bottom: 1px solid ${props => props.theme.wallet.borders.color};

  a {
    color: ${props => props.theme.wallet.text.secondary};

    :hover {
      color: ${props => props.theme.primary};
    }
  }

  @media (max-width: 768px) {
    a {
      font-size: 12px;
    }
    padding: 20px 0 20px;
  }
`;

export const LotusLogo = styled.img`
  width: 70px;
  @media (max-width: 768px) {
    width: 50px;
  }
`;

export const LixiTextLogo = styled.img`
  width: 250px;
  margin-left: 40px;
  @media (max-width: 768px) {
    width: 190px;
    margin-left: 20px;
  }
`;

const MainLayout: React.FC = (props) => {
  const { children } = props;
  const selectedAccount = useAppSelector(getSelectedAccount);
  const router = useRouter()
  const [loading, setLoading] = useState(false);
  const selectedKey = router.pathname ?? '';

  return (
    <ThemeProvider theme={theme as DefaultTheme}>
      <GlobalStyle />
      <Spin
        spinning={
          loading
        }
        indicator={LoadingIcon}
      >
        <LixiApp>
          <Layout>
            <AppBody>
              <ModalManager />
              {!selectedAccount
                ? <OnboardingComponent></OnboardingComponent>
                : <>
                  <AppContainer>
                    <Layout>
                      <Sidebar />
                      <Layout>
                        <Topbar />
                        <Content>
                          {children}
                        </Content>
                      </Layout>
                    </Layout>
                  </AppContainer>
                  <Footer>
                    <Link href='/' passHref>
                      <NavButton
                        active={selectedKey === '/'}
                      >
                        <UserOutlined />
                        Accounts
                      </NavButton>
                    </Link>
                    <Link href='/vault' passHref>
                      <NavButton
                        active={selectedKey === '/vault'}
                      >
                        <WalletOutlined />
                        Vault
                      </NavButton>
                    </Link>
                    <Link href='/redeem' passHref>
                      <NavButton
                        active={selectedKey === '/redeem'}
                      >
                        <GiftOutlined />
                        Redeem
                      </NavButton>
                    </Link>
                    <Link href='/settings' passHref>
                      <NavButton
                        active={selectedKey === '/settings'}
                      >
                        <SettingOutlined />
                        Settings
                      </NavButton>
                    </Link>
                  </Footer>
                </>
              }
            </AppBody>
          </Layout>
        </LixiApp>
      </Spin>
    </ThemeProvider>
  );
}

export default MainLayout;
