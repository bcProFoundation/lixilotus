import { Spin } from "antd";
import { Account } from "@abcpros/givegift-models/lib/account";
import { useAppSelector } from "src/store/hooks";
import { getIsGlobalLoading } from "src/store/loading/selectors";
import { CashLoadingIcon } from "@abcpros/givegift-components/components/Common/CustomIcons";
import AccountListItem from "./AccountListItem";

type AccountListProps = {
  accounts: Account[];
};

const VaultList = ({ accounts }: AccountListProps) => {

  const isLoading = useAppSelector(getIsGlobalLoading);

  return (
    <>
      <Spin spinning={isLoading} indicator={CashLoadingIcon}>
        <div style={{ paddingTop: '20px' }}>
          {accounts && accounts.length > 0 &&
            accounts.map(item => (
              <AccountListItem
                key={item.id}
                account={item}
              />
            ))
          }
        </div>
      </Spin>
    </>
  );
};

export default VaultList;