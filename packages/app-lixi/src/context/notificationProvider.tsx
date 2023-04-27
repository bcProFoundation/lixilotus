// PushNotification Context
import usePushNotification, { DeviceNotificationValue } from '../hooks/usePushNotification';
import React, { createContext } from 'react';

export const PushNotificationContext = createContext<DeviceNotificationValue | undefined>(undefined);
export const PushNotificationProvider = ({ children }) => {
  // usePushNotification returns null if Push Notification is not supported
  const pushNotification = usePushNotification();
  return <PushNotificationContext.Provider value={pushNotification}>{children}</PushNotificationContext.Provider>;
};
