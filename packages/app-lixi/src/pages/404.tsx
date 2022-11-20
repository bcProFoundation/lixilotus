import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Layout, Spin } from 'antd';
import Link from 'next/link';
import styled, { DefaultTheme, ThemeProvider } from 'styled-components';

import { LeftOutlined, LoadingOutlined } from '@ant-design/icons';

import { loadLocale } from '@store/settings/actions';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getCurrentLocale, getIntlInitStatus } from '@store/settings/selectors';
import { injectStore } from 'src/utils/axiosClient';
import SidebarShortcut from '@containers/Sidebar/SideBarShortcut';
import { navBarHeaderList } from '@components/Common/navBarHeaderList';
import { useRouter } from 'next/router';
import intl from 'react-intl-universal';
import { GlobalStyle } from '@components/Layout/MainLayout/GlobalStyle';
import ModalManager from '@components/Common/ModalManager';
import { theme } from '@components/Layout/MainLayout/theme';
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

type EmptyLayoutProps = React.PropsWithChildren<{}>;

const EmptyLayout: React.FC = (props: EmptyLayoutProps) => {
  const { children } = props;
  const [loading, setLoading] = useState(false);
  const currentLocale = useAppSelector(getCurrentLocale);
  const intlInitDone = useAppSelector(getIntlInitStatus);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [height, setHeight] = useState(0);
  const selectedKey = router.pathname ?? '';
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
                      <Layout className="main-section-layout" style={{ paddingRight: '2rem' }}>
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

const FourOhFourComponent = () => {
  const FourOhFour = styled.div`
    background: var(--bg-color-light-theme);
    .container {
      font-family: sans-serif;
      height: 100vh;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      img {
        margin-bottom: 5px;
      }
      h1 {
        font-weight: bold;
        font-size: 2.5em;
        margin-top: 1em;
        margin-bottom: 0px;
      }
      img {
        width: 100%;
        max-width: 1067px;
      }
      .button {
        margin-top: 0.5em;
        min-width: 150px;
      }
    }
  `;
  return (
    <FourOhFour>
      <div className="container">
        <img src="/images/404.png" alt="404" />
        <h1>{intl.get('general.notFoundTitle')}</h1>
        <h3>{intl.get('general.notFoundDescription')}</h3>
        <Button className="button" type="primary" onClick={() => window.open('/', '_self')}>
          {intl.get('general.goBackToHome')}
        </Button>
      </div>
    </FourOhFour>
  );
}

const FourOhFourPage = () => {
  return <FourOhFourComponent />;
};

FourOhFourPage.Layout = ({ children }) => <EmptyLayout children={children} />;

export default FourOhFourPage;
