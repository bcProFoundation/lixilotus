import { Claim } from '@bcpros/lixi-models/lib/claim';
import ClaimListItem from './ClaimListItem';

type ClaimListProps = {
  claims: Claim[];
};

const ClaimList = ({ claims }: ClaimListProps) => {
  return (
    <div style={{ paddingTop: '20px' }}>
      {claims && claims.length > 0 && claims.map(item => <ClaimListItem key={item.id} claim={item} />)}
    </div>
  );
};

export default ClaimList;
