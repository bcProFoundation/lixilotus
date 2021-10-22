
import { Vault } from "@abcpros/givegift-models/lib/vault";
import VaultListItem from "./VaultListItem";

type VaultListProps = {
  vaults: Vault[];
};

const VaultList = ({ vaults }: VaultListProps) => {



  return (
    <div style={{ paddingTop: '20px' }}>
      {vaults && vaults.length > 0 &&
        vaults.map(item => (
          <VaultListItem
            key={item.id}
            vault={item}
          />
        ))
      }
    </div>
  );
};

export default VaultList;