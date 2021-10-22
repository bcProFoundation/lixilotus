import styled, { DefaultTheme } from 'styled-components';
import { GiftOutlined } from '@ant-design/icons';
import { Vault } from '@abcpros/givegift-models/lib/vault';
import { selectVault } from 'src/store/vault/actions';
import { useAppDispatch } from 'src/store/hooks';

const VaultIcon = styled.div`
  height: 32px;
  width: 32px;
`;

const GiftIcon = styled(GiftOutlined)`
  color: ${props => props.theme.secondary}
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

type VaultListItemProps = {
  vault: Vault,
  theme?: DefaultTheme;
} & React.HTMLProps<HTMLDivElement>

const VaultListItem: React.FC<VaultListItemProps> = (props: VaultListItemProps) => {

  const dispatch = useAppDispatch();

  const handleSelectVault = (vaultId: number) => {
    dispatch(selectVault(vaultId));
  }

  const { vault } = props;
  return (
    <Wrapper onClick={(e) => handleSelectVault(vault.id)}>
      <VaultIcon>
        <GiftIcon />
      </VaultIcon>
      <BalanceAndTicker>
        <strong>{vault.name}</strong>
      </BalanceAndTicker>
    </Wrapper>
  );
};

export default VaultListItem;
