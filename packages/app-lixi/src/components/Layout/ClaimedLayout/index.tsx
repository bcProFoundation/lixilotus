import { Layout, Spin } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { DefaultTheme, ThemeProvider } from 'styled-components';

import { LeftOutlined, LoadingOutlined } from '@ant-design/icons';

import { navBarHeaderList } from '@components/Common/navBarHeaderList';
import Sidebar from '@containers/Sidebar';
import SidebarShortcut from '@containers/Sidebar/SideBarShortcut';
import Topbar from '@containers/Topbar';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { loadLocale } from '@store/settings/actions';
import { getCurrentLocale, getIntlInitStatus } from '@store/settings/selectors';
import { useRouter } from 'next/router';
import intl from 'react-intl-universal';
import { injectStore } from 'src/utils/axiosClient';
import ModalManager from '../../Common/ModalManager';
import { NavBarHeader, PathDirection } from '../MainLayout';
import { GlobalStyle } from '../MainLayout/GlobalStyle';
import { theme } from '../MainLayout/theme';

const { Content, Sider, Header } = Layout;

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
`;

export const AppContainer = styled.div`
  position: relative;
  width: 100%;
  background-color: ${props => props.theme.footerBackground};
  min-height: 100vh;
  height: 100vh;
  overflow: hidden;
  background: ${props => props.theme.wallet.background};
  @media (max-width: 420px) {
    padding: 0 8px;
  }
  @media (max-width: 768px) {
    width: 100%;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
    box-shadow: none;
    padding: 0 16px;
  }
  @media (min-width: 768px) {
    width: 100%;
    background: #fffbff;
    padding: 0;
    .content-layout {
      // margin-top: 80px;
      z-index: 1;
    }
  }
  .ant-layout.ant-layout-has-sider {
    gap: 2rem;
    justify-content: center;
  }
  .main-section-layout {
    max-width: 680px;
    @media (max-width: 768px) {
      padding-right: 0 !important;
    }
  }
`;

type ClaimedLayoutProps = React.PropsWithChildren<{}>;

const ClaimedLayout: React.FC = (props: ClaimedLayoutProps) => {
  const { children } = props;
  const claimId = children[0][''];
  const [loading, setLoading] = useState(false);
  const currentLocale = useAppSelector(getCurrentLocale);
  const intlInitDone = useAppSelector(getIntlInitStatus);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [height, setHeight] = useState(0);
  const selectedKey = router.pathname ?? '';
  const [navBarTitle, setNavBarTitle] = useState('');
  const ref = useRef(null);
  const setRef = useCallback(node => {
    if (node && node.clientHeight) {
      // Check if a node is actually passed. Otherwise node would be null.
      const height = node.clientHeight;
      setHeight(height);
    }
    // Save a reference to the node
    ref.current = node;
  }, []);

  injectStore(currentLocale);

  useEffect(() => {
    dispatch(loadLocale(currentLocale));
  }, [currentLocale]);

  const getNamePathDirection = () => {
    const itemSelect = navBarHeaderList.find(item => selectedKey.includes(item.path)) || null;
  };

  useEffect(() => {
    getNamePathDirection();
  }, [selectedKey]);

  return (
    <ThemeProvider theme={theme as DefaultTheme}>
      <GlobalStyle />
      {intlInitDone && (
        <Spin spinning={loading} indicator={LoadingIcon}>
          <LixiApp>
            <Layout>
              <AppBody>
                <ModalManager />
                <>
                  <AppContainer>
                    <Layout>
                      <SidebarShortcut></SidebarShortcut>
                      <Sidebar />
                      <Layout className="main-section-layout" style={{ paddingRight: '2rem' }}>
                        <Topbar ref={setRef} />
                        {selectedKey !== '/' && (
                          <NavBarHeader onClick={() => router.back()}>
                            <LeftOutlined />
                            <PathDirection>
                              <h2>{navBarTitle.length > 0 ? intl.get(navBarTitle) : ''}</h2>
                            </PathDirection>
                          </NavBarHeader>
                        )}
                        <Content className="content-layout">{children}</Content>
                      </Layout>
                    </Layout>
                  </AppContainer>
                </>
              </AppBody>
            </Layout>
          </LixiApp>
        </Spin>
      )}
    </ThemeProvider>
  );
};

export default ClaimedLayout;
