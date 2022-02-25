import styled, { DefaultTheme } from 'styled-components';
import { GiftOutlined, WalletOutlined, DeleteOutlined, MoreOutlined, LockOutlined } from '@ant-design/icons';
import { LockVaultCommand, UnlockVaultCommand, Vault, WithdrawVaultCommand } from '@abcpros/givegift-models/lib/vault';
import { lockVault, selectVault, unlockVault, withdrawVault } from 'src/store/vault/actions';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { Button, Dropdown, Menu } from 'antd';
import { getSelectedAccount } from 'src/store/account/selectors';
import { fromSmallestDenomination } from '@utils/cashMethods';

const VaultIcon = styled.div`
  height: 32px;
  width: 32px;
  position: relative;
`;

const GiftIcon = styled(GiftOutlined)`
  color: ${props => props.theme.secondary}
`;

const WalletIcon = styled(WalletOutlined)`
  position: absolute;
  left: 0px;
  top: 50%;
  transform: translateY(-50%);
`;

const LockIcon = styled(LockOutlined)`
  position: absolute;
  left: 0px;
  top: 50%;
  transform: translateY(-50%);
`;

const BalanceAndTicker = styled.div`
  font-size: 1rem;
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  border-radius: 3px;
  margin-bottom: 3px;
  box-shadow: ${props => props.theme.listItem.boxShadow};
  border: 1px solid ${props => props.theme.listItem.border};

  :hover {
      border-color: ${props => props.theme.listItem.hoverBorder};
  }
`;

const MoreIcon = styled(Button)`
  background-color: white;
  border: 0;

  :hover {
    background-color: rgb(224, 224, 224);
  }
  :focus {
    background-color: rgb(224, 224, 224);
  }
`;


type VaultListItemProps = {
  className?: string,
  vault: Vault,
  theme?: DefaultTheme;
} & React.HTMLProps<HTMLDivElement>

const VaultListItem: React.FC<VaultListItemProps> = (props: VaultListItemProps) => {

  const { vault } = props;

  const dispatch = useAppDispatch();

  const handleSelectVault = (vaultId: number) => {
    dispatch(selectVault(vaultId));
  }

  const selectedAccount = useAppSelector(getSelectedAccount);

  let options = ['Withdraw'];
  vault.status === 'active' ? options.unshift('Lock') : options.unshift('Unlock');
  const postVaultData = {
    id: vault.id,
    mnemonic: selectedAccount?.mnemonic,
    mnemonicHash: selectedAccount?.mnemonicHash
  };

  const menus = (
    options.map(option =>
      <Menu.Item key={option}>
        {option}
      </Menu.Item>
    )
  );
  const handleClickMenu = (e) => {
    e.domEvent.stopPropagation();
    if (e.key === 'Lock') {
      dispatch(lockVault(postVaultData as LockVaultCommand))
    }
    else if (e.key === 'Unlock') {
      dispatch(unlockVault(postVaultData as UnlockVaultCommand))
    }
    else if (e.key === 'Withdraw') {
      dispatch(withdrawVault(postVaultData as WithdrawVaultCommand));
    }
  };


  return (
    <Wrapper onClick={(e) => handleSelectVault(vault.id)}>
      <VaultIcon>
        {vault.status === 'active' ? <WalletIcon /> : <LockIcon />}
      </VaultIcon>
      <BalanceAndTicker>
        <strong>{vault.name}</strong>
        <br/>
        <span>({vault.redeemedNum}) {fromSmallestDenomination(vault.totalRedeem)}/{fromSmallestDenomination(vault.balance)} XPI remaining</span>
      </BalanceAndTicker>
      <Dropdown trigger={["click"]} overlay={
        <Menu onClick={(e) => handleClickMenu(e)}>
          {menus}
        </Menu>
      }>
        <MoreIcon onClick={e => e.stopPropagation()} icon={<MoreOutlined />} size="large">
        </MoreIcon>
      </Dropdown>
    </Wrapper>
  );
};

export default VaultListItem;
