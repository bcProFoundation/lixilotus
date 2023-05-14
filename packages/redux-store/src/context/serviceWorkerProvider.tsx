import usePushNotification from '@hooks/usePushNotification';
import { useAppDispatch } from '@store/hooks';
import { subscribeAll } from '@store/webpush';
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
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && (window as any).workbox !== undefined) {
      navigator.serviceWorker.ready.then((reg: ServiceWorkerRegistration) => {
        // Set the registration object in the context
        setRegistration(reg);
        navigator.serviceWorker.onmessage = (event) => {
          console.log('onmessage', event);
          if (event && (event as any).command === 'pushsubscriptionchange') {
            dispatch(subscribeAll({ interactive: false, clientAppId: process.env.WEBPUSH_CLIENT_APP_ID }))
          }
        }
      });
    }
  }, []);

  return <ServiceWorkerContext.Provider value={{ registration, turnOnWebPushNotification, turnOffWebPushNotification }}>{children}</ServiceWorkerContext.Provider>;
};
