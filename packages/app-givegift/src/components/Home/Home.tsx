import { Form, Input, Modal, Tabs } from 'antd';
import 'antd/dist/antd.css';
import React, { useEffect, useState } from 'react';
import {
  getAccount,
  importAccount,
  setAccountBalance,
  refreshVaultList,
} from 'src/store/account/actions';
import { getSelectedAccount } from 'src/store/account/selectors';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getIsGlobalLoading } from 'src/store/loading/selectors';
import { AppContext } from 'src/store/store';
import { getVaultsBySelectedAccount } from 'src/store/vault/selectors';
import { ThemedWalletOutlined } from '@abcpros/givegift-components/components/Common/CustomIcons';
import WalletLabel from '@abcpros/givegift-components/components/Common/WalletLabel';
import BalanceHeader from '@abcpros/givegift-components/components/Common/BalanceHeader';
import { CheckCircleOutlined, CloseCircleOutlined, LockOutlined } from '@ant-design/icons';
import { AntdFormWrapper } from '@components/Common/EnhancedInputs';
import { SmartButton } from '@components/Common/PrimaryButton';
import { StyledSpacer } from '@components/Common/StyledSpacer';
import CreateVaultForm from '@components/Vault/CreateVaultForm';
import VaultList from '@components/Vault/VaultList';
import { getEnvelopes } from 'src/store/envelope/actions';
import { currency } from '@abcpros/givegift-components/components/Common/Ticker';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { QRCode } from '@abcpros/givegift-components/src/components/Common/QRCode';
import ReloadOutlined from '@ant-design/icons';
import moment from 'moment';
import styled from 'styled-components';


const Home: React.FC = () => {
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
    width: 50%;
    background: #fff;
    text-align: center;
  }

  .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
    color: #6f2dbd;
    text-shadow: 0 0 0.25px currentColor;
  }

  .ant-tabs-content {
    text-align: center;
  }
`;

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
  const vaults = useAppSelector(getVaultsBySelectedAccount);
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
    dispatch(refreshVaultList(selectedAccount?.id));
  };
  return (
    <>
      <WalletLabel name={selectedAccount?.name ?? ''} />
      <BalanceHeader
        balance={fromSmallestDenomination(selectedAccount?.balance ?? 0)}
        ticker={currency.ticker}
      />
      {selectedAccount?.address && <QRCode address={selectedAccount?.address} />}
      {seedInput && (
        <AntdFormWrapper>
          <Form style={{ width: 'auto' }}>
            <Form.Item
              validateStatus={!formData.dirty && !formData.mnemonic ? 'error' : ''}
              help={
                !formData.mnemonic || !isValidMnemonic ? 'Valid mnemonic seed phrase required' : ''
              }
            >
              <Input
                prefix={<LockOutlined />}
                placeholder="mnemonic (seed phrase)"
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
        <ThemedWalletOutlined /> Manage Vaults
      </h2>

      <CreateVaultForm account={selectedAccount} />
      <SmartButton onClick={() => refreshList()}>
        <ReloadOutlined /> Refresh Vault List
      </SmartButton>

      <StyledTabs type="card" size="large" defaultActiveKey="1" centered>
        <TabPane tab={ <span> <CheckCircleOutlined/> Active </span> } key="1">
          <VaultList vaults={vaults.filter(vault => vault.status == 'active' && !moment().isAfter(vault.expiryAt) && !(vault.maxRedeem != 0 && vault.redeemedNum == vault.maxRedeem) )}/>
        </TabPane>
        <TabPane tab={ <span> <CloseCircleOutlined /> Archive </span> } key="2">
          <VaultList vaults={vaults.filter(vault => vault.status != 'active' || moment().isAfter(vault.expiryAt) || vault.maxRedeem != 0 && vault.redeemedNum == vault.maxRedeem)}/>
        </TabPane>
      </StyledTabs>
    </>
  );
};

export default Home;
status