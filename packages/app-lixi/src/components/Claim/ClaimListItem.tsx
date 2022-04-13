import styled, { DefaultTheme } from 'styled-components';
import intl from 'react-intl-universal';
import { Claim } from '@bcpros/lixi-models';
import { fromSmallestDenomination } from '@utils/cashMethods';
import GrayLotus from '@assets/images/gray_lotus.svg';


const ClaimItemWrapper = styled.div`
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

const ClaimItemIcon = styled.div`
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

const ClaimDescription = styled.div`
  text-align: left;
  padding: 12px;
  @media screen and (max-width: 500px) {
    font-size: 0.8rem;
  }
`;

const ClaimDescriptionLabel = styled.span`
  font-weight: bold;
  color: rgba(127, 127, 127, 0.85) !important;
`;

const ClaimInfo = styled.div`
  padding: 12px;
  font-size: 1rem;
  text-align: right;
  color: rgba(127, 127, 127, 0.85);
  @media screen and (max-width: 500px) {
    font-size: 0.8rem;
  }
`;

const ClaimAmount = styled.div`
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

export const LotusLogo = styled.span`
  opacity: 0.5;
  width: 32px;
  @media (max-width: 32px) {
    width: 32px;
  }
`;

type ClaimListItemProps = {
  claim: Claim,
  theme?: DefaultTheme;
} & React.HTMLProps<HTMLDivElement>

const ClaimListItem: React.FC<ClaimListItemProps> = (props: ClaimListItemProps) => {

  const handleClickClaim = (claim: Claim,) => {
    const url = `https://explorer.givelotus.org/tx/${claim.transactionId}`;
    window.open(url, '_blank');
  }

  const { claim } = props;
  const claimDateLocalTime = claim.createdAt ? claim.createdAt.toString() : '';
  const displayAmount = fromSmallestDenomination(claim.amount);

  return (
    <ClaimItemWrapper onClick={(e) => handleClickClaim(claim)}>
      <ClaimItemIcon>
        <LotusLogo>
          <GrayLotus />
        </LotusLogo>
      </ClaimItemIcon>
      <ClaimDescription>
        <ClaimDescriptionLabel>{intl.get('claim.claim')}</ClaimDescriptionLabel>
        <br />
        {claimDateLocalTime}
      </ClaimDescription>
      <ClaimInfo>
        <ClaimAmount>
          {displayAmount}
          &nbsp;
          {'XPI'}
        </ClaimAmount>
      </ClaimInfo>
    </ClaimItemWrapper>
  );
};

export default ClaimListItem;
