import { Form, Input, Modal } from 'antd';
import intl from 'react-intl-universal';
import * as _ from 'lodash';
import React, { useState } from 'react';
import { useAppDispatch } from '@store/hooks';
import { closeModal } from '@store/modal/actions';

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
    location.reload();
  };

  const handleOnCancel = () => {
    dispatch(closeModal());
  };

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
        title={`${intl.get('settings.enterAccountName')} ${account.name}`}
        className={`${props?.classStyle}`}
        open={true}
        onOk={handleOnOk}
        onCancel={handleOnCancel}
      >
        <AntdFormWrapper>
          <Form style={{ width: 'auto' }}>
            <Form.Item
              validateStatus={newAccountNameIsValid === null || newAccountNameIsValid ? '' : 'error'}
              help={
                newAccountNameIsValid === null || newAccountNameIsValid ? '' : intl.get('settings.accountLengthMessage')
              }
            >
              <Input
                prefix={<ProfileFilled />}
                placeholder={intl.get('settings.enterAccountName')}
                name="newName"
                value={newAccountName}
                onChange={e => handleAccountNameInput(e)}
              />
            </Form.Item>
          </Form>
        </AntdFormWrapper>
      </Modal>
    </>
  );
};
