import React, { useEffect } from 'react';
import { Statistic } from 'antd';
import { useRouter } from 'next/router';
import { showToast } from '@store/toast/actions';
import { useAppDispatch } from '@store/hooks';
import intl from 'react-intl-universal';

const CallbackComponent = props => {
  const { statusCode } = props;
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (statusCode && statusCode == 200) {
      dispatch(
        showToast('success', {
          message: intl.get('account.loginSuccess'),
          duration: 5
        })
      );
      router.push('/');
    }
  }, []);
  return (
    <>
      {statusCode != 200 && (
        <>
          <h1>Login failed</h1>
        </>
      )}
    </>
  );
};

export default CallbackComponent;
