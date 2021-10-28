import { BalanceBanner } from "@abcpros/givegift-components/components";


import { useAppSelector } from "src/store/hooks";
import CreateVaultForm from "@components/Vault/CreateVaultForm";
import ImportVaultForm from "@components/Vault/ImportVaultForm";
import VaultList from "@components/Vault/VaultList";
import useXPI from "@hooks/useXPI";
import { getAllVaults } from "src/store/vault/selectors";

const Home = () => {

  const vaults = useAppSelector(getAllVaults);

  return (
    <>
      <CreateVaultForm
      />
      <ImportVaultForm
        createVault={() => { }}
      />
      <VaultList vaults={vaults} />
    </>

  )
};

export default Home;