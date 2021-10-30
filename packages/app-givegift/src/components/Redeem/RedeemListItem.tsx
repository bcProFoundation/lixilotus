import styled, { DefaultTheme } from 'styled-components';
import { Redeem } from '@abcpros/givegift-models/lib/redeem';
import { useAppDispatch } from 'src/store/hooks';
import { DollarCircleOutlined } from '@ant-design/icons';
import { fromSmallestDenomination } from '@utils/cashMethods';

const RedeemItemWrapper = styled.div`
  display: grid;
  grid-template-columns: 36px 50% 30%;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  margin-bottom: 3px;
  border-radius: 3px;
  background: ${props => props.theme.listItem.background};
  box-shadow: ${props => props.theme.listItem.boxShadow};
  border: 1px solid ${props => props.theme.listItem.border};
  :hover {
    border-color: ${props => props.theme.primary};
  }
  @media screen and (max-width: 500px) {
    grid-template-columns: 24px 50% 30%;
    padding: 12px 12px;
  }
`;

const RedeemItemIcon = styled.div`
  svg {
    width: 32px;
    height: 32px;
  }
  height: 32px;
  width: 32px;
  @media screen and (max-width: 500px) {
    svg {
      width: 24px;
      height: 24px;
    }
    height: 24px;
    width: 24px;
  }
`;

const RedeemDescription = styled.div`
  text-align: left;
  padding: 12px;
  @media screen and (max-width: 500px) {
    font-size: 0.8rem;
  }
`;

const RedeemDescriptionLabel = styled.span`
  font-weight: bold;
  color: ${props => props.theme.primary} !important;
`;

const RedeemInfo = styled.div`
  padding: 12px;
  font-size: 1rem;
  text-align: right;
  color: ${props => props.theme.primary};
  @media screen and (max-width: 500px) {
    font-size: 0.8rem;
  }
`;

const RedeemAmount = styled.div`
  padding-left: 12px;
  font-size: 0.8rem;
  @media screen and (max-width: 500px) {
    font-size: 0.6rem;
  }
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

type RedeemListItemProps = {
  redeem: Redeem,
  theme?: DefaultTheme;
} & React.HTMLProps<HTMLDivElement>

const RedeemListItem: React.FC<RedeemListItemProps> = (props: RedeemListItemProps) => {

  const handleClickRedeem = (redeem: Redeem,) => {
    const url = `https://explorer.givelotus.org/tx/${redeem.transactionId}`;
    window.open(url, '_blank');
  }

  const { redeem } = props;
  const redeemDateLocalTime = redeem.createdAt ? redeem.createdAt.toString() : '';
  const displayAmount = fromSmallestDenomination(redeem.amount);

  return (
    <RedeemItemWrapper onClick={(e) => handleClickRedeem(redeem)}>
      <RedeemItemIcon>
        <DollarCircleOutlined />
      </RedeemItemIcon>
      <RedeemDescription>
        <RedeemDescriptionLabel>Redeem</RedeemDescriptionLabel>
        <br />
        {redeemDateLocalTime}
      </RedeemDescription>
      <RedeemInfo>
        <RedeemAmount>
          {displayAmount}
          &nbsp;
          {'XPI'}
        </RedeemAmount>
      </RedeemInfo>
    </RedeemItemWrapper>
  );
};

export default RedeemListItem;