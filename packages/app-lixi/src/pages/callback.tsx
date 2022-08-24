import React from 'react';
import axiosClient from '@utils/axiosClient';
import CallbackComponent from '@components/Callback';
import { GetServerSideProps } from 'next'

const CallbackPage = ({ token }) => {
   return <CallbackComponent accessToken={token} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {

   const authCode = context.query.code
   const url = `api/auth/get-token`;
   let token = null
   if (authCode) {
      await axiosClient.post(url, { authCode }).then((res) => {
         console.log(res.headers);
         context.res.setHeader('set-cookie', res.headers['set-cookie']);
         token = res.data;
      }).catch((err) => {
         console.log(err.response);
      })
   }

   // context.res.setHeader('set-cookie',)

   return {
      props: {
         token
      },
   }
}

export default CallbackPage;
