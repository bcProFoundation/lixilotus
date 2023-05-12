import usePushNotification from '@hooks/usePushNotification';
import { createContext, useEffect, useState } from 'react';

export type ServiceWorkerValue = {
  registration?: ServiceWorkerRegistration;
  turnOnWebPushNotification: () => void;
  turnOffWebPushNotification: () => void;
};

const defaultServiceWorkerValue: ServiceWorkerValue = {
  registration: null,
  turnOnWebPushNotification: null,
  turnOffWebPushNotification: null
};

export const ServiceWorkerContext = createContext<ServiceWorkerValue>(defaultServiceWorkerValue);

export const ServiceWorkerProvider = ({ children }) => {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const { turnOnWebPushNotification, turnOffWebPushNotification } = usePushNotification();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && (window as any).workbox !== undefined) {
      navigator.serviceWorker.ready.then((reg: ServiceWorkerRegistration) => {
        // Set the registration object in the context
        setRegistration(reg);
      });
    }
  }, []);

  return <ServiceWorkerContext.Provider value={{ registration, turnOnWebPushNotification, turnOffWebPushNotification }}>{children}</ServiceWorkerContext.Provider>;
};
