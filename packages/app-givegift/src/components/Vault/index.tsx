import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import styled from 'styled-components';
import { Descriptions, Collapse } from 'antd';
import moment from 'moment';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getAllVaultsEntities, getSelectedVaultId } from 'src/store/vault/selectors';
import { QRCode } from "@abcpros/givegift-components/components/Common/QRCode";
import { VaultType } from '@abcpros/givegift-models/src/lib/vault';
import { StyledCollapse } from "@abcpros/givegift-components/components/Common/StyledCollapse";
import { SmartButton } from '@abcpros/givegift-components/components/Common/PrimaryButton';
import RedeemList from '@components/Redeem/RedeemList';
import { refreshVault } from 'src/store/vault/actions';
import { getAllRedeems } from 'src/store/redeem/selectors';
import { currency } from '../../../../givegift-components/src/components/Common/Ticker';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { CopyOutlined } from '@ant-design/icons';
import { showToast } from 'src/store/toast/actions';
import { countries } from '@abcpros/givegift-models/constants/countries';

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

  const allVaults = useAppSelector(getAllVaultsEntities);
  const selectedVaultId = useAppSelector(getSelectedVaultId);
  const selectedVault = allVaults[selectedVaultId];
  const allReddemsCurrentVault = useAppSelector(getAllRedeems);

  const [redeemCodeVisible, setRedeemCodeVisible] = useState(false);

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

  const handleOnClickSeed = evt => {
    dispatch(showToast('success', {
      message: 'Copy Success',
      description: 'Copy Seed Successfully',
      duration: 5
    }));
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

  return (
    <>
      {selectedVault && selectedVault.Path10605 && (
        <>
          <QRCode
            address={selectedVault.Path10605.xAddress}
          />

          <Descriptions
            column={1}
            bordered
            title={`Vault info for "${selectedVault.name}"`}
            style={{
              padding: '0px 20px',
              color: 'rgb(23,23,31)'
            }}
          >
            <Descriptions.Item label="Name">
              {selectedVault.name}
            </Descriptions.Item>
            <Descriptions.Item label="Type">
            {typeVault()}
            </Descriptions.Item>
            <Descriptions.Item label="Balance">
              {fromSmallestDenomination(selectedVault.balance) ?? 0} {currency.ticker}
            </Descriptions.Item>
            <Descriptions.Item label="Total Redeemed">
              {fromSmallestDenomination(selectedVault?.totalRedeem) ?? 0}
            </Descriptions.Item>
            <Descriptions.Item label="Redemptions">
              {showRedemption()}
            </Descriptions.Item>
            {formatDate()}
            {showCountry()}
          </Descriptions>
          
          {/* Detail Vault */}
          <StyledCollapse>
            <Panel header="Click to reveal vault detail" key="1">
              <Descriptions
                column={1}
                bordered
              >
                <Descriptions.Item label="Redeem Code">
                  {selectedVault.redeemCode}
                </Descriptions.Item>
                <Descriptions.Item label="Seed">
                  <CopyToClipboard 
                    tyle={{
                      display: 'inline-block',
                      width: '100%',
                      position: 'relative',
                    }}
                    text={selectedVault.mnemonic}
                  >
                    <div style={{ position: 'relative' }} onClick={handleOnClickSeed}>
                      {selectedVault.mnemonic} <CopyOutlined/>
                    </div>
                  </CopyToClipboard>
                </Descriptions.Item>
              </Descriptions>
            </Panel>
          </StyledCollapse>

          {/* Copy RedeemCode */}
          <CopyToClipboard 
            tyle={{
              display: 'inline-block',
              width: '100%',
              position: 'relative',
            }}
            text={selectedVault.redeemCode}
            onCopy={handleOnCopyRedeemCode}
          >
            <div style={{ position: 'relative' }} onClick={handleOnClickRedeemCode}>
              <Copied
                style={{ display: redeemCodeVisible ? undefined : 'none' }}
              >
                Copied <br />
                <span style={{ fontSize: '12px' }}>{selectedVault.redeemCode}</span>
              </Copied>
              <SmartButton> 
                Copy Redeem Code 
              </SmartButton>
            </div>
          </CopyToClipboard>

          {/* refreshVault */}
          <SmartButton
            onClick={() => handleRefeshVault()}
          >
            Refresh Vault
          </SmartButton>
          <RedeemList redeems={allReddemsCurrentVault} />
        </>
      )}
    </>
  )
};

export default Vault;