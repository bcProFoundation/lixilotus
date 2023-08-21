import LockOutlined, { EditOutlined, SendOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import BalanceHeader from '@bcpros/lixi-components/components/Common/BalanceHeader';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { message } from 'antd';
import QRCode, { FormattedWalletAddress } from '@bcpros/lixi-components/components/Common/QRCode';
import { currency } from '@bcpros/lixi-components/components/Common/Ticker';
import WalletLabel from '@bcpros/lixi-components/components/Common/WalletLabel';
import { AntdFormWrapper } from '@components/Common/EnhancedInputs';
import { SmartButton } from '@components/Common/PrimaryButton';
import { importAccount, renameAccount } from '@store/account/actions';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { Form, Input } from 'antd';
import React, { useEffect, useState } from 'react';
import { getSelectedAccount } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { WalletContext } from '@context/index';
import styled from 'styled-components';
import { Account, RenameAccountCommand } from '@bcpros/lixi-models';
import { RenameAccountModalProps } from '@components/Settings/RenameAccountModal';
import { openModal } from '@store/modal/actions';
import { useRouter } from 'next/router';
import { getSelectedWalletPath, getWalletStatus } from '@store/wallet';
import { QRCodeModal } from '@components/Common/QRCodeModal';
import { QRCodeModalType } from '@bcpros/lixi-models/constants';
import { showToast } from '@store/toast/actions';

const CardContainer = styled.div`
  position: relative;
  display: flex;
  background: url(../images/bg-xpi.svg) no-repeat;
  background-size: cover !important;
  background-position: center;
  border-radius: var(--border-radius-primary);
  padding: 2rem 2rem 3rem 2rem;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;

const WalletCard = styled.div`
  .wallet-name {
    display: flex;
    align-items: center;
    h4 {
      color: #edeff0;
      font-size: 14px;
      margin: 0 8px;
    }
    .edit-ico {
      font-size: 17px;
      color: rgba(237, 239, 240, 0.6);
    }
  }
`;

const StyledBalanceHeader = styled.div`
  > div {
    min-width: 150px;
    text-align: left;
    font-size: 28px;
    color: #edeff0;
    margin: 8px 0;
    display: flex;
    align-items: center;
    gap: 5px;
    span {
      font-size: 14px;
      line-height: 24px;
      letter-spacing: 0.5px;
      color: rgba(237, 239, 240, 0.6);
    }
  }
  .iso-amount {
    font-size: 14px;
    color: rgba(237, 239, 240, 0.6);
    text-align: left;
  }
`;

const StyledQRCode = styled.div`
  flex: 1 auto;
  text-align: right;
  opacity: 0.7;
  #borderedQRCode {
    border-radius: var(--boder-radius-primay);
    border-radius: 8px;
    @media (max-width: 768px) {
      width: 60px;
      height: 60px;
    }
    @media (min-width: 768px) {
      width: 90px;
      height: 90px;
    }
  }
`;

const AddressWalletBar = styled.div`
  display: flex;
  justify-content: end;
  align-items: center;
  opacity: 0.8;
  width: 100%;
  position: absolute;
  bottom: 0;
  right: 0;
  text-align: right;
  padding: 5px 2rem;
  background: linear-gradient(270deg, rgba(0, 30, 46, 0.24) 2.04%, rgba(0, 30, 46, 0) 100%);
  border-radius: 0px 8px 26px 0px;
  color: #edeff0;
  span {
    color: #edeff0;
    margin-left: 4px;
  }
`;

const ButtonSend = styled.div`
  cursor: pointer;
  margin-right: 1rem;
  font-size: 14px;
  color: #edeff0;
  .anticon {
    margin-right: 4px;
    font-size: 14px;
  }
`;

const WalletInfoComponent: React.FC = () => {
  const isServer = () => typeof window === 'undefined';
  const router = useRouter();
  const Wallet = React.useContext(WalletContext);
  const { XPI } = Wallet;
  const [formData, setFormData] = useState({
    dirty: true,
    mnemonic: ''
  });
  const [isValidMnemonic, setIsValidMnemonic] = useState(false);
  const [seedInput, openSeedInput] = useState(false);
  const dispatch = useAppDispatch();
  const walletStatus = useAppSelector(getWalletStatus);
  const selectedAccount = useAppSelector(getSelectedAccount);
  const selectedWalletPath = useAppSelector(getSelectedWalletPath);

  const showPopulatedRenameAccountModal = (account: Account) => {
    const command: RenameAccountCommand = {
      id: account.id,
      mnemonic: account.mnemonic,
      name: account.name
    };
    const renameAcountModalProps: RenameAccountModalProps = {
      account: account,
      onOkAction: renameAccount(command)
    };
    dispatch(openModal('RenameAccountModal', renameAcountModalProps));
  };

  const handleChange = e => {
    const { value, name } = e.target;

    // Validate mnemonic on change
    // Import button should be disabled unless mnemonic is valid
    setIsValidMnemonic(Wallet.validateMnemonic(value));

    setFormData(p => ({ ...p, [name]: value }));
  };

  async function submit() {
    setFormData({
      ...formData,
      dirty: false
    });

    if (!formData.mnemonic) {
      return;
    }
    dispatch(importAccount(formData.mnemonic));
  }

  const handleOnCopy = () => {
    dispatch(
      showToast('info', {
        message: intl.get('toast.info'),
        description: intl.get('lixi.addressCopied')
      })
    );
  };

  return (
    <>
      <CardContainer className="card-container">
        <WalletCard>
          <div className="wallet-name">
            <img src="../images/xpi.svg" alt="" />
            <WalletLabel name={selectedAccount?.name ?? ''} />
            <EditOutlined
              className="edit-ico"
              onClick={() => showPopulatedRenameAccountModal(selectedAccount as Account)}
            />
          </div>
          <StyledBalanceHeader>
            <BalanceHeader
              balance={fromSmallestDenomination(walletStatus.balances.totalBalanceInSatoshis ?? 0)}
              ticker={currency.ticker}
            />
          </StyledBalanceHeader>
        </WalletCard>
        {!isServer() && selectedWalletPath && selectedWalletPath?.xAddress && (
          <StyledQRCode>
            <QRCodeModal address={selectedWalletPath?.xAddress} type={QRCodeModalType.address} />
            {/* <QRCode address={selectedWalletPath?.xAddress} isAccountPage={true} /> */}
          </StyledQRCode>
        )}
        <AddressWalletBar>
          <ButtonSend onClick={() => router.push('/send')}>
            <SendOutlined />
            {intl.get('general.send')}
          </ButtonSend>
          <CopyToClipboard text={selectedAccount ? selectedAccount.address : ''} onCopy={handleOnCopy}>
            <span>
              <FormattedWalletAddress
                address={selectedWalletPath?.xAddress}
                isAccountPage={true}
              ></FormattedWalletAddress>
            </span>
          </CopyToClipboard>
        </AddressWalletBar>
      </CardContainer>

      {seedInput && (
        <AntdFormWrapper>
          <Form style={{ width: 'auto' }}>
            <Form.Item
              validateStatus={!formData.dirty && !formData.mnemonic ? 'error' : ''}
              help={!formData.mnemonic || !isValidMnemonic ? intl.get('account.mnemonicRequired') : ''}
            >
              <Input
                prefix={<LockOutlined />}
                placeholder={intl.get('account.mnemonic')}
                name="mnemonic"
                autoComplete="off"
                onChange={e => handleChange(e)}
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

export default WalletInfoComponent;
