import { Spin } from "antd";
import { useAppSelector } from "src/store/hooks";
import CreateVaultForm from "@components/Vault/CreateVaultForm";
import ImportVaultForm from "@components/Vault/ImportVaultForm";
import VaultList from "@components/Vault/VaultList";
import { getAllVaults } from "src/store/vault/selectors";
import { CashLoadingIcon } from "@abcpros/givegift-components/components/Common/CustomIcons";
import { getIsGlobalLoading } from "src/store/loading/selectors";


const Home = () => {

  const isLoading = useAppSelector(getIsGlobalLoading);
  const vaults = useAppSelector(getAllVaults);

  return (
    <>
      <Spin spinning={isLoading} indicator={CashLoadingIcon}>
        <CreateVaultForm
        />
        <ImportVaultForm
          createVault={() => { }}
        />
        <VaultList vaults={vaults} />
      </Spin>
    </>

  )
};

export default Home;