import React from 'react';
import OAuth2Login from 'react-simple-oauth2-login';

const LoginComponent = () => {
  const onSuccess = response => console.log(response);
  const onFailure = response => console.error(response);

  return (
    <>
      <h1>Login</h1>
      <OAuth2Login
        authorizationUrl="http://accounts.localhost:4210/oauth2/confirmation"
        responseType="code"
        clientId="0485a20d-74d5-46ea-80ac-51a603319d19"
        redirectUri="https://lixilotus.test/callback"
        scope="openid roles"
        onSuccess={onSuccess}
        onFailure={onFailure}
      />
    </>
  );
};

export default LoginComponent;
