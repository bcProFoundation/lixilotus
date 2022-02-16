import 'antd/dist/antd.less';

import { Spin } from 'antd';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
// import { Route, Switch, useHistory, useLocation } from 'react-router-dom';
import { getSelectedAccount } from 'src/store/account/selectors';
import { useAppSelector } from 'src/store/hooks';
import styled, { DefaultTheme, ThemeProvider } from 'styled-components';

import {
  GiftOutlined, HomeOutlined, LoadingOutlined, SettingOutlined, UserOutlined, WalletOutlined
} from '@ant-design/icons';
import LixiLogo from '@assets/images/lixi_logo.svg';
import LixiText from '@assets/images/lixi_logo_text.svg';
import { Footer, NavButton } from '@bcpros/lixi-components/components';
import { GlobalStyle } from './GlobalStyle';
import { theme } from './theme';
import Home from '@components/Home/Home';
import RedeemComponent from '@components/Redeem';
import LixiRedeemed from '@components/Redeem/LixiRedeemed';
import Settings from '@components/Settings';
import Vault from '@components/Vault';

import ModalManager from '../../Common/ModalManager';
import OnboardingComponent from '../../Onboarding/Onboarding';
import Image from 'next/image';

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

  const selectedAccount = false;
  // const selectedAccount = useAppSelector(getSelectedAccount);
  const router = useRouter()
  const [loading, setLoading] = useState(false);
  const selectedKey = router.pathname ?? '';

  console.log('LixiLogo', LixiLogo);
  console.log('LixiText', LixiText);
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
          <AppBody>
            <ModalManager />
            {!selectedAccount
              ? <OnboardingComponent></OnboardingComponent>
              : <>
                <AppContainer>
                  <HeaderContainer>
                    <img src={LixiLogo} alt="lixi" />
                    <img src={LixiText} alt="lixi" />
                  </HeaderContainer>
                  {children}
                </AppContainer>
                <Footer>
                  <NavButton
                    active={selectedKey === 'home' || selectedKey === ''}
                    onClick={() => router.push('/')}
                  >
                    <UserOutlined />
                    Accounts
                  </NavButton>

                  <NavButton
                    active={selectedKey === 'vault'}
                    onClick={() => router.push('/vault')}
                  >
                    <WalletOutlined />
                    Vault
                  </NavButton>

                  <NavButton
                    active={selectedKey === 'redeem'}
                    onClick={() => router.push('/redeem')}
                  >
                    <GiftOutlined />
                    Redeem
                  </NavButton>

                  <NavButton
                    active={selectedKey === 'settings'}
                    onClick={() => router.push('/settings')}
                  >
                    <SettingOutlined />
                    Settings
                  </NavButton>
                </Footer>
              </>
            }
          </AppBody>
        </LixiApp>

      </Spin>
    </ThemeProvider>
  );
}

export default MainLayout;