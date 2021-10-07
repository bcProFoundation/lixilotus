import * as React from 'react';
import { CashLoader } from '../';
import { AlertMsg } from '../';

const ApiError = () => {
  return (
    <>
      <AlertMsg>
        <b>API connection lost.</b>
        <br /> Re-establishing connection...
      </AlertMsg>
      <CashLoader />
    </>
  );
};

export default ApiError;
