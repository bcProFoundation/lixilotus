import { Layout, Spin } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getSelectedAccount } from 'src/store/account/selectors';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import styled, { DefaultTheme, ThemeProvider } from 'styled-components';

import { LeftOutlined, LoadingOutlined } from '@ant-design/icons';

import { navBarHeaderList } from '@components/Common/navBarHeaderList';
import intl from 'react-intl-universal';
import Sidebar from '@containers/Sidebar';
import SidebarRanking from '@containers/Sidebar/SideBarRanking';
import SidebarShortcut from '@containers/Sidebar/SideBarShortcut';
import Topbar from '@containers/Topbar';
import { loadLocale } from '@store/settings/actions';
import { getCurrentLocale, getIntlInitStatus } from '@store/settings/selectors';
import { Header } from 'antd/lib/layout/layout';
import { getIsGlobalLoading } from 'src/store/loading/selectors';
import { injectStore } from 'src/utils/axiosClient';
import ModalManager from '../../Common/ModalManager';
import { GlobalStyle } from './GlobalStyle';
import { theme } from './theme';
const { Content } = Layout;

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
  @media (max-width: 768px) {
    width: 100%;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
    padding: 0 16px;
    padding: ;
  }
  @media (max-width: 420px) {
    padding: 0 8px;
  }
  @media (min-width: 768px) {
    width: 100%;
    background: #fffbff;
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
  const [loading, setLoading] = useState(true);
  const [navBarTitle, setNavBarTitle] = useState('');
  const router = useRouter();
  const selectedKey = router.pathname ?? '';
  const disableSideBarRanking = ['lixi', 'profile'];
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
                        style={{
                          paddingRight: disableSideBarRanking.some(item => selectedKey.includes(item)) ? '2rem' : '0'
                        }}
                      >
                        <Topbar ref={setRef} />
                        {selectedKey !== '/' && (
                          <NavBarHeader>
                            <Link href="/" passHref>
                              <LeftOutlined onClick={() => router.back()} />
                            </Link>
                            <PathDirection>
                              <h2>{navBarTitle.length > 0 ? intl.get(navBarTitle) : ''}</h2>
                            </PathDirection>
                          </NavBarHeader>
                        )}
                        <Content className="content-layout">{children}</Content>
                      </Layout>
                      {!disableSideBarRanking.some(item => selectedKey.includes(item)) && (
                        <SidebarRanking></SidebarRanking>
                      )}
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

export default MainLayout;
