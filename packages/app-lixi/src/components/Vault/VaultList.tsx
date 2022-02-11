import { Spin } from "antd";
import { Vault } from "@bcpros/lixi-models/lib/vault";
import { useAppSelector } from "src/store/hooks";
import { getIsGlobalLoading } from "src/store/loading/selectors";
import { CashLoadingIcon } from "@bcpros/lixi-components/components/Common/CustomIcons";
import VaultListItem from "./VaultListItem";

type VaultListProps = {
  vaults: Vault[];
};

const VaultList = ({ vaults }: VaultListProps) => {

  const isLoading = useAppSelector(getIsGlobalLoading);

  return (
    <>
      <Spin spinning={isLoading} indicator={CashLoadingIcon}>
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
      </Spin>
    </>
  );
};

export default VaultList;