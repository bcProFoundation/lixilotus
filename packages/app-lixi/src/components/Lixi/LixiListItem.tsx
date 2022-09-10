import {
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  LockOutlined,
  MoreOutlined,
  WalletOutlined
} from '@ant-design/icons';
import {
  ArchiveLixiCommand,
  ClaimType,
  Lixi,
  LixiType,
  RenameLixiCommand,
  UnarchiveLixiCommand,
  WithdrawLixiCommand
} from '@bcpros/lixi-models/lib/lixi';
import { currency } from '@components/Common/Ticker';
import { getAllSubLixies } from '@store/lixi/selectors';
import { openModal } from '@store/modal/actions';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { Button, Col, Dropdown, Menu, Row } from 'antd';
import intl from 'react-intl-universal';
import { getSelectedAccount } from 'src/store/account/selectors';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import {
  archiveLixi,
  refreshLixiSilent,
  renameLixi,
  selectLixi,
  unarchiveLixi,
  withdrawLixi
} from 'src/store/lixi/actions';
import styled, { DefaultTheme } from 'styled-components';
import { RenameLixiModalProps } from './RenameLixiModal';

const LixiIcon = styled.div`
  height: 32px;
  width: 32px;
  position: relative;
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

const LoadingIcon = styled(ClockCircleOutlined)`
  position: absolute;
  left: 0px;
  top: 50%;
  transform: translateY(-50%);
`;

const ExclamationIcon = styled(ExclamationCircleOutlined)`
  position: absolute;
  left: 0px;
  top: 50%;
  transform: translateY(-50%);
`;

const BalanceAndTicker = styled.div`
  font-size: 1rem;
`;

const Wrapper = styled.div`
  display: block;
  justify-content: space-between;
  align-items: center;
  padding: 8px 15px 15px 15px;
  border-radius: 15px;
  margin-bottom: 15px;
  text-align: left;
  border: 1px solid ${props => props.theme.listItem.border}!important;

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

const LixiNameStyled = styled(Col)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.listItem.border}!important;
`;

type LixiListItemProps = {
  className?: string;
  lixi: Lixi;
  theme?: DefaultTheme;
} & React.HTMLProps<HTMLDivElement>;

const LixiListItem: React.FC<LixiListItemProps> = (props: LixiListItemProps) => {
  const { lixi } = props;

  const dispatch = useAppDispatch();

  const handleSelectLixi = (lixiId: number) => {
    dispatch(selectLixi(lixiId));
  };

  const selectedAccount = useAppSelector(getSelectedAccount);
  const allSubLixies = useAppSelector(getAllSubLixies);

  const subLixiById = allSubLixies.filter(item => item.parentId == lixi.id);

  let options = ['Withdraw', 'Rename'];
  lixi.status === 'locked' ? options.unshift('Unarchive') : options.unshift('Archive');

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
  };

  const menus = options.map(option => <Menu.Item key={option}>{option}</Menu.Item>);

  const handleClickMenu = e => {
    e.domEvent.stopPropagation();
    switch (e.key) {
      case 'Archive':
        return dispatch(archiveLixi(postLixiData as ArchiveLixiCommand));
      case 'Unarchive':
        return dispatch(unarchiveLixi(postLixiData as UnarchiveLixiCommand));
      case 'Withdraw':
        return dispatch(withdrawLixi(postLixiData as WithdrawLixiCommand));
      case 'Rename':
        return showPopulatedRenameLixiModal(lixi as Lixi);
    }
  };

  const getLixiStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <WalletIcon />;
      case 'pending':
        return <LoadingIcon />;
      case 'locked':
        return <LockIcon />;
      case 'failed':
        return <ExclamationIcon />;
      default:
        return <WalletIcon />;
    }
  };

  const typeLixi = () => {
    switch (lixi?.lixiType) {
      case LixiType.Fixed:
        return (
          <>
            {intl.get('account.fixed')} {lixi.fixedValue} {currency.ticker}
          </>
        );
      case LixiType.Divided:
        return (
          <>
            {intl.get('lixi.dividedBy')} {lixi.dividedValue}{' '}
          </>
        );
      case LixiType.Equal:
        return (
          <>
            {intl.get('account.equal')} {lixi.amount / lixi.numberOfSubLixi} {currency.ticker}
          </>
        );
      default:
        return (
          <>
            {intl.get('account.random')} {lixi?.minValue}-{lixi?.maxValue} {currency.ticker}
          </>
        );
    }
  };

  return (
    <>
      <Wrapper>
        <Row>
          <LixiNameStyled span={24}>
            <strong>{lixi.name}</strong>
            <Dropdown trigger={['click']} overlay={<Menu onClick={e => handleClickMenu(e)}>{menus}</Menu>}>
              <MoreIcon onClick={e => e.stopPropagation()} icon={<MoreOutlined />} size="large"></MoreIcon>
            </Dropdown>
          </LixiNameStyled>
        </Row>
        <Row>
          <Col span={10}>Budget</Col>
          <Col span={8} offset={3}>
            {lixi.amount} XPI
          </Col>
        </Row>
        <Row>
          <Col span={10}>Type of code</Col>
          <Col span={8} offset={3}>
            {lixi.claimType == ClaimType.Single ? 'Single' : 'One-Time Codes'}
          </Col>
        </Row>
        <Row>
          <Col span={10}>Value per redeem</Col>
          <Col span={8} offset={3}>
            {typeLixi()}
          </Col>
        </Row>
        <Row>
          <Col span={10}>Redeemmed</Col>
          <Col span={8} offset={3}>
            {lixi.claimedNum} XPI
          </Col>
        </Row>
        <Row>
          <Col span={10}>Remaining</Col>
          <Col span={8} offset={3}>
            {lixi.claimType == ClaimType.Single ? (
              <span>{fromSmallestDenomination(lixi.balance)} XPI</span>
            ) : (
              <span>{lixi.subLixiBalance != undefined ? lixi.subLixiBalance.toFixed(2) : 0.0} XPI</span>
            )}
          </Col>
        </Row>
        <Row>
          <Col span={10}>Status</Col>
          <Col span={8} offset={3}>
            {lixi.status}
          </Col>
        </Row>
      </Wrapper>
    </>
  );
};

export default LixiListItem;
