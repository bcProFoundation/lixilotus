import { Form, Input, Modal } from 'antd';
import intl from 'react-intl-universal';
import * as _ from 'lodash';
import React from 'react';
import { useAppDispatch } from '@store/hooks';
import { closeModal } from '@store/modal/actions';
import { Controller, useForm } from 'react-hook-form';
import { Account } from '@bcpros/lixi-models';
import { ProfileFilled } from '@ant-design/icons';
import { AntdFormWrapper } from '@components/Common/EnhancedInputs';
import { AnyAction } from '@reduxjs/toolkit';

export type RenameAccountModalProps = {
  account: Account;
  onOkAction?: AnyAction;
  classStyle?: string;
};

export const RenameAccountModal: React.FC<RenameAccountModalProps> = (props: RenameAccountModalProps) => {
  const dispatch = useAppDispatch();
  const { account } = props;
  const {
    formState: { errors },
    control,
    handleSubmit
  } = useForm();

  const handleOnOk = ({ name }: { name: string }) => {
    if (props.onOkAction) {
      // There's an action should be dispatch on ok
      // Set selected name to the clone action and dispatch
      const newAction = _.cloneDeep(props.onOkAction);
      newAction.payload.name = name.trim();
      dispatch(newAction);
    }
    dispatch(closeModal());
  };

  const handleOnCancel = () => {
    dispatch(closeModal());
  };

  return (
    <>
      <Modal
        title={`${intl.get('settings.enterAccountName')} ${account.name}`}
        className={`${props?.classStyle}`}
        transitionName=""
        open={true}
        onOk={handleSubmit(handleOnOk)}
        onCancel={handleOnCancel}
      >
        <AntdFormWrapper>
          <Form style={{ width: 'auto' }}>
            <Form.Item validateStatus={!errors.name ? '' : 'error'} help={!errors.name ? '' : errors.name.message}>
              <Controller
                name="name"
                control={control}
                rules={{
                  required: {
                    value: true,
                    message: intl.get('settings.accountNameEmpty')
                  },
                  maxLength: {
                    value: 24,
                    message: intl.get('settings.accountLengthMessage')
                  }
                }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input
                    prefix={<ProfileFilled />}
                    placeholder={intl.get('settings.enterAccountName')}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
            </Form.Item>
          </Form>
        </AntdFormWrapper>
      </Modal>
    </>
  );
};
