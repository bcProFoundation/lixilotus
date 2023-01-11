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
import { getAllNotifications } from '@store/notification/selectors';
import { fetchNotifications } from '@store/notification/actions';
const { Content } = Layout;

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

export const NavBarHeader = styled(Header)`
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 1rem 0;
  border-radius: 20px;
  background: transparent;
  .anticon {
    font-size: 18px;
    color: rgba(30, 26, 29, 0.6);
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
  @media (max-width: 960px) {
    width: 100%;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
    padding: 0 4px;
  }
  .ant-layout.ant-layout-has-sider {
    display: flex;
    justify-content: space-between;
  }
  .main-section-layout {
    max-width: 820px;
    min-width: 420px;
    width: auto;
    height: 100vh;
    overflow-y: auto;
    @media (max-width: 960px) {
      max-width: 100%;
      min-width: 100%;
      width: 300px;
    }
    @media (max-width: 420px) {
      -ms-overflow-style: none;
      scrollbar-width: none;
      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
  .container-content {
    flex-grow: 1;
    display: flex;
    flex-direction: row;
    gap: 2rem;
    justify-content: center;
    margin-left: 2rem;
    @media (max-width: 960px) {
      margin-left: 0 !important;
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

  useEffect(() => {
    if (selectedAccount) {
      dispatch(
        fetchNotifications({
          accountId: selectedAccount.id,
          mnemonichHash: selectedAccount.mnemonicHash
        })
      );
    }
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
                            maxWidth: disableSideBarRanking.some(item => selectedKey.includes(item)) ? '100%' : ''
                          }}
                          id="scrollableDiv"
                        >
                          <Topbar ref={setRef} />
                          {children}
                        </Layout>
                        {/* TODO: Implement SidebarRanking in future */}
                        {/* {!disableSideBarRanking.some(item => selectedKey.includes(item)) && (
                          <SidebarRanking></SidebarRanking>
                        )} */}
                      </div>
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

export default MainLayout;
