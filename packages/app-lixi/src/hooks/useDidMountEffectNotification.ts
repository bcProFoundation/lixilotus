import React, { useEffect, useRef } from 'react';
import { getBurnQueue, getFailQueue } from '@store/burn';
import { useAppSelector } from '@store/hooks';
import { showBurnNotification } from '@components/Common/showBurnNotification';

const useDidMountEffectNotification = (func?) => {
  const didMount = useRef(false);
  const burnQueue = useAppSelector(getBurnQueue);
  const failQueue = useAppSelector(getFailQueue);

  const showNotification = () => {
    if (burnQueue.length > 0) {
      showBurnNotification('info', burnQueue);
      if (func) func();
    } else {
      showBurnNotification('success');
    }

    if (failQueue.length > 0) {
      showBurnNotification('error');
    }
  };

  useEffect(() => {
    if (didMount.current) showNotification();
    else didMount.current = true;
  }, [burnQueue, failQueue]);
};

export default useDidMountEffectNotification;
