import styled from 'styled-components';
import { formatBalance } from '../../utils/cashMethods';
import { BalanceHeaderWrap } from './Atoms';

const UnitCoin = styled.span`
  font-size: 16px;
  color: rgba(237, 239, 240, 0.6);
`;

const BalanceHeader = ({ balance, ticker }) => {
  return (
    <BalanceHeaderWrap>
      {formatBalance(balance)} <UnitCoin>{ticker}</UnitCoin>
    </BalanceHeaderWrap>
  );
};

export default BalanceHeader;
