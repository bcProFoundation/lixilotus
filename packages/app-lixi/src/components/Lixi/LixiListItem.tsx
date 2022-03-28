import styled, { DefaultTheme } from 'styled-components';
import { GiftOutlined, WalletOutlined, DeleteOutlined, MoreOutlined, LockOutlined } from '@ant-design/icons';
import { LockLixiCommand, UnlockLixiCommand, Lixi, WithdrawLixiCommand,RenameLixiCommand } from '@bcpros/lixi-models/lib/lixi';

import { lockLixi, renameLixi, selectLixi, unlockLixi, withdrawLixi } from 'src/store/lixi/actions';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { Button, Dropdown, Menu } from 'antd';
import { getSelectedAccount } from 'src/store/account/selectors';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { RenameLixiModalProps } from './RenameLixiModal';
import { openModal } from '@store/modal/actions';

const LixiIcon = styled.div`
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


type LixiListItemProps = {
  className?: string,
  lixi: Lixi,
  theme?: DefaultTheme;
} & React.HTMLProps<HTMLDivElement>

const LixiListItem: React.FC<LixiListItemProps> = (props: LixiListItemProps) => {

  const { lixi } = props;

  const dispatch = useAppDispatch();

  const handleSelectLixi = (lixiId: number) => {
    dispatch(selectLixi(lixiId));
  }

  const selectedAccount = useAppSelector(getSelectedAccount);

  let options = ['Withdraw','Rename'];
  lixi.status === 'active' ? options.unshift('Lock') : options.unshift('Unlock');
  const postLixiData = {
    id: lixi.id,
    mnemonic: selectedAccount?.mnemonic,
    mnemonicHash: selectedAccount?.mnemonicHash
  };

  const showPopulatedRenameLixiModal = (lixi: Lixi) => {
    const command: RenameLixiCommand = {
      id: lixi.id,
      name: lixi.name,
      mnemonic: selectedAccount?.mnemonic,
      mnemonicHash: selectedAccount?.mnemonicHash
    };
    const renameLixiModalProps: RenameLixiModalProps = {
      lixi: lixi,
      onOkAction: renameLixi(command)
    };
    dispatch(openModal('RenameLixiModal', renameLixiModalProps));
  }

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
      dispatch(lockLixi(postLixiData as LockLixiCommand))
    }
    else if (e.key === 'Unlock') {
      dispatch(unlockLixi(postLixiData as UnlockLixiCommand))
    }
    else if (e.key === 'Withdraw') {
      dispatch(withdrawLixi(postLixiData as WithdrawLixiCommand));
    }
    else if (e.key === 'Rename') {
      showPopulatedRenameLixiModal(lixi as Lixi)
    }
  };


  return (
    <Wrapper onClick={(e) => handleSelectLixi(lixi.id)}>
      <LixiIcon>
        {lixi.status === 'active' ? <WalletIcon /> : <LockIcon />}
      </LixiIcon>
      <BalanceAndTicker>
        <strong>{lixi.name}</strong>
        <br/>
        <span>({lixi.claimedNum}) {fromSmallestDenomination(lixi.totalClaim)}/{fromSmallestDenomination(lixi.balance)} XPI remaining</span>
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

export default LixiListItem;
