import * as React from 'react';
import intl from 'react-intl-universal';
import { CashLoader } from './CustomIcons';
import { AlertMsg } from './Atoms';

const ApiError = () => {
  return (
    <>
      <AlertMsg>
        <b>{intl.get('claim.ConnectionLost')}</b>
        <br /> {intl.get('claim.ReEstablishing')}
      </AlertMsg>
      <CashLoader />
    </>
  );
};

export default ApiError;
