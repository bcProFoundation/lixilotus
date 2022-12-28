import { Layout, Spin } from 'antd';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getSelectedAccount } from 'src/store/account/selectors';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import styled, { DefaultTheme, ThemeProvider } from 'styled-components';

import { LoadingOutlined } from '@ant-design/icons';

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
import { Footer } from '@bcpros/lixi-components/components';
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

export const NavBarHeader = styled(Header)`
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
  @media (max-width: 960px) {
    padding: 8px;
    width: 100%;
  }
`;

export const PathDirection = styled.div`
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
  width: 100%;
  min-height: 100vh;
  height: 100vh;
  overflow: hidden;
  background: ${props => props.theme.wallet.background};
  @media (max-width: 960px) {
    width: 100%;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
    padding: 0 16px;
  }
  @media (max-width: 420px) {
    padding: 0 8px;
  }
  .ant-layout.ant-layout-has-sider {
    display: grid;
    grid-template-columns: 15% 85%;
    @media (max-width: 960px) {
      grid-template-columns: 100%;
    }
    @media (min-width: 960px) and (max-width: 1050px) {
      grid-template-columns: 23% 77%;
    }
    @media (min-width: 1050px) and (max-width: 1400px) {
      grid-template-columns: 20% 78%;
    }
    @media (min-width: 1400px) and (max-width: 1500px) {
      grid-template-columns: 20% 80%;
    }
  }
  .main-section-layout {
    max-width: 820px;
    min-width: 420px;
    width: auto;
    height: 100vh;
    overflow-y: auto;
    @media (max-width: 960px) {
      max-width: 100% !important;
    }
    @media (max-width: 420px) {
      min-width: fit-content;
      -ms-overflow-style: none;
      scrollbar-width: none;
      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
  .container-content {
    display: flex;
    flex-direction: row;
    gap: 2rem;
    justify-content: center;
    @media (max-width: 960px) {
      margin-left: 0 !important;
    }
    @media (max-width: 1400px) {
      margin-left: 2rem;
    }
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
                      <div className="container-content">
                        <Layout
                          className="main-section-layout"
                          style={{
                            paddingRight: disableSideBarRanking.some(item => selectedKey.includes(item)) ? '2rem' : '0',
                            maxWidth: disableSideBarRanking.some(item => selectedKey.includes(item)) ? '98%' : ''
                          }}
                        >
                          <Topbar ref={setRef} />
                          <Content className="content-layout">{children}</Content>
                        </Layout>
                        {!disableSideBarRanking.some(item => selectedKey.includes(item)) && (
                          <SidebarRanking></SidebarRanking>
                        )}
                      </div>
                    </Layout>
                  </AppContainer>
                  <Footer />
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
