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
import WalletComponent from '.';
import { getWalletState } from '@utils/cashMethods';
import TxHistory from '@components/TxHistory';

const FullWalletComponent: React.FC = () => {
  const ContextValue = React.useContext(AppContext);
  const { XPI, Wallet } = ContextValue;
  const { parsedTxHistory } = getWalletState(Wallet);
  const hasHistory = parsedTxHistory && parsedTxHistory.length > 0;

  return(
    <>
      <WalletComponent />
      {hasHistory && parsedTxHistory && (
                <>
                    <TxHistory
                        txs={parsedTxHistory}
                    />
                </>
            )}
    </>
  );
}

export default FullWalletComponent;
