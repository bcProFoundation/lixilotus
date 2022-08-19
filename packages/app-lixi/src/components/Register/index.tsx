import React from 'react';
import { Form, Input, Button } from 'antd';
import intl from 'react-intl-universal';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { RegisterViaEmailNoVerifiedCommand } from '@bcpros/lixi-models';
import { useAppDispatch } from '@store/hooks';
import { registerViaEmailNoVerified } from '@store/account/actions';

const RegisterComponent = () => {
	const {
		handleSubmit,
		watch,
		formState: { errors },
		control
	} = useForm<RegisterViaEmailNoVerifiedCommand>();
	const dispatch = useAppDispatch()

	const onSubmit: SubmitHandler<RegisterViaEmailNoVerifiedCommand> = data => {
		dispatch(registerViaEmailNoVerified(data));
	};

	return (
		<>
			<h1>{intl.get('account.register')}</h1>

			<Form labelCol={{ span: 7 }} wrapperCol={{ span: 24 }} layout="horizontal">
				<Form.Item name="name" label="Name">
					<Controller
						name="name"
						control={control}
						rules={{
							required: {
								value: true,
								message: intl.get('account.nameRequired')
							},
						}}
						render={({ field: { onChange, onBlur, value } }) => (
							<Input onChange={onChange} onBlur={onBlur} value={value} />
						)}
					/>
				</Form.Item>
				<p>{errors.name && errors.name.message}</p>

				<Form.Item name="email" label="Email">
					<Controller
						name="email"
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
				<p>{errors.email && errors.email.message}</p>

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

				<Form.Item name="confirm-password" label="Confirm Password">
					<Controller
						name="confirmPassword"
						control={control}
						rules={{
							required: {
								value: true,
								message: intl.get('account.repeatPassword')
							},
							validate: (value: string) => {
								if (watch('password') !== value) {
									return intl.get('account.matchPassword');
								}
							}
						}}
						render={({ field: { onChange, onBlur, value } }) => (
							<Input type="password" onChange={onChange} onBlur={onBlur} value={value} />
						)}
					/>
				</Form.Item>
				<p>{errors.confirmPassword && errors.confirmPassword.message}</p>

				<Button type="primary" onClick={handleSubmit(onSubmit)}>
					{intl.get('account.register')}
				</Button>
			</Form>
		</>
	);
};

export default RegisterComponent;
