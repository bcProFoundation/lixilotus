import { GivingItem } from "@abcpros/givegift-components/components";

const MyGivingInfo = () => {

  const items = [
    {
      id: 1,
      description: 'Campain adoption',
      givingDate: new Date(),
      givingAmount: '30040',
      ticker: 'XPI',
      giftNumber: 6
    },
    {
      id: 2,
      description: 'Campain green plant',
      givingDate: new Date(),
      givingAmount: '1003',
      ticker: 'XPI',
      giftNumber: 9
    },
    {
      id: 3,
      description: 'Dev fund',
      givingDate: new Date(),
      givingAmount: '10607',
      ticker: 'XPI',
      giftNumber: 2
    },
    {
      id: 4,
      description: 'Faucet',
      givingDate: new Date(),
      givingAmount: '20300',
      ticker: 'XPI',
      giftNumber: 1
    },
  ]

  return (
    <div style={{ paddingTop: '20px' }}>
      {
        items.map(item => (
          <GivingItem
            key={item.id}
            description={item.description}
            givingDate={item.givingDate}
            givingAmount={item.givingAmount}
            ticker={item.ticker}
            giftNumber={item.giftNumber}
          />
        ))
      }
    </div>
  );
};

export default MyGivingInfo;