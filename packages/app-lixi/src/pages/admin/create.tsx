import React, { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getSelectedAccount } from '@store/account/selectors';
import { openModal } from '@store/modal/actions';
import { WrapperPage } from '@components/Settings';
import { SmartButton } from '@components/Common/PrimaryButton';

const LixiPage = () => {
  const selectedAccount = useAppSelector(getSelectedAccount);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(openModal('CreateLixiFormModal', { account: selectedAccount }));
  }, []);

  const createLixiBtn = () => {
    dispatch(openModal('CreateLixiFormModal', { account: selectedAccount }));
  };
  return (
    <WrapperPage>
      <h3>Section create new lixi</h3>
      <SmartButton onClick={createLixiBtn}>Create new lixi</SmartButton>
    </WrapperPage>
  );
};

export default LixiPage;
