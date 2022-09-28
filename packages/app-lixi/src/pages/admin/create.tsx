import React, { useEffect } from 'react';
import intl from 'react-intl-universal';

import { SmartButton } from '@components/Common/PrimaryButton';
import { WrapperPage } from '@components/Settings';
import { getSelectedAccount } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { openModal } from '@store/modal/actions';

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
      <h3>{intl.get('lixi.sectionCreateLixi')}</h3>
      <SmartButton onClick={createLixiBtn}>Create new lixi</SmartButton>
    </WrapperPage>
  );
};

export default LixiPage;
