import ReloadOutlined, { CheckCircleOutlined, InboxOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import { ThemedWalletOutlined } from '@bcpros/lixi-components/components/Common/CustomIcons';
import { SmartButton } from '@components/Common/PrimaryButton';
import { StyledSpacer } from '@components/Common/StyledSpacer';
import CreateLixiForm from '@components/Lixi/CreateLixiForm';
import LixiList from '@components/Lixi/LixiList';
import { getAccount, refreshLixiList, refreshLixiListSilent } from '@store/account/actions';
import { Tabs } from 'antd';
import moment from 'moment';
import React, { useEffect } from 'react';
import { getSelectedAccount } from 'src/store/account/selectors';
import { getEnvelopes } from 'src/store/envelope/actions';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getLixiesBySelectedAccount } from 'src/store/lixi/selectors';
import { AppContext } from 'src/store/store';
import styled from 'styled-components';
import WalletInfoComponent from '@components/Wallet/WalletInfo';
import Link from 'next/link';

const { TabPane } = Tabs;
const StyledTabs = styled(Tabs)`
  .ant-collapse-header {
    justify-content: center;
    align-items: center;
  }
  .ant-tabs-nav-list {
    width: 100%;
    text-align: center;
  }
  .ant-tabs-tab {
    width: 100%;
    text-align: center;
    background-color: ${props => props.theme.tab.background} !important;
  }
  .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
    color: ${props => props.theme.primary};
    text-shadow: 0 0 0.25px currentColor;
  }
  .ant-tabs-content {
    text-align: center;
  }
`;

const Home: React.FC = () => {
  const ContextValue = React.useContext(AppContext);

  const dispatch = useAppDispatch();
  const lixies = useAppSelector(getLixiesBySelectedAccount);
  const selectedAccount = useAppSelector(getSelectedAccount);

  useEffect(() => {
    dispatch(getEnvelopes());
    if (selectedAccount) {
      dispatch(getAccount(selectedAccount.id));
      dispatch(refreshLixiListSilent(selectedAccount?.id));
    }
  }, []);

  const refreshList = () => {
    dispatch(refreshLixiList(selectedAccount?.id));
  };
  return (
    <>
      <WalletInfoComponent />

      {selectedAccount.page ?
        <Link href="/page/edit" passHref>
          <SmartButton>{intl.get('page.editPage')}</SmartButton>
        </Link> :
        <Link href="/page/create" passHref>
          <SmartButton>{intl.get('page.createPage')}</SmartButton>
        </Link>
      }

      <StyledSpacer />
      <h2 style={{ color: 'var(--color-primary)' }}>
        <ThemedWalletOutlined /> {intl.get('account.manageLixi')}
      </h2>

      <CreateLixiForm account={selectedAccount} />
      <SmartButton onClick={() => refreshList()}>
        <ReloadOutlined /> {intl.get('account.refreshLixiList')}
      </SmartButton>
      {lixies.length > 0 && (
        <StyledTabs type="card" size="large" defaultActiveKey="1" centered>
          <TabPane
            key={'1'}
            tab={
              <span>
                {' '}
                <CheckCircleOutlined className="active-tab-icon" /> Active{' '}
              </span>
            }
          >
            <LixiList
              lixies={lixies.filter(
                lixi =>
                  lixi.status != 'locked' &&
                  !moment().isAfter(lixi.expiryAt) &&
                  !(lixi.maxClaim != 0 && lixi.claimedNum == lixi.maxClaim)
              )}
            />
          </TabPane>
          <TabPane
            key={'2'}
            tab={
              <span>
                {' '}
                <InboxOutlined className="archive-tab-icon" /> Archive{' '}
              </span>
            }
          >
            <LixiList
              lixies={lixies.filter(
                lixi =>
                  lixi.status === 'locked' ||
                  moment().isAfter(lixi.expiryAt) ||
                  (lixi.maxClaim != 0 && lixi.claimedNum == lixi.maxClaim)
              )}
            />
          </TabPane>
        </StyledTabs>
      )}
    </>
  );
};

export default Home;
