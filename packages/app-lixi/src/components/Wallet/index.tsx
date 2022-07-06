import LockOutlined from '@ant-design/icons';
import intl from 'react-intl-universal';
import BalanceHeader from '@bcpros/lixi-components/components/Common/BalanceHeader';
import QRCode from '@bcpros/lixi-components/components/Common/QRCode';
import { currency } from '@bcpros/lixi-components/components/Common/Ticker';
import WalletLabel from '@bcpros/lixi-components/components/Common/WalletLabel';
import { AntdFormWrapper } from '@components/Common/EnhancedInputs';
import { SmartButton } from '@components/Common/PrimaryButton';
import { getAccount, importAccount, refreshLixiListSilent, setAccountBalance } from '@store/account/actions';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { Form, Input } from 'antd';
import React, { useEffect, useState } from 'react';
import { getSelectedAccount } from 'src/store/account/selectors';
import { getEnvelopes } from 'src/store/envelope/actions';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { AppContext } from 'src/store/store';

const WalletComponent: React.FC = () => {

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
  const selectedAccount = useAppSelector(getSelectedAccount);
  const [isLoadBalanceError, setIsLoadBalanceError] = useState(false);


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
    </>
  );
};

export default WalletComponent;
