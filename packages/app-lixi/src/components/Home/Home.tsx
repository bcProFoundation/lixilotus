import ReloadOutlined, { CheckCircleOutlined, InboxOutlined, LockOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import BalanceHeader from '@bcpros/lixi-components/components/Common/BalanceHeader';
import { ThemedWalletOutlined } from '@bcpros/lixi-components/components/Common/CustomIcons';
import QRCode from '@bcpros/lixi-components/components/Common/QRCode';
import { currency } from '@bcpros/lixi-components/components/Common/Ticker';
import WalletLabel from '@bcpros/lixi-components/components/Common/WalletLabel';
import { AntdFormWrapper } from '@components/Common/EnhancedInputs';
import { SmartButton } from '@components/Common/PrimaryButton';
import { StyledSpacer } from '@components/Common/StyledSpacer';
import CreateLixiForm from '@components/Lixi/CreateLixiForm';
import LixiList from '@components/Lixi/LixiList';
import { getAccount, importAccount, refreshLixiList, setAccountBalance } from '@store/account/actions';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { Form, Input, Modal, Tabs } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { getSelectedAccount } from 'src/store/account/selectors';
import { getEnvelopes } from 'src/store/envelope/actions';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getLixiesBySelectedAccount } from 'src/store/lixi/selectors';
import { getIsGlobalLoading } from 'src/store/loading/selectors';
import { AppContext } from 'src/store/store';
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

const Home: React.FC = () => {

  const isServer = () => typeof window === 'undefined';
  const ContextValue = React.useContext(AppContext);
  const { XPI, Wallet } = ContextValue;
  const [formData, setFormData] = useState({
    dirty: true,
    mnemonic: '',
  });
  const [isValidMnemonic, setIsValidMnemonic] = useState(false);
  const [seedInput, openSeedInput] = useState(false);
  const dispatch = useAppDispatch();
  const { confirm } = Modal;
  const isLoading = useAppSelector(getIsGlobalLoading);
  const lixies = useAppSelector(getLixiesBySelectedAccount);
  const selectedAccount = useAppSelector(getSelectedAccount);
  const [isLoadBalanceError, setIsLoadBalanceError] = useState(false);


  useEffect(() => {
    dispatch(getEnvelopes());
    if (selectedAccount) {
      dispatch(getAccount(selectedAccount.id));
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      XPI.Electrumx.balance(selectedAccount?.address)
        .then((result) => {
          if (result && result.balance) {
            const balance = result.balance.confirmed + result.balance.unconfirmed;
            dispatch(setAccountBalance(balance ?? 0));
          }
        })
        .catch((e) => {
          setIsLoadBalanceError(true);
        });
    }, 10000);
    return () => clearInterval(id);
  }, []);

  const handleChange = (e) => {
    const { value, name } = e.target;

    // Validate mnemonic on change
    // Import button should be disabled unless mnemonic is valid
    setIsValidMnemonic(Wallet.validateMnemonic(value));

    setFormData((p) => ({ ...p, [name]: value }));
  };

  async function submit() {
    setFormData({
      ...formData,
      dirty: false,
    });

    if (!formData.mnemonic) {
      return;
    }
    dispatch(importAccount(formData.mnemonic));
  }

  const refreshList = () => {
    dispatch(refreshLixiList(selectedAccount?.id));
  };
  return (
    <>
      <WalletLabel name={selectedAccount?.name ?? ''} />
      <BalanceHeader
        balance={fromSmallestDenomination(selectedAccount?.balance ?? 0)}
        ticker={currency.ticker} />
      {!isServer() && selectedAccount?.address && <QRCode
        address={selectedAccount?.address}
      />}
      {seedInput && (
        <AntdFormWrapper>
          <Form style={{ width: 'auto' }}>
            <Form.Item
              validateStatus={
                !formData.dirty && !formData.mnemonic
                  ? 'error'
                  : ''
              }
              help={
                !formData.mnemonic || !isValidMnemonic
                  ? intl.get('account.mnemonicRequired')
                  : ''
              }
            >
              <Input
                prefix={<LockOutlined />}
                placeholder={intl.get('account.mnemonic')}
                name="mnemonic"
                autoComplete="off"
                onChange={(e) => handleChange(e)}
                required
              />
            </Form.Item>

            <SmartButton disabled={!isValidMnemonic} onClick={() => submit()}>
              Import
            </SmartButton>
          </Form>
        </AntdFormWrapper>
      )}
      <StyledSpacer />
      <h2 style={{ color: '#6f2dbd' }}>
        <ThemedWalletOutlined /> {intl.get('account.manageLixi')}
      </h2>

      <CreateLixiForm account={selectedAccount} />
      <SmartButton onClick={() => refreshList()}>
        <ReloadOutlined /> {intl.get('account.refreshLixiList')}
      </SmartButton>
      {
        lixies.length > 0 && (
          <StyledTabs type="card" size="large" defaultActiveKey="1" centered>
            <TabPane key={'1'} tab={(<span> <CheckCircleOutlined className='active-tab-icon' /> Active </span>)}>
              <LixiList lixies={lixies.filter(lixi => (lixi.status == 'active' || lixi.status == 'pending') && !moment().isAfter(lixi.expiryAt) && !(lixi.maxClaim != 0 && lixi.claimedNum == lixi.maxClaim))} />
            </TabPane>
            <TabPane key={'2'} tab={(<span> <InboxOutlined className='archive-tab-icon' /> Archive </span>)}>
              <LixiList lixies={lixies.filter(lixi => lixi.status != 'active' || moment().isAfter(lixi.expiryAt) || lixi.maxClaim != 0 && lixi.claimedNum == lixi.maxClaim)} />
            </TabPane>
          </StyledTabs>
        )
      }

    </>
  );
};

export default Home;
