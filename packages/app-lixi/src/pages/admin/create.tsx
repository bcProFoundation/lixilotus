import React from 'react';

import CreateLixiForm from '@components/Lixi/CreateLixiForm';
import { useAppSelector } from '@store/hooks';
import { getSelectedAccount } from '@store/account/selectors';

const LixiPage = () => {
  const selectedAccount = useAppSelector(getSelectedAccount);

  return <CreateLixiForm account={selectedAccount} />;
};

export default LixiPage;
