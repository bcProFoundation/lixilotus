import React from 'react';
import {
  Route,
  Redirect,
  Switch,
  useLocation,
  useHistory,
} from 'react-router-dom';
import { Spin } from 'antd';

import logo from '@assets/images/logo.svg';
import { AppContext } from '@utils/context';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { theme } from '@assets/styles/theme';

const GlobalStyle = createGlobalStyle`
  .ant-modal-wrap > div > div.ant-modal-content > div > div > div.ant-modal-confirm-btns > button, .ant-modal > button, .ant-modal-confirm-btns > button, .ant-modal-footer > button {
    border-radius: 8px;
    background-color: ${props => props.theme.modals.buttons.background};
    color: ${props => props.theme.wallet.text.secondary};
    font-weight: bold;
  }    

  .ant-modal-wrap > div > div.ant-modal-content > div > div > div.ant-modal-confirm-btns > button:hover,.ant-modal-confirm-btns > button:hover, .ant-modal-footer > button:hover {
    color: ${props => props.theme.primary};
    transition: color 0.3s;
    background-color: ${props => props.theme.modals.buttons.background};
  }   
  .selectedCurrencyOption {
    text-align: left;
    color: ${props => props.theme.wallet.text.secondary} !important;
    background-color: ${props => props.theme.contrast} !important;
  }
  .cashLoadingIcon {
    color: ${props => props.theme.primary} !important
    font-size: 48px !important;
  }
  .selectedCurrencyOption:hover {
    color: ${props => props.theme.contrast} !important;
    background-color: ${props => props.theme.primary} !important;
  }
  #addrSwitch {
    .ant-switch-checked {
        background-color: white !important;
    }
  }
  #addrSwitch.ant-switch-checked {
    background-image: ${props =>
    props.theme.buttons.primary.backgroundImage} !important;
  }
`;

function App(): JSX.Element {

  const ContextValue = React.useContext(AppContext);
  const { loading } = ContextValue;
  const location = useLocation();
  const history = useHistory();
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
    </ThemeProvider>
  );
}

export default App;
