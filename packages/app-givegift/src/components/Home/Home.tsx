import { BalanceBanner } from "@abcpros/givegift-components/components";
import MyGivingInfo from "./MyGivingInfo";

const Home = () => {
  // const ContextValue = React.useContext(WalletContext);
  // const { wallet, previousWallet, loading } = ContextValue;

  return (
    <>
      <BalanceBanner title='My Giving' />
      <MyGivingInfo />
    </>
  )
};

export default Home;