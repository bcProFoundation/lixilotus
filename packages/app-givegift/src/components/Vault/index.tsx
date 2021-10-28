import React from 'react';
import { Descriptions } from 'antd';
import { useAppSelector } from 'src/store/hooks';
import { getAllVaultsEntities, getSelectedVaultId } from 'src/store/vault/selectors';
import { QRCode } from "@abcpros/givegift-components/components/Common/QRCode";

const Vault: React.FC = () => {

  const allVaults = useAppSelector(getAllVaultsEntities);
  const selectedVaultId = useAppSelector(getSelectedVaultId);
  const selectedVault = allVaults[selectedVaultId];

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
                  <Descriptions.Item label="Default">
                    {selectedVault.fixedValue}
                  </Descriptions.Item>
                </>
              )}
            <Descriptions.Item label="Redeem Code">
              {selectedVault.redeemCode}
            </Descriptions.Item>
            <Descriptions.Item label="Seed">
              {selectedVault.mnemonic}
            </Descriptions.Item>
          </Descriptions>
        </>
      )}
    </>
  )
};

export default Vault;