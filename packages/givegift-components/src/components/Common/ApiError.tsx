import * as React from 'react';
import { CashLoader } from './CustomIcons';
import { AlertMsg } from './Atoms';

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
