import React from 'react';
import { Descriptions, Collapse } from 'antd';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getAllVaultsEntities, getSelectedVaultId } from 'src/store/vault/selectors';
import { QRCode } from "@abcpros/givegift-components/components/Common/QRCode";
import { StyledCollapse } from "@abcpros/givegift-components/components/Common/StyledCollapse";
import { SmartButton } from '@abcpros/givegift-components/components/Common/PrimaryButton';
import { refreshVault } from 'src/store/vault/actions';
const { Panel } = Collapse;

const Vault: React.FC = () => {

  const dispatch = useAppDispatch();

  const allVaults = useAppSelector(getAllVaultsEntities);
  const selectedVaultId = useAppSelector(getSelectedVaultId);
  const selectedVault = allVaults[selectedVaultId];

  const handleRefeshVault = () => {
    if (!(selectedVault && selectedVaultId)) {
      // Ignore if no vault is selected
      return;
    }
    const vaultId = selectedVaultId;
    dispatch(refreshVault(vaultId));
  }

  return (
    <>
      {selectedVault && selectedVault.Path10605 && (
        <>
          <QRCode
            address={selectedVault.Path10605.xAddress}
          />
          <StyledCollapse>
            <Panel header="Click to reveal vault detail" key="1">
              <Descriptions
                column={1}
                bordered
                title={`Vault info for "${selectedVault.name}"`}
              >
                <Descriptions.Item label="Name">
                  {selectedVault.name}
                </Descriptions.Item>
                <Descriptions.Item label="Type">
                  {selectedVault.isRandomGive ? 'Random' : 'Default'}
                </Descriptions.Item>
                {selectedVault.isRandomGive ?
                  (
                    <>
                      <Descriptions.Item label="Min">
                        {selectedVault.minValue}
                      </Descriptions.Item>
                      <Descriptions.Item label="Max">
                        {selectedVault.maxValue}
                      </Descriptions.Item>
                    </>
                  ) :
                  (
                    <>
                      <Descriptions.Item label="Fixed">
                        {selectedVault.fixedValue}
                      </Descriptions.Item>
                    </>
                  )}
                <Descriptions.Item label="Redeem Code">
                  {selectedVault.redeemCode}
                </Descriptions.Item>
                <Descriptions.Item label="Total Redeemed">
                  {selectedVault.totalRedeem ?? 0}
                </Descriptions.Item>
                <Descriptions.Item label="Seed">
                  {selectedVault.mnemonic}
                </Descriptions.Item>
              </Descriptions>
            </Panel>
          </StyledCollapse>
          <SmartButton
            onClick={() => handleRefeshVault()}
          >
            Refresh Vault
          </SmartButton>
        </>
      )}
    </>
  )
};

export default Vault;