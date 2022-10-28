import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Layout, Spin } from 'antd';
import Link from 'next/link';
import styled, { DefaultTheme, ThemeProvider } from 'styled-components';

import { LeftOutlined, LoadingOutlined } from '@ant-design/icons';

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
import { navBarHeaderList } from '@bcpros/lixi-models/constants';

const { Content, Sider, Header } = Layout;

export const LoadingIcon = <LoadingOutlined className="loadingIcon" />;

const LixiApp = styled.div`
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
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

const NavBarHeader = styled(Header)`
  padding: 2rem 2rem 1rem 2rem;
  height: auto;
  line-height: initial;
  display: flex;
  align-items: center;
  border-radius: 20px;
  box-shadow: 0px 2px 10px rgb(0 0 0 / 5%);
  width: 100%;
  margin-bottom: 1rem;
  .anticon {
    font-size: 24px;
    color: var(--color-primary);
  }
  @media (max-width: 768px) {
    padding: 8px;
    width: 100%;
  }
`;

const PathDirection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 1rem;
  h2 {
    font-weight: 600;
    text-transform: capitalize;
    color: var(--color-primary);
  }
  .sub-title {
    text-transform: capitalize;
  }
`;

export const AppContainer = styled.div`
  position: relative;
  width: 500px;
  background-color: ${props => props.theme.footerBackground};
  min-height: 100vh;
  padding: 10px 30px 120px 30px;
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
    gap: 4rem;
  }
  .main-section-layout {
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
  const [navBarSubTitle, setNavBarSubTitle] = useState('');
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
    setNavBarTitle(itemSelect?.name || '');
    setNavBarSubTitle(itemSelect?.subTitle || '');
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
                          <NavBarHeader>
                            <Link href="/" passHref>
                              <LeftOutlined />
                            </Link>
                            <PathDirection>
                              <h2>{navBarTitle}</h2>
                              <p className="sub-title">{navBarSubTitle}</p>
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

export default PageDetailLayout;
