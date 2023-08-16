import React, { useEffect, useRef } from 'react';
import { getBurnQueue, getFailQueue } from '@store/burn';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { showToast } from '@store/toast/actions';
import { BurnForType } from '@bcpros/lixi-models/lib/burn';
import intl from 'react-intl-universal';

const useDidMountEffectNotification = (func?) => {
  const didMount = useRef(false);
  const burnQueue = useAppSelector(getBurnQueue);
  const failQueue = useAppSelector(getFailQueue);
  const dispatch = useAppDispatch();

  const getType = burnForType => {
    switch (burnForType) {
      case BurnForType.Post:
        return intl.get('burn.post');
      case BurnForType.Comment:
        return intl.get('burn.comment');
      case BurnForType.Token:
        return intl.get('burn.token');
    }
  };

  const showNotification = () => {
    if (burnQueue.length > 0) {
      dispatch(
        showToast('burn', {
          message: intl.get(`toast.burn`),
          description: burnQueue.map(burn => {
            return intl.get('account.burningList', {
              burnForType: getType(burn.burnForType),
              burnValue: burn.burnValue
            });
          })
        })
      );
    }

    if (failQueue.length > 0) {
      dispatch(
        showToast('error', {
          message: intl.get(`toast.error`),
          description: intl.get('account.insufficientBurningFunds')
        })
      );
    }
  };

  useEffect(() => {
    if (didMount.current) showNotification();
    else didMount.current = true;
  }, [burnQueue, failQueue]);
};

export default useDidMountEffectNotification;
