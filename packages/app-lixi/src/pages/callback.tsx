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
  const url = `/oauth2/token`;
  let statusCode = 200;
  if (authCode) {
    await axiosClient
      .post(url, {
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: process.env.NEXT_PUBLIC_LIXI_CALLBACK,
        client_id: process.env.NEXT_LIXI_CLIENT_ID,
        client_secret: process.env.NEXT_LIXI_CLIENT_SECRET,
        scope: 'openid email'
      })
      .then(response => {
        const { expires_in, id_token } = response.data;
        setCookie('access_token', id_token, {
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
          req,
          res,
          maxAge: expires_in
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
