import styled, { DefaultTheme } from 'styled-components';
import { UserOutlined, WalletOutlined, DeleteOutlined } from '@ant-design/icons';
import { Account } from '@bcpros/lixi-models/lib/account';
import { useAppDispatch } from 'src/store/hooks';
import { selectAccount } from 'src/store/account/actions';

const AccountIcon = styled.div`
  height: 32px;
  width: 32px;
  position: relative;
`;

const UserIcon = styled(UserOutlined)`
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

const DeleteIcon = styled(DeleteOutlined);

type AccountListItemProps = {
  account: Account;
  theme?: DefaultTheme;
} & React.HTMLProps<HTMLDivElement>;

const LixiListItem: React.FC<AccountListItemProps> = (props: AccountListItemProps) => {
  const dispatch = useAppDispatch();

  const handleSelectAccount = (account: Account) => {
    dispatch(selectAccount(account.id));
  };

  const { account } = props;
  return (
    <Wrapper onClick={e => handleSelectAccount(account)}>
      <AccountIcon>
        <UserIcon />
      </AccountIcon>
      <BalanceAndTicker>
        <strong>{account.name}</strong>
      </BalanceAndTicker>
    </Wrapper>
  );
};

export default LixiListItem;
