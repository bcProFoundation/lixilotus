import { Form, Input, Modal } from 'antd';
import * as _ from 'lodash';
import React, { useState } from 'react';
import { useAppDispatch } from 'src/store/hooks';
import { closeModal } from 'src/store/modal/actions';

import { Account } from '@abcpros/givegift-models';
import { ProfileFilled } from '@ant-design/icons';
import { AntdFormWrapper } from '@components/Common/EnhancedInputs';
import { AnyAction } from '@reduxjs/toolkit';

export type RenameAccountModalProps = {
  account: Account;
  onOkAction?: AnyAction;
}

export const RenameAccountModal: React.FC<RenameAccountModalProps> = (props: RenameAccountModalProps) => {
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountNameIsValid, setNewAccountNameIsValid] = useState<boolean | null>(null);
  const dispatch = useAppDispatch();
  const { account } = props;

  const handleOnOk = () => {
    if (props.onOkAction) {
      // There's an action should be dispatch on ok
      // Set selected name to the clone action and dispatch
      const newAction = _.cloneDeep(props.onOkAction);
      newAction.payload.name = newAccountName;
      dispatch(newAction);
    }
    dispatch(closeModal());
  }

  const handleOnCancel = () => {
    dispatch(closeModal());
  }

  const handleAccountNameInput = e => {
    const { value } = e.target;
    // validation
    if (value && value.length && value.length < 24) {
      setNewAccountNameIsValid(true);
    } else {
      setNewAccountNameIsValid(false);
    }
    setNewAccountName(value);
  };

  return (
    <>
      <Modal
        title={`Rename Account ${account.name}`}
        visible={true}
        onOk={handleOnOk}
        onCancel={handleOnCancel}
      >
        <AntdFormWrapper>
          <Form style={{ width: 'auto' }}>
            <Form.Item
              validateStatus={
                newAccountNameIsValid === null ||
                  newAccountNameIsValid
                  ? ''
                  : 'error'
              }
              help={
                newAccountNameIsValid === null ||
                  newAccountNameIsValid
                  ? ''
                  : 'Account name must be a string between 1 and 24 characters long'
              }
            >
              <Input
                prefix={<ProfileFilled />}
                placeholder="Enter new account name"
                name="newName"
                value={newAccountName}
                onChange={e => handleAccountNameInput(e)}
              />
            </Form.Item>
          </Form>
        </AntdFormWrapper>
      </Modal>
    </>
  )
}