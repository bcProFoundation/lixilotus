import React from 'react';
import { Form, Input, Button } from 'antd';
import intl from 'react-intl-universal';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { useAppDispatch } from '@store/hooks';
import { verifyEmail } from '@store/account/actions';
import { LoginViaEmailCommand } from '@bcpros/lixi-models';

const LoginComponent = () => {
  const {
    handleSubmit,
    formState: { errors },
    control
  } = useForm<LoginViaEmailCommand>();
  const dispatch = useAppDispatch();
  const onSubmit: SubmitHandler<LoginViaEmailCommand> = data => {
    dispatch(verifyEmail(data));
  };

  return (
    <>
      <h1>Login</h1>
      <Form labelCol={{ span: 7 }} wrapperCol={{ span: 24 }} layout="horizontal">
        <Form.Item name="username" label="Email">
          <Controller
            name="username"
            control={control}
            rules={{
              required: {
                value: true,
                message: intl.get('account.emailRequired')
              },
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: intl.get('account.invalidEmail')
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input onChange={onChange} onBlur={onBlur} value={value} />
            )}
          />
        </Form.Item>
        <p>{errors.username && errors.username.message}</p>
        <Form.Item name="password" label="Password">
          <Controller
            name="password"
            control={control}
            rules={{
              required: {
                value: true,
                message: intl.get('account.passwordRequired')
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input type="password" onChange={onChange} onBlur={onBlur} value={value} />
            )}
          />
        </Form.Item>
        <p>{errors.password && errors.password.message}</p>
        <Button type="primary" onClick={handleSubmit(onSubmit)}>
          {intl.get('account.login')}
        </Button>
      </Form>
    </>
  );
};

export default LoginComponent;
