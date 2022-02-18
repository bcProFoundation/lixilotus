// import Vault from '@components/Vault';
import RedeemComponent from '@components/Redeem';
import dynamic from 'next/dynamic';
import React from 'react';

// const Redeem = dynamic(
//   () => import('@components/Redeem'),
//   { ssr: false }
// )

const RedeemPage = () => {
  return (
    <RedeemComponent />
  );
}

export default RedeemPage;