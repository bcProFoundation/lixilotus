
import { Redeem } from "@abcpros/givegift-models/lib/redeem";
import RedeemListItem from "./RedeemListItem";

type RedeemListProps = {
  redeems: Redeem[];
};

const RedeemList = ({ redeems }: RedeemListProps) => {

  return (
    <div style={{ paddingTop: '20px' }}>
      {redeems && redeems.length > 0 &&
        redeems.map(item => (
          <RedeemListItem
            key={item.id}
            redeem={item}
          />
        ))
      }
    </div>
  );
};

export default RedeemList;