import ReloadOutlined, { CheckCircleOutlined, InboxOutlined } from '@ant-design/icons';
import { ThemedWalletOutlined } from '@bcpros/lixi-components/components/Common/CustomIcons';
import { SmartButton } from '@components/Common/PrimaryButton';
import { StyledSpacer } from '@components/Common/StyledSpacer';
import WalletInfoComponent from '@components/Wallet/WalletInfo';
import { getAccount, refreshLixiList, refreshLixiListSilent, silentLogin } from '@store/account/actions';
import { getPageBySelectedAccount } from '@store/page/selectors';
import { Tabs } from 'antd';
import moment from 'moment';
import Link from 'next/link';
import React, { useEffect } from 'react';
import intl from 'react-intl-universal';
import { getSelectedAccount } from 'src/store/account/selectors';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getLixiesBySelectedAccount } from 'src/store/lixi/selectors';
import styled from 'styled-components';

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

const Account: React.FC = () => {
  const dispatch = useAppDispatch();
  const lixies = useAppSelector(getLixiesBySelectedAccount);
  const selectedAccount = useAppSelector(getSelectedAccount);
  const selectedPage = useAppSelector(getPageBySelectedAccount);

  useEffect(() => {
    if (selectedAccount) {
      dispatch(getAccount(selectedAccount.id));
      dispatch(silentLogin(selectedAccount.mnemonic));
      dispatch(refreshLixiListSilent(selectedAccount?.id));
    }
  }, []);

  const refreshList = () => {
    dispatch(refreshLixiList(selectedAccount?.id));
  };
  return (
    <>
      <WalletInfoComponent />

      {selectedPage ? (
        <Link href="/page/edit" passHref>
          <SmartButton>{intl.get('page.editPage')}</SmartButton>
        </Link>
      ) : (
        <Link href="/page/create" passHref>
          <SmartButton>{intl.get('page.createPage')}</SmartButton>
        </Link>
      )}

      <StyledSpacer />
      <h2 style={{ color: 'var(--color-primary)' }}>
        <ThemedWalletOutlined /> {intl.get('account.manageLixi')}
      </h2>

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
          ></TabPane>
          <TabPane
            key={'2'}
            tab={
              <span>
                {' '}
                <InboxOutlined className="archive-tab-icon" /> Archive{' '}
              </span>
            }
          ></TabPane>
        </StyledTabs>
      )}
    </>
  );
};

export default Account;
