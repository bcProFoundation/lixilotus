import React from 'react';

import ProfileDetail from '@components/Profile/ProfileDetail';
import DeviceProtectableComponentWrapper from '@components/Authentication/DeviceProtectableComponentWrapper';

const WalletPage = () => {
  const page = {
    id: 'cl9dvyeu30035p1vquo86sf2t',
    pageAccountId: 3,
    name: 'Mabu Store',
    title: '@mabu',
    description: 'Sell any you want',
    parentId: null,
    website: 'https://abcpay.wallet.cash',
    country: '',
    state: '',
    address: '77 Trần bình trọng, p1, gò vấp, hcm',
    createdAt: '2022-10-18T07:30:20.955Z',
    updatedAt: '2022-10-18T07:30:20.955Z',
    avatar: {
      id: 'cl9dvyczq0022p1vqpco7ve8p',
      accountId: 3,
      uploadId: 'e30d6847-4648-42f1-a971-751eed210c6e',
      lixiId: null,
      pageCoverId: null,
      pageAvatarId: 'cl9dvyeu30035p1vquo86sf2t',
      upload: {
        url: 'https://lixilotus.test/api/uploads/a0?fileId=a0b27b530a2b4cf9d1ddaab88c33292a60edbe35d6398fa6be30e6c37e80eeef.jpg'
      }
    },
    cover: {
      id: 'cl9dvwxj60014p1vqfobliq33',
      accountId: 3,
      uploadId: '9292b84f-64d7-4e11-a9c8-579f4beca089',
      lixiId: null,
      pageCoverId: 'cl9dvyeu30035p1vquo86sf2t',
      pageAvatarId: null,
      upload: {
        url: 'https://lixilotus.test/api/uploads/49?fileId=49b1460f2d12dc360c2d76ab9d59b59c193dfeff73ebe408e8cb9565246157b7.jpg'
      }
    }
  };
  return (
    <>
      <DeviceProtectableComponentWrapper>
        <ProfileDetail isMobile={false} page={page} />;
      </DeviceProtectableComponentWrapper>
    </>
  );
};

export default WalletPage;
