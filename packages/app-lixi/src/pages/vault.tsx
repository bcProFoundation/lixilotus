// import Vault from '@components/Vault';
import dynamic from 'next/dynamic';
import React from 'react';

import Vault from '@components/Vault';

// const Vault = dynamic(
//   () => import('@components/Vault'),
//   { ssr: false }
// )

const VaultPage = () => {
  return (
    <Vault />
  );
}

export default VaultPage;