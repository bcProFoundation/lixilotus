import React from 'react';

import SendComponent from '@components/Send';
import DeviceProtectableComponentWrapper from '@components/Authentication/DeviceProtectableComponentWrapper';

const SendPage = () => {
  return (
    <>
      <DeviceProtectableComponentWrapper>
        <SendComponent />
      </DeviceProtectableComponentWrapper>
    </>
  );
};

export default SendPage;
