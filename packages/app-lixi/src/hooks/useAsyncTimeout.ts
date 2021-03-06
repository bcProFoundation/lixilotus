import { useEffect, useRef } from 'react';

const useAsyncTimeout = (callback, delay) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    let id: NodeJS.Timeout | null = null;
    const tick = () => {
      const promise = savedCallback.current();

      if (promise instanceof Promise) {
        promise.then(() => {
          id = setTimeout(tick, delay);
        });
      } else {
        id = setTimeout(tick, delay);
      }
    };

    if (id !== null) {
      id = setTimeout(tick, delay);
      return () => clearTimeout(id as NodeJS.Timeout);
    } else {
      tick();
      return;
    }
  }, [delay]);
};

export default useAsyncTimeout;
