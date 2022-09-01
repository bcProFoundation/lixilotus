import React, { useEffect } from 'react';
import { Statistic } from 'antd';
import { useRouter } from 'next/router';

const { Countdown } = Statistic;

const CallbackComponent = props => {
  const { statusCode } = props;
  const TIMEOUT = 5000;
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push('/');
    }, TIMEOUT);
  }, []);
  return (
    <>
      {statusCode == 200 ? (
        <>
          <h1>Login successfully!</h1>
          <Countdown title="Redirecting in: " value={Date.now() + TIMEOUT} format="s" />
        </>
      ) : (
        <>
          <h1>No authorization code found</h1>
        </>
      )}
    </>
  );
};

export default CallbackComponent;
