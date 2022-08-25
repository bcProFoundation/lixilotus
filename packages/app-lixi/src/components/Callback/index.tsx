import React, { useEffect } from 'react';
import { Statistic } from 'antd';

const { Countdown } = Statistic;

const CallbackComponent = props => {
  const { statusCode } = props;
  const TIMEOUT = 5000;

  useEffect(() => {
    setTimeout(() => {
      window.close();
    }, TIMEOUT);
  }, []);
  return (
    <>
      {statusCode == 200 ? (
        <>
          <h1>Login successfully!</h1>
          <Countdown title="Tab closing in: " value={Date.now() + TIMEOUT} format="s" />
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
