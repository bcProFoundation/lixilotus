import React from 'react';

import RegisterComponent from '@components/PackRegister';
import ClaimedLayout from '@components/Layout/ClaimedLayout';

const RegisterPage = () => {
  return (
    <RegisterComponent />
  );
}

RegisterPage.Layout = ({ children }) => <ClaimedLayout children={children} />

export default RegisterPage;
