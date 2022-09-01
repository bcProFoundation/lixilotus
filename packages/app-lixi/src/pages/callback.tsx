import React from 'react';
import axiosClient from '@utils/axiosClient';
import CallbackComponent from '@components/Callback';
import { GetServerSideProps } from 'next';
import { setCookie } from 'cookies-next';

const CallbackPage = ({ statusCode }) => {
  return <CallbackComponent statusCode={statusCode} />;
};

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const authCode = query.code;
  const url = `/api/auth/get-token`;
  let statusCode = 200;
  if (authCode) {
    await axiosClient
      .post(url, { authCode })
      .then(response => {
        setCookie('access_token', response.data.access_token, {
          req,
          res,
          maxAge: 60 * 6 * 24,
          httpOnly: true
        });
      })
      .catch(err => {
        if (err.response) statusCode = err.response.data.statusCode;
      });
  }

  return {
    props: {
      statusCode
    }
  };
};

export default CallbackPage;
