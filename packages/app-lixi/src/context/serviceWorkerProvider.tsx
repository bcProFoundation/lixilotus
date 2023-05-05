import { createContext, useEffect, useState } from 'react';

export type ServiceWorkerValue = {
  registration?: ServiceWorkerRegistration
};

const defaultServiceWorkerValue: ServiceWorkerValue = {
  registration: null
}

export const ServiceWorkerContext = createContext<ServiceWorkerValue>(defaultServiceWorkerValue);

export const ServiceWorkerProvider = ({ children }) => {

  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && (window as any).workbox !== undefined) {
      navigator.serviceWorker.ready.then((reg: ServiceWorkerRegistration) => {
        // Set the registration object in the context
        setRegistration(reg);
      });
    }
  }, []);

  return (
    <ServiceWorkerContext.Provider value={{ registration }}>
      {children}
    </ServiceWorkerContext.Provider>
  );
};
