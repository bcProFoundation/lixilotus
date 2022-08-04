import React from 'react'
import { Form, Input, Button } from 'antd'
import intl from 'react-intl-universal';
import { useForm, Controller } from 'react-hook-form';

const LoginComponent = () => {
	const {
		handleSubmit,
		watch,
		formState: { errors },
		control
	} = useForm()

	const onSubmit = (data) => {
		console.log(data);
	}

	return (
		<>
			<h1>Login</h1>

			<Form
				labelCol={{ span: 7 }}
				wrapperCol={{ span: 24 }}
				layout="horizontal"
			>
				<form>
					<Form.Item
						name="email"
						label="Email"
					>
						<Controller
							name="email"
							control={control}
							rules={{
								required: {
									value: true,
									message: "Email is required *",
								},
								pattern: {
									value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
									message: "invalid email address"
								}
							}}
							render={({ field: { onChange, onBlur, value } }) => (
								<Input
									onChange={onChange}
									onBlur={onBlur}
									value={value}
								/>
							)}
						/>
					</Form.Item>
					<p>{errors.email && errors.email.message}</p>

					<Form.Item
						name="password"
						label="Password"
					>
						<Controller
							name="password"
							control={control}
							rules={{
								required: {
									value: true,
									message: "Password is required *",
								},
							}}
							render={({ field: { onChange, onBlur, value } }) => (
								<Input
									type="password"
									onChange={onChange}
									onBlur={onBlur}
									value={value}
								/>
							)}
						/>
					</Form.Item>
					<p>{errors.password && errors.password.message}</p>

					<Button type="primary" onClick={handleSubmit(onSubmit)}>
						{intl.get('account.login')}
					</Button>
				</form>
			</Form>
		</>
	)
}

export default LoginComponent