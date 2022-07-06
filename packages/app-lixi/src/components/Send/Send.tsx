import LockOutlined from '@ant-design/icons';
import intl from 'react-intl-universal';
import BalanceHeader from '@bcpros/lixi-components/components/Common/BalanceHeader';
import QRCode from '@bcpros/lixi-components/components/Common/QRCode';
import { currency } from '@bcpros/lixi-components/components/Common/Ticker';
import WalletLabel from '@bcpros/lixi-components/components/Common/WalletLabel';
import { AntdFormWrapper } from '@components/Common/EnhancedInputs';
import { SmartButton } from '@components/Common/PrimaryButton';
import { importAccount, setAccountBalance } from '@store/account/actions';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { Col, Form, Input, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import { getSelectedAccount } from 'src/store/account/selectors';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { AppContext } from 'src/store/store';
import { SendXpiInput } from '@bcpros/lixi-components/components/Common/EnhancedInputs';

const SendComponent: React.FC = () => {

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
  const onMax = async () => {
    // Clear this error before updating field
    try {
        setFormData({
            ...formData,
            value,
        });
    } catch (err) {
        console.log(`Error in onMax:`);
        console.log(err);
    }
};

  return (
    <>
      <WalletLabel name={selectedAccount?.name ?? ''} />
      <BalanceHeader
        balance={fromSmallestDenomination(selectedAccount?.balance ?? 0)}
        ticker={currency.ticker} />
        <Row>
            <Col span={24}>
            </Col>
        </Row>
    </>
  );
};

export default SendComponent;
