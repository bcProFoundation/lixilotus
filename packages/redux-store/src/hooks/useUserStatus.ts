import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import usePrevious from "./usePrevious";
import { getSelectedAccount } from '@store/account';
import { getIsServerStatusOn, userOffline, userOnline } from '@store/notification';
import { getDeviceId } from '@store/settings';
import { Account, SocketUser } from '@bcpros/lixi-models';

/**
 * Tracking user status
 */
const useUserStatus = () => {

  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const previousSelectedAccount: Account = usePrevious(selectedAccount);
  const isServerStatusOn = useAppSelector(getIsServerStatusOn);
  const deviceId = useAppSelector(getDeviceId);

  useEffect(() => {
    if (selectedAccount && deviceId) {
      if (isServerStatusOn) {
        // user will be online
        const user: SocketUser = {
          address: selectedAccount.address,
          deviceId
        };
        dispatch(userOnline(user));
        if (previousSelectedAccount) {
          dispatch(userOffline({
            address: previousSelectedAccount.address,
            deviceId
          }));
        }
      }
    }
  }, [selectedAccount, isServerStatusOn, deviceId]);
}

export default useUserStatus;