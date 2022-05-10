import { Button, Dropdown, Menu } from 'antd';
import intl from 'react-intl-universal';
import * as _ from 'lodash';
import { getSelectedAccount } from 'src/store/account/selectors';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { lockLixi, renameLixi, selectLixi, unlockLixi, withdrawLixi } from 'src/store/lixi/actions';
import styled, { DefaultTheme } from 'styled-components';

import {
  GiftOutlined, LockOutlined, MoreOutlined, WalletOutlined
} from '@ant-design/icons';
import {
  ClaimType,
  Lixi, LockLixiCommand, RenameLixiCommand, UnlockLixiCommand, WithdrawLixiCommand
} from '@bcpros/lixi-models/lib/lixi';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { RenameLixiModalProps } from './RenameLixiModal';
import { openModal } from '@store/modal/actions';
import { getAllSubLixies } from '@store/lixi/selectors';

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
  const subLixies = useAppSelector(getAllSubLixies);

  let options = ['Withdraw', 'Rename'];
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
    switch (e.key) {
      case 'Lock':
        return dispatch(lockLixi(postLixiData as LockLixiCommand));
      case 'Unlock':
        return dispatch(unlockLixi(postLixiData as UnlockLixiCommand));
      case 'Withdraw':
        return dispatch(withdrawLixi(postLixiData as WithdrawLixiCommand));
      case 'Rename':
        return showPopulatedRenameLixiModal(lixi as Lixi)
    }
  };


  return (
    <Wrapper onClick={(e) => handleSelectLixi(lixi.id)}>
      <LixiIcon>
        {lixi.status === 'active' ? <WalletIcon /> : <LockIcon />}
      </LixiIcon>
      <BalanceAndTicker>
        <strong>{lixi.name}</strong>
        <br />
        {lixi.claimType == ClaimType.Single ?
          <span>({lixi.claimedNum}) {fromSmallestDenomination(lixi.totalClaim)}/{fromSmallestDenomination(lixi.balance)} {intl.get('lixi.remainingXPI')}</span>
          : <span>({_.size(subLixies.filter(item => item.isClaimed))}/{lixi.numberOfSubLixi}) {(_.sumBy(subLixies.filter(item => item.isClaimed), 'amount')).toFixed(2)} / {(_.sumBy(subLixies.filter(item => !item.isClaimed), 'amount')).toFixed(2)} {intl.get('lixi.remainingXPI')}</span>
        }
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
