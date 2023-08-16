import { getGraphqlRequestStatus, getSelectedAccount, getSelectedAccountId } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { Button, ConfigProvider, Layout, Spin } from 'antd';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { DefaultTheme, ThemeProvider } from 'styled-components';
import { useGetAccountByAddressQuery } from '@store/account/accounts.api';
import { LoadingOutlined } from '@ant-design/icons';

import { Footer } from '@bcpros/lixi-components/components';
import { navBarHeaderList } from '@components/Common/navBarHeaderList';
import Sidebar from '@containers/Sidebar';
import DummySidebar from '@containers/Sidebar/DummySidebar';
import SidebarRanking from '@containers/Sidebar/SideBarRanking';
import SidebarShortcut from '@containers/Sidebar/SideBarShortcut';
import Topbar from '@containers/Topbar';
import { setAccountInfoTemp, setTransactionReady } from '@store/account/actions';
import { getIsGlobalLoading } from '@store/loading/selectors';
import { fetchNotifications } from '@store/notification/actions';
import { getAllNotifications } from '@store/notification/selectors';
import { loadLocale, setCurrentThemes } from '@store/settings/actions';
import { getCurrentLocale, getCurrentThemes, getIntlInitStatus, getIsSystemThemes } from '@store/settings/selectors';
import { getSlpBalancesAndUtxos } from '@store/wallet';
import { Header } from 'antd/lib/layout/layout';
import { injectStore } from 'src/utils/axiosClient';
import ModalManager from '../../Common/ModalManager';
import ActionSheet from '../../Common/ActionSheet';
import { GlobalStyle } from './GlobalStyle';
import { theme } from './theme';
import 'animate.css';
import useWindowDimensions from '@hooks/useWindowDimensions';
import useThemeDetector from '@local-hooks/useThemeDetector';
import { setShowCreatePost } from '@store/post/actions';
import ToastNotificationManage from '@components/Common/ToastNotificationManage';
import lightTheme from 'src/styles/themes/lightTheme';
import darkTheme from 'src/styles/themes/darkTheme';
import { useSocket } from '@context/index';
import { userSubcribeToAddressChannel, userSubcribeToMultiPageMessageSession } from '@store/message/actions';
import { getCurrentPageMessageSession } from '@store/page/selectors';

export const LoadingIcon = <LoadingOutlined className="loadingIcon" />;

const LixiApp = styled.div`
  text-align: center;
  background-color: ${props => props.theme.app.background};
`;

const AppBody = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  background-attachment: fixed;
  flex-direction: column;
`;

export const NavBarHeader = styled(Header)`
  cursor: pointer;
  background: transparent !important;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 1rem 0;
  background: transparent;
  border-bottom: 0.5px solid gray;
  margin-bottom: 10px;
  .anticon {
    font-size: 10px;
    color: rgba(30, 26, 29, 0.6);
  }
  .anticon-left {
    font-size: 18px;
  }
  @media (max-width: 960px) {
    width: 100%;
    padding: 8px;
  }
`;

export const PathDirection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 1rem;
  h2 {
    font-size: 24px;
    margin: 0;
    text-transform: capitalize;
    color: #1e1a1d;
  }
  .sub-title {
    text-transform: capitalize;
  }
`;

export const AppContainer = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  height: 100vh;
  overflow: hidden;
  background: ${props => props.theme.wallet.background};
  .ant-layout.ant-layout-has-sider {
    display: flex;
    justify-content: space-between;
  }
  .container-content {
    height: 100vh;
    scroll-behavior: smooth;
    overflow-y: auto;
    flex-grow: 1;
    display: flex;
    flex-direction: row;
    gap: 1rem;
    justify-content: flex-start;
    @media (max-width: 960px) {
      height: auto;
      margin-left: 0 !important;
      padding: 0 8px;
      -ms-overflow-style: none; // Internet Explorer 10+
      scrollbar-width: none; // Firefox
      ::-webkit-scrollbar {
        display: none; // Safari and Chrome
      }
    }

    @media (min-width: 960px) {
      ::-webkit-scrollbar {
        -webkit-appearance: none;
        width: 7px;
      }

      ::-webkit-scrollbar-thumb {
        border-radius: 4px;
        background-color: rgba(0, 0, 0, 0.5);
        box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
      }
    }

    .content-child {
      width: 100%;
      margin: 0 auto;
      height: fit-content;
      margin-bottom: 4rem;
      @media (max-width: 968px) {
        margin-bottom: 0;
        height: 100vh;
      }
    }
  }
  .ant-drawer {
    .ant-drawer-body {
      -ms-overflow-style: none; // Internet Explorer 10+
      scrollbar-width: none; // Firefox
      ::-webkit-scrollbar {
        display: none; // Safari and Chrome
      }
    }
    @media (min-width: 960px) {
      position: inherit;
    }
  }
  .sidebar-mobile {
    .ant-drawer-body {
      padding: 0 !important;
      .wrapper {
        padding: 0.5rem;
      }
    }
  }
  @media (max-width: 960px) {
    height: auto;
    min-height: auto;
  }
`;

export const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start !important;
  width: 100%;
  padding: 10px 0 15px;
  justify-content: space-between;
  border-bottom: 1px solid ${props => props.theme.wallet.borders.color};

  a {
    color: ${props => props.theme.wallet.text.secondary};

    :hover {
      color: ${props => props.theme.primary};
    }
  }

  @media (max-width: 960px) {
    a {
      font-size: 12px;
    }
    padding: 1rem 0 1rem;
  }
`;

export const LotusLogo = styled.img`
  width: 70px;
  @media (max-width: 960px) {
    width: 50px;
  }
`;

export const LixiTextLogo = styled.img`
  width: 250px;
  margin-left: 40px;
  @media (max-width: 960px) {
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
  const [loading, setLoading] = useState(true);
  const [navBarTitle, setNavBarTitle] = useState('');
  const router = useRouter();
  const selectedKey = router.pathname ?? '';
  const disableSideBarRanking = ['lixi', 'profile'];
  const ref = useRef(null);
  const notifications = useAppSelector(getAllNotifications);
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const slpBalancesAndUtxosRef = useRef(slpBalancesAndUtxos);
  const scrollRef = useRef(null);
  const graphqlRequestLoading = useAppSelector(getGraphqlRequestStatus);
  const currentTheme = useAppSelector(getCurrentThemes);
  const [isMobile, setIsMobile] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const { width } = useWindowDimensions();
  const currentDeviceTheme = useThemeDetector();
  const isSystemThemes = useAppSelector(getIsSystemThemes);
  const currentPageMessageSession = useAppSelector(getCurrentPageMessageSession);

  let userInfo;
  const { currentData: currentDataGetAccount, isSuccess: isSuccessGetAccount } = useGetAccountByAddressQuery(
    {
      address: selectedAccount?.address
    },
    { skip: !selectedAccount?.address }
  );

  if (isSuccessGetAccount) userInfo = currentDataGetAccount?.getAccountByAddress;
  dispatch(setAccountInfoTemp(userInfo));

  useEffect(() => {
    if (isSystemThemes) {
      dispatch(setCurrentThemes(currentDeviceTheme ? 'dark' : 'light'));
    }
  }, [currentDeviceTheme, currentTheme]);

  useEffect(() => {
    const isMobile = width < 960 ? true : false;
    setIsMobile(isMobile);
  }, [width]);

  useEffect(() => {
    if (slpBalancesAndUtxos === slpBalancesAndUtxosRef.current) return;
    dispatch(setTransactionReady());
  }, [slpBalancesAndUtxos.nonSlpUtxos]);

  const setRef = useCallback(node => {
    if (node && node.clientHeight) {
      // Check if a node is actually passed. Otherwise node would be null.
      const height = node.clientHeight;
      setHeight(height);
    }
    // Save a reference to the node
    ref.current = node;
  }, []);

  useEffect(() => {
    if (graphqlRequestLoading) {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }
  }, [graphqlRequestLoading]);

  injectStore(currentLocale);
  const isLoading = useAppSelector(getIsGlobalLoading);

  const getNamePathDirection = () => {
    const itemSelect = navBarHeaderList.find(item => item.path === selectedKey) || null;
    setNavBarTitle(itemSelect?.name || '');
  };

  useEffect(() => {
    getNamePathDirection();
  }, [selectedKey]);

  useEffect(() => {
    dispatch(loadLocale(currentLocale));
  }, [currentLocale]);

  useEffect(() => {
    setLoading(false);
  }, [selectedAccount]);

  const handleScroll = e => {
    if (isMobile) {
      const currentScrollPos = e?.currentTarget?.scrollTop;
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 20);
      dispatch(setShowCreatePost(visible));
      setPrevScrollPos(currentScrollPos);
    }
  };

  const hideStatusBar = useMemo(() => {
    let isHide = false;
    if (selectedKey === '/page-message' && currentPageMessageSession) {
      isHide = true;
    }
    return isHide;
  }, [selectedKey, currentPageMessageSession]);

  return (
    <ConfigProvider theme={currentTheme === 'dark' ? darkTheme : lightTheme}>
      <ThemeProvider theme={theme as DefaultTheme}>
        <GlobalStyle />
        {intlInitDone && (
          <Spin spinning={loading} indicator={LoadingIcon}>
            <LixiApp className={currentTheme === 'dark' ? 'dark' : ''}>
              <Layout>
                <AppBody>
                  <ModalManager />
                  <AppContainer className="app-container">
                    <Sidebar className="sidebar-mobile" />
                    {/* Need to reimplement top bar */}
                    {/* <Topbar ref={ref}/> */}
                    <Topbar
                      className={`animate__animated ${
                        isMobile ? (visible ? 'animate__fadeInDown' : 'animate__fadeOutUp') : ''
                      } ${hideStatusBar ? 'hide-header' : ''}`}
                    />
                    {/* @ts-ignore */}
                    <div
                      className="container-content"
                      style={{ padding: selectedKey === '/page-message' ? '0' : '' }}
                      id="scrollableDiv"
                      ref={scrollRef}
                      onScroll={e => handleScroll(e)}
                    >
                      <SidebarShortcut />
                      <div
                        className="content-child animate__animated animate__fadeIn"
                        style={{ paddingTop: isMobile && !hideStatusBar ? 64 : 0 }}
                      >
                        {children}
                      </div>
                      {/* This below is just a dummy sidebar */}
                      {/* TODO: Implement SidebarRanking in future */}
                      {(selectedKey === '/wallet' || selectedKey === '/') && <SidebarRanking></SidebarRanking>}
                      <DummySidebar />
                      <Footer
                        classList={`animate__animated ${visible ? 'animate__fadeInUp' : 'animate__fadeOutDown'} ${
                          hideStatusBar ? 'hide-footer' : ''
                        }`}
                        notifications={notifications}
                      />
                    </div>
                  </AppContainer>
                  <ActionSheet />
                  <ToastNotificationManage />
                </AppBody>
              </Layout>
            </LixiApp>
          </Spin>
        )}
      </ThemeProvider>
    </ConfigProvider>
  );
};

export default MainLayout;
