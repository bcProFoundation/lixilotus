import React, { useState } from 'react';
import {
  Route,
  Redirect,
  Switch,
  useLocation,
  useHistory,
} from 'react-router-dom';
import { Spin } from 'antd';
import { AppContext } from '@utils/context';
import styled, { ThemeProvider } from 'styled-components';
import { theme, GlobalStyle } from '@abcpros/givegift-components/styles';
import LogoLotusPink from '@assets/images/lotus-pink-logo.png';
import {
  LoadingOutlined
} from '@ant-design/icons';
// import { LoadingIcon } from '@abcpros/givegift-components/atoms/CustomIcons/CustomIcons';

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


function App(): JSX.Element {

  const ContextValue = React.useContext(AppContext);
  const location = useLocation();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
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
                <LotusLogo src={LogoLotusPink} alt="givelotus" />
              </HeaderContainer>
            </AppContainer>
          </AppBody>
        </GiveGiftApp>
      </Spin>
    </ThemeProvider>
  );
}

export default App;
