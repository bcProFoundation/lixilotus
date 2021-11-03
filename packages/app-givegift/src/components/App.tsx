import React, { useState } from 'react';
import {
  Route,
  Redirect,
  Switch,
  useLocation,
  useHistory,
} from 'react-router-dom';
import 'antd/dist/antd.less';
import '../index.css';
import './App.less';
import { Spin } from 'antd';
import Icon from '@ant-design/icons';
import styled, { ThemeProvider } from 'styled-components';
import { theme, GlobalStyle } from '@abcpros/givegift-components/styles';
import LogoLixi from '@assets/images/lixi_logo.svg';
import LixiText from '@assets/images/lixi_text.png';
import {
  LoadingOutlined,
  HomeOutlined,
  GiftOutlined,
  WalletOutlined,
  UserOutlined
} from '@ant-design/icons';
import { ReactComponent as VaultOutlineSvg } from '@assets/icons/VaultOutline.svg';
// import { LoadingIcon } from '@abcpros/givegift-components/atoms/CustomIcons/CustomIcons';
import Home from '@components/Home/Home';
import RedeemComponent from '@components/Redeem';
import Profile from '@components/Profile/Profile';
import { Footer, NavButton } from '@abcpros/givegift-components/components';
import Vault from '@components/Vault';

type ThemeType = typeof theme;

export const LoadingIcon = <LoadingOutlined className="loadingIcon" />;

const GiveGiftApp = styled.div`
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
    padding: 10px 0 20px;
  }
`;

export const LotusLogo = styled.img`
  width: 50px;
  @media (max-width: 768px) {
    width: 50px;
  }
`;

export const LixiTextLogo = styled.img`
width: 200px;
  @media (max-width: 768px) {
    width: 150px;
  }
`;


function App(): JSX.Element {

  const location = useLocation();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [loadingUtxosAfterSend, setLoadingUtxosAfterSend] = useState(false);
  const selectedKey = location && location.pathname ? location.pathname.substr(1) : '';
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Spin
        spinning={
          loading
        }
        indicator={LoadingIcon}
      >
        <GiveGiftApp>
          <AppBody>
            <AppContainer>
              <HeaderContainer>
                <LotusLogo src={LogoLixi} alt="lixi" />
                <LixiTextLogo src={LixiText} alt="lixi" />
              </HeaderContainer>
              <Switch>
                <>
                  <Route path="/home">
                    <Home />
                  </Route>
                  <Route path="/Vault">
                    <Vault />
                  </Route>
                  <Route path="/redeem">
                    <RedeemComponent />
                  </Route>
                  <Route path="/profile">
                    <Profile />
                  </Route>
                </>
              </Switch>
            </AppContainer>
            <Footer>
              <NavButton
                active={selectedKey === 'home'}
                onClick={() => history.push('/home')}
              >
                <HomeOutlined />
                Home
              </NavButton>

              <NavButton
                active={selectedKey === 'vault'}
                onClick={() => history.push('/vault')}
              >
                <Icon component={VaultOutlineSvg} />
                Vault
              </NavButton>

              <NavButton
                active={selectedKey === 'redeem'}
                onClick={() => history.push('/redeem')}
              >
                <WalletOutlined />
                Redeem
              </NavButton>
              <NavButton
                active={selectedKey === 'profile'}
                onClick={() => history.push('/profile')}
              >
                <UserOutlined />
                Profile
              </NavButton>
            </Footer>
          </AppBody>
        </GiveGiftApp>
      </Spin>
    </ThemeProvider>
  );
}
export type { ThemeType };

export default App;
