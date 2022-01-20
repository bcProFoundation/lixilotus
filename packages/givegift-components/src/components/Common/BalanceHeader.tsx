import { formatBalance } from '../../utils/cashMethods';
import { BalanceHeaderWrap } from './Atoms';

const BalanceHeader = ({ balance, ticker }) => {
  return (
    <BalanceHeaderWrap>
      {formatBalance(balance)} {ticker}
    </BalanceHeaderWrap>
  );
};

export default BalanceHeader;
