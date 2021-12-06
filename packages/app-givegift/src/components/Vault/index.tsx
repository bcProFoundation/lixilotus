import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import styled from 'styled-components';
import { Descriptions, Collapse } from 'antd';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getAllVaultsEntities, getSelectedVaultId } from 'src/store/vault/selectors';
import { QRCode } from "@abcpros/givegift-components/components/Common/QRCode";
import { StyledCollapse } from "@abcpros/givegift-components/components/Common/StyledCollapse";
import { SmartButton } from '@abcpros/givegift-components/components/Common/PrimaryButton';
import RedeemList from '@components/Redeem/RedeemList';
import { refreshVault } from 'src/store/vault/actions';
import { getAllRedeems } from 'src/store/redeem/selectors';
import { currency } from '../../../../givegift-components/src/components/Common/Ticker';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { CopyOutlined } from '@ant-design/icons';
import { showToast } from 'src/store/toast/actions';

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
              {selectedVault.isRandomGive ? 'Random:  ' : 'Fixed:  '}
              {selectedVault.isRandomGive ? <>{selectedVault.minValue}-{selectedVault.maxValue} {currency.ticker}</> : <>{selectedVault.fixedValue} {currency.ticker}</> }
            </Descriptions.Item>
            <Descriptions.Item label="Total Redeemed">
              {fromSmallestDenomination(selectedVault?.totalRedeem) ?? 0}
            </Descriptions.Item>
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