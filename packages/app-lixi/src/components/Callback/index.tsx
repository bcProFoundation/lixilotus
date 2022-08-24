import React, { useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import intl from 'react-intl-universal';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { useAppDispatch } from '@store/hooks';
import { loginViaEmail } from '@store/account/actions';
import { LoginViaEmailCommand } from '@bcpros/lixi-models';
import OAuth2Login from 'react-simple-oauth2-login';
import { useRouter } from 'next/router'
import axios from 'axios';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const CallbackComponent = (props) => {
   const { accessToken } = props
   console.log(accessToken);
   return (
      <>
         {accessToken ?
            <>
               <h1>Login successfully!</h1>
            </> :
            <>
               <h1>No authorization code found</h1>
            </>
         }
      </>

   );
};

export default CallbackComponent;
