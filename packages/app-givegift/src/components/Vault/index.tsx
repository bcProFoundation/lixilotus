import React, { useEffect, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import styled from 'styled-components';
import { Descriptions, Collapse } from 'antd';
import moment from 'moment';
import { saveAs } from 'file-saver';
import { AppContext } from 'src/store/store';
import { toPng } from 'html-to-image';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getSelectedVaultId, getSelectedVault } from 'src/store/vault/selectors';
import { QRCode } from "@abcpros/givegift-components/components/Common/QRCode";
import { QRRedeemCode } from "@abcpros/givegift-components/components/Common/QRRedeemCode";
import { VaultType } from '@abcpros/givegift-models/src/lib/vault';
import WalletLabel from '@abcpros/givegift-components/components/Common/WalletLabel';
import BalanceHeader from '@abcpros/givegift-components/components/Common/BalanceHeader';
import { StyledCollapse } from "@abcpros/givegift-components/components/Common/StyledCollapse";
import { SmartButton } from '@abcpros/givegift-components/components/Common/PrimaryButton';
import RedeemList from '@components/Redeem/RedeemList';
import { getVault, refreshVault, setVaultBalance } from 'src/store/vault/actions';
import { getAllRedeems } from 'src/store/redeem/selectors';
import { currency } from '@abcpros/givegift-components/src/components/Common/Ticker';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { countries } from '@abcpros/givegift-models/constants/countries';
import lixiLogo from '../../assets/images/lixi_logo.svg';
import { CopyOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { showToast } from 'src/store/toast/actions';
import useAsyncTimeout from '@hooks/useAsyncTimeout';

type CopiedProps = {
  style?: React.CSSProperties
};

const Copied = styled.div<CopiedProps>`
  font-size: 18px;
  font-weight: bold;
  width: 100%;
  text-align: center;
  border: 1px solid;
  background-color: ${({ ...props }) => props.theme.primary};
  border-color: ${({ ...props }) => props.theme.qr.copyBorderCash};
  color: ${props => props.theme.contrast};
  position: absolute;
  top: 65px;
  padding: 30px 0;
  @media (max-width: 768px) {
    top: 52px;
    padding: 20px 0;
  }
`;

const { Panel } = Collapse;

const Vault: React.FC = () => {

  const dispatch = useAppDispatch();
  const ContextValue = React.useContext(AppContext);
  const { XPI, Wallet } = ContextValue;
  const selectedVaultId = useAppSelector(getSelectedVaultId);
  const selectedVault = useAppSelector(getSelectedVault);
  const allReddemsCurrentVault = useAppSelector(getAllRedeems);
  const [redeemCodeVisible, setRedeemCodeVisible] = useState(false);
  const qrPanelRef = React.useRef(null);
  const [isLoadBalanceError, setIsLoadBalanceError] = useState(false);

  useEffect(() => {
    if (selectedVault) {
      dispatch(getVault(selectedVault.id))
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      XPI.Electrumx.balance(selectedVault?.address).then((result => {
        if (result && result.balance) {
          const balance = result.balance.confirmed + result.balance.unconfirmed;
          dispatch(setVaultBalance(balance ?? 0));
        }
      })).catch(e => {
        setIsLoadBalanceError(true);
      })
    }, 10000);
    return () => {
      return clearTimeout(id);
    }
  }, []);

  const handleRefeshVault = () => {
    if (!(selectedVault && selectedVaultId)) {
      // Ignore if no vault is selected
      return;
    }
    const vaultId = selectedVaultId;
    dispatch(refreshVault(vaultId));
  }

  const handleOnClickRedeemCode = evt => {
    setRedeemCodeVisible(true);
    setTimeout(() => {
      setRedeemCodeVisible(false);
    }, 1500);
  }

  const handleOnCopyRedeemCode = () => {
    setRedeemCodeVisible(true);
  };

  const handleDownloadQRRedeemCode = () => {
    if (qrPanelRef.current) {
      toPng(qrPanelRef.current, { cacheBust: true }).then(url => {
        saveAs(url);
      }).catch((err) => {
        dispatch(showToast('error', {
          message: 'Unable to download redeem code.',
          description: 'Please copy the code manually',
          duration: 5
        }));
      });
    }
  }

  const typeVault = () => {
    switch (selectedVault?.vaultType) {
      case VaultType.Fixed:
        return (
          <>Fixed {selectedVault.fixedValue} {currency.ticker}</>
        );
      case VaultType.Divided:
        return (
          <>Divided by {selectedVault.dividedValue} </>
        );
      default:
        return (
          <>Random {selectedVault?.minValue}-{selectedVault?.maxValue} {currency.ticker}</>
        );
    }
  }

  const showRedemption = () => {
    if (selectedVault?.maxRedeem != 0) {
      return <>{selectedVault?.redeemedNum} / {selectedVault?.maxRedeem}</>
    }
    else {
      return <>{selectedVault?.redeemedNum}</>
    }
  }

  const formatDate = () => {
    if (selectedVault?.expiryAt != null) {
      return (
        <Descriptions.Item label="Expiry at">
          {moment(selectedVault?.expiryAt).format("YYYY-MM-DD HH:mm")}
        </Descriptions.Item>
      );
    }
    else {
      return;
    }
  }

  const showCountry = () => {
    return (selectedVault?.country != null) ? (
      <Descriptions.Item label="Country">
        {countries.find(country => country.id === selectedVault?.country)?.name}
      </Descriptions.Item>) : "";
  }

  const showIsFamilyFriendly = () => {
    return (selectedVault?.isFamilyFriendly) ? (
      <Descriptions.Item label="Optional">
        Family Friendly
      </Descriptions.Item>) : "";
  }

  return (
    <>
      <WalletLabel
        name={selectedVault?.name ?? ''}
      />
      <BalanceHeader
        balance={fromSmallestDenomination(selectedVault?.balance) ?? 0}
        ticker={currency.ticker} />
      {selectedVault && selectedVault.address ? (
        <>
          <QRCode
            address={selectedVault.address}
          />

          <Descriptions
            column={1}
            bordered
            title={`Vault info for "${selectedVault.name}"`}
            style={{
              padding: '0 0 20px 0',
              color: 'rgb(23,23,31)',
            }}
          >
            <Descriptions.Item label="Type">
              {typeVault()}
            </Descriptions.Item>
            <Descriptions.Item label="Total Redeemed">
              {fromSmallestDenomination(selectedVault?.totalRedeem) ?? 0}
            </Descriptions.Item>
            <Descriptions.Item label="Redemptions">
              {showRedemption()}
            </Descriptions.Item>
            {formatDate()}
            {showCountry()}
            {showIsFamilyFriendly()}
          </Descriptions>

          {/* Vault details */}
          <StyledCollapse style={{ marginBottom: '20px' }}>
            <Panel header="Click to reveal vault detail" key="panel-1">
              <div ref={qrPanelRef}>
                {selectedVault && selectedVault.redeemCode && <QRRedeemCode
                  logoImage={lixiLogo}
                  code={selectedVault?.redeemCode}
                />}
              </div>
              <SmartButton
                onClick={() => handleDownloadQRRedeemCode()}
              >
                <DownloadOutlined />  Download Code
              </SmartButton>
            </Panel>
          </StyledCollapse>

          {/* Copy RedeemCode */}
          <CopyToClipboard
            style={{
              display: 'inline-block',
              width: '100%',
              position: 'relative',
            }}
            text={selectedVault.redeemCode}
            onCopy={handleOnCopyRedeemCode}
          >
            <div style={{ position: 'relative', paddingTop: '20px' }} onClick={handleOnClickRedeemCode}>
              <Copied
                style={{ display: redeemCodeVisible ? undefined : 'none' }}
              >
                Copied <br />
                <span style={{ fontSize: '32px' }}>{selectedVault.redeemCode}</span>
              </Copied>
              <SmartButton>
                <CopyOutlined />  Copy Redeem Code
              </SmartButton>
            </div>
          </CopyToClipboard>

          <SmartButton
            onClick={() => handleRefeshVault()}
          >
            <ReloadOutlined />  Refresh Vault
          </SmartButton>

          <RedeemList redeems={allReddemsCurrentVault} />
        </>
      )
        : `No vault is selected`
      }
    </>
  )
};

export default Vault;