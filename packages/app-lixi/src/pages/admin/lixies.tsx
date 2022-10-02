import React from 'react';

import Lixi from '@components/Lixi';
import LixiList from '@components/Lixi/LixiList';
import { getLixiesBySelectedAccount } from '@store/lixi/selectors';
import { useAppSelector } from '@store/hooks';

const LixiesPage = () => {
  const lixies = useAppSelector(getLixiesBySelectedAccount);
  return <LixiList lixies={lixies} />;
};

export default LixiesPage;
