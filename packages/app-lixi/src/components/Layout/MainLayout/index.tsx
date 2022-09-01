import { Layout, Spin } from 'antd';
import intl from 'react-intl-universal';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { Ref, useEffect, useRef, useState } from 'react';
import { getSelectedAccount } from 'src/store/account/selectors';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import styled, { DefaultTheme, ThemeProvider } from 'styled-components';

import {
  GiftOutlined,
  HomeOutlined,
  LoadingOutlined,
  SettingOutlined,
  UserOutlined,
  WalletOutlined
} from '@ant-design/icons';
import { Footer, NavButton } from '@bcpros/lixi-components/components';

import ModalManager from '../../Common/ModalManager';
import OnboardingComponent from '../../Onboarding/Onboarding';
import { GlobalStyle } from './GlobalStyle';
import { theme } from './theme';
import Sidebar from '@containers/Sidebar';
import Topbar from '@containers/Topbar';
import { getCurrentLocale, getIntlInitStatus } from '@store/settings/selectors';
import { loadLocale } from '@store/settings/actions';
import { getIsGlobalLoading } from 'src/store/loading/selectors';
import { injectStore } from 'src/utils/axiosClient';
import SidebarRanking from '@containers/Sidebar/SideBarRanking';
import SidebarShortcut from '@containers/Sidebar/SideBarShortcut';

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
  @media (min-width: 768px) {
    width: 100%;
    background: #fffbff;
    padding: 0;
    .content-layout {
      margin-top: 80px;
      z-index: 1;
    }
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

type MainLayoutProps = React.PropsWithChildren<{}>;

const MainLayout: React.FC = (props: MainLayoutProps) => {
  const { children } = props;
  const selectedAccount = useAppSelector(getSelectedAccount);
  const currentLocale = useAppSelector(getCurrentLocale);
  const intlInitDone = useAppSelector(getIntlInitStatus);
  const dispatch = useAppDispatch();
  const [height, setHeight] = useState(0);
  const refa = useRef(null);
  const ref = React.createRef();

  injectStore(currentLocale);
  const isLoading = useAppSelector(getIsGlobalLoading);

  useEffect(() => {
    dispatch(loadLocale(currentLocale));
  }, [currentLocale]);

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const selectedKey = router.pathname ?? '';

  useEffect(() => {
    setLoading(false);
  }, [selectedAccount]);

  useEffect(() => {
    console.log('******* REF', ref);
    // if (ref && ref?.current) {
    //   // setHeight(ref?.current);
    //   console.log('**********' + height);
    // }
  }, [ref]);

  return (
    <ThemeProvider theme={theme as DefaultTheme}>
      <GlobalStyle />
      {intlInitDone && (
        <Spin spinning={loading} indicator={LoadingIcon}>
          <LixiApp>
            <Layout>
              <AppBody>
                <ModalManager />
                {!selectedAccount ? (
                  <OnboardingComponent></OnboardingComponent>
                ) : (
                  <>
                    <AppContainer>
                      <Layout>
                        <SidebarShortcut></SidebarShortcut>
                        <Sidebar />
                        <Layout>
                          <Topbar ref={ref} />
                          <Content className="content-layout">{children}</Content>
                        </Layout>
                        <SidebarRanking></SidebarRanking>
                      </Layout>
                    </AppContainer>
                    <Footer>
                      <Link href="/" passHref>
                        <NavButton active={selectedKey === '/'}>
                          <HomeOutlined />
                          {intl.get('general.home')}
                        </NavButton>
                      </Link>
                      <Link href="/admin/accounts" passHref>
                        <NavButton active={selectedKey === '/admin/accounts'}>
                          <UserOutlined />
                          {intl.get('general.accounts')}
                        </NavButton>
                      </Link>
                      <Link href="/admin/lixi" passHref>
                        <NavButton active={selectedKey === '/admin/lixi'}>
                          <WalletOutlined />
                          {intl.get('general.lixi')}
                        </NavButton>
                      </Link>
                      <Link href="/admin/claim" passHref>
                        <NavButton active={selectedKey === '/admin/claim'}>
                          <GiftOutlined />
                          {intl.get('general.claim')}
                        </NavButton>
                      </Link>
                      <Link href="/admin/settings" passHref>
                        <NavButton active={selectedKey === '/admin/settings'}>
                          <SettingOutlined />
                          {intl.get('general.settings')}
                        </NavButton>
                      </Link>
                    </Footer>
                  </>
                )}
              </AppBody>
            </Layout>
          </LixiApp>
        </Spin>
      )}
    </ThemeProvider>
  );
};

export default MainLayout;
