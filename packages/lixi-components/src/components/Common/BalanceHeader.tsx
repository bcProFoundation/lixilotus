import styled from 'styled-components';
import { formatBalance } from '../../utils/cashMethods';
import { BalanceHeaderWrap } from './Atoms';

const UnitCoin = styled.span`
  color: var(--color-primary);
`;

const BalanceHeader = ({ balance, ticker }) => {
  return (
    <BalanceHeaderWrap>
      {formatBalance(balance)} <UnitCoin>{ticker}</UnitCoin>
    </BalanceHeaderWrap>
  );
};

export default BalanceHeader;
