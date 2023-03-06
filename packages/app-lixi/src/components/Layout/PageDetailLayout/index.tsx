import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Layout, Spin } from 'antd';
import styled, { DefaultTheme, ThemeProvider } from 'styled-components';

import { LoadingOutlined } from '@ant-design/icons';

import ModalManager from '../../Common/ModalManager';
import { GlobalStyle } from '../MainLayout/GlobalStyle';
import { theme } from '../MainLayout/theme';
import Sidebar from '@containers/Sidebar';
import Topbar from '@containers/Topbar';
import { loadLocale } from '@store/settings/actions';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getCurrentLocale, getIntlInitStatus } from '@store/settings/selectors';
import { injectStore } from 'src/utils/axiosClient';
import SidebarShortcut from '@containers/Sidebar/SideBarShortcut';
import { useRouter } from 'next/router';
import { navBarHeaderList } from '@components/Common/navBarHeaderList';
import { Footer } from '@bcpros/lixi-components/components';
import { getAllNotifications } from '@store/notification/selectors';

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
  height: 100vh;
  overflow: hidden;
  background: ${props => props.theme.wallet.background};
  @media (max-width: 960px) {
    padding: 0 4px;
  }
  .ant-layout.ant-layout-has-sider {
    gap: 2rem;
    justify-content: center;
  }
  .main-section-layout {
    max-width: 680px;
    height: 100vh;
    overflow-y: auto;
    @media (max-width: 768px) {
      padding-right: 0 !important;
    }
  }
`;

type PageDetailsLayoutProps = React.PropsWithChildren<{}>;

const PageDetailLayout: React.FC = (props: PageDetailsLayoutProps) => {
  const { children } = props;
  const [loading, setLoading] = useState(false);
  const currentLocale = useAppSelector(getCurrentLocale);
  const intlInitDone = useAppSelector(getIntlInitStatus);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [height, setHeight] = useState(0);
  const selectedKey = router.pathname ?? '';
  const [navBarTitle, setNavBarTitle] = useState('');
  const ref = useRef(null);
  const notifications = useAppSelector(getAllNotifications);

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
    setNavBarTitle(itemSelect?.name || '');
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
                      <Layout
                        className="main-section-layout"
                        style={{ paddingRight: '2rem', maxWidth: '100%', marginTop: '8px' }}
                      >
                        <Topbar ref={setRef} />
                        div
                        {/* @ts-ignore */}
                        <Content className="content-layout">{children}</Content>
                      </Layout>
                    </Layout>
                  </AppContainer>
                  <Footer notifications={notifications} />
                </>
              </AppBody>
            </Layout>
          </LixiApp>
        </Spin>
      )}
    </ThemeProvider>
  );
};

export default PageDetailLayout;
