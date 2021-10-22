import { GivingItem } from "@abcpros/givegift-components/components";
import { Vault } from "@abcpros/givegift-models/lib/vault";

type VaultListProps = {
  vaults: Vault[]
};

const VaultList = ({ vaults }: VaultListProps) => {

  return (
    <div style={{ paddingTop: '20px' }}>
      {vaults && vaults.length > 0 &&
        vaults.map(item => (
          <GivingItem
            key={item.id}
            description={item.name}
            givingDate={new Date()}
            givingAmount={'0'}
            ticker={'XPI'}
            giftNumber={0}
          />
        ))
      }
    </div>
  );
};

export default VaultList;