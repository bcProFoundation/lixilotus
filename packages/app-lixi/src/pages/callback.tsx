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
  const url = `api/auth/get-token`;
  let statusCode = 200;
  if (authCode) {
    await axiosClient
      .post(url, { authCode })
      .then(response => {
        setCookie('access_token', response.headers['set-cookie'].pop().split(';')[0], {
          req,
          res,
          maxAge: 60 * 6 * 24
        });
      })
      .catch(err => {
        console.log(err.response);
        statusCode = err.response.data.statusCode;
      });
  }

  return {
    props: {
      statusCode
    }
  };
};

export default CallbackPage;
