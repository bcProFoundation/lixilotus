import { Layout, Spin } from 'antd';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getGraphqlRequestStatus, getSelectedAccount, getSelectedAccountId } from 'src/store/account/selectors';
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
import { getCurrentLocale, getFilterPostsHome, getIntlInitStatus } from '@store/settings/selectors';
import { Header } from 'antd/lib/layout/layout';
import { getIsGlobalLoading } from 'src/store/loading/selectors';
import { injectStore } from 'src/utils/axiosClient';
import ModalManager from '../../Common/ModalManager';
import { GlobalStyle } from './GlobalStyle';
import { theme } from './theme';
import { Footer } from '@bcpros/lixi-components/components';
import { getAllNotifications } from '@store/notification/selectors';
import { fetchNotifications } from '@store/notification/actions';
import DummySidebar from '@containers/Sidebar/DummySidebar';
import { setTransactionReady } from '@store/account/actions';
import { getSlpBalancesAndUtxos } from '@store/wallet';
import { OrderDirection, PostOrderField } from 'src/generated/types.generated';
import { useInfinitePostsQuery } from '@store/post/useInfinitePostsQuery';
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
  .container-content {
    height: 100vh;
    scroll-behavior: smooth;
    overflow-y: auto;
    flex-grow: 1;
    display: flex;
    flex-direction: row;
    gap: 2rem;
    justify-content: flex-start;
    @media (max-width: 960px) {
      margin-left: 0 !important;
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
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const slpBalancesAndUtxosRef = useRef(slpBalancesAndUtxos);
  const scrollRef = useRef(null);
  const graphqlRequestLoading = useAppSelector(getGraphqlRequestStatus);

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

  /*TODO: Dont delete - need for maintain scroll position in the future */
  // useEffect(() => {
  //   if (scrollRef.current) {
  //     console.log(scrollRef.current);
  //     setTimeout(() => {
  //       scrollRef.current.scrollTo(0, 500);
  //     }, 2000);
  //   }
  // }, [scrollRef.current]);

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
                <AppContainer>
                  <Sidebar />
                  {/* Need to reimplement top bar */}
                  {/* <Topbar ref={ref}/> */}
                  <Topbar ref={setRef} />
                  {/* @ts-ignore */}
                  <div
                    className="container-content"
                    id="scrollableDiv"
                    ref={scrollRef}
                    /*TODO: Dont delete - need for maintain scroll position in the future */
                    // onScroll={() => {
                    //   const scrollTop = scrollRef.current.scrollTop;
                    //   console.log(`onScroll, scrollRef.current.scrollTop: ${scrollTop}`);
                    // }}
                  >
                    {/* <Layout
                            className="main-section-layout"
                            style={{
                              paddingRight: disableSideBarRanking.some(item => selectedKey.includes(item)) ? '2rem' : '0',
                              maxWidth: disableSideBarRanking.some(item => selectedKey.includes(item)) ? '100%' : ''
                            }}
                            
                          >
                          </Layout> 
                        */}
                    <SidebarShortcut />
                    <div className="content-child">{children}</div>
                    {/* This below is just a dummy sidebar */}
                    {/* TODO: Implement SidebarRanking in future */}
                    {(selectedKey === '/wallet' || selectedKey === '/') && <SidebarRanking></SidebarRanking>}
                    <DummySidebar />
                    <Footer notifications={notifications} />
                  </div>
                </AppContainer>
              </AppBody>
            </Layout>
          </LixiApp>
        </Spin>
      )}
    </ThemeProvider>
  );
};

export default MainLayout;
