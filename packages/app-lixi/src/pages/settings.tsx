// import Vault from '@components/Vault';
import dynamic from 'next/dynamic';
import React from 'react';

const Settings = dynamic(
  () => import('@components/Settings'),
  { ssr: false }
)

const SettingsPage = () => {
  return (
    <Settings />
  );
}

export default SettingsPage;