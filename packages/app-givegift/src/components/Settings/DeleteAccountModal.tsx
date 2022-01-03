import { Form, Input, Modal } from 'antd';
import * as _ from 'lodash';
import React, { useState } from 'react';
import { useAppDispatch } from 'src/store/hooks';
import { closeModal } from 'src/store/modal/actions';

import { Account } from '@abcpros/givegift-models';
import { WalletFilled } from '@ant-design/icons';
import { AntdFormWrapper } from '@components/Common/EnhancedInputs';
import { AnyAction } from '@reduxjs/toolkit';

export type DeleteAccountModalProps = {
  account: Account;
  onOkAction?: AnyAction;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = (props: DeleteAccountModalProps) => {

  const [accountDeleteValid, setAccountDeleteValid] = useState<boolean | null>(null);
  const [
    confirmationOfAccountToBeDeleted,
    setConfirmationOfAccountToBeDeleted,
  ] = useState('');
  const dispatch = useAppDispatch();
  const { account } = props;


  const handleOnOk = () => {
    if (props.onOkAction && accountDeleteValid) {
      // There's an action should be dispatch on ok
      // Set selected name to the clone action and dispatch
      const newAction = _.cloneDeep(props.onOkAction);
      dispatch(newAction);
      dispatch(closeModal());
    }
  }

  const handleOnCancel = () => {
    dispatch(closeModal());
  }

  const handleAccountToDeleteInput = e => {
    const { value } = e.target;

    if (value && value === `delete ${account.name}`) {
      setAccountDeleteValid(true);
    } else {
      setAccountDeleteValid(false);
    }
    setConfirmationOfAccountToBeDeleted(value);
  };

  return (
    <>
      <Modal
        title={`Are you sure you want to delete account "${account.name}"?`}
        visible={true}
        onOk={handleOnOk}
        onCancel={() => handleOnCancel()}
      >
        <AntdFormWrapper>
          <Form style={{ width: 'auto' }}>
            <Form.Item
              validateStatus={
                accountDeleteValid === null ||
                  accountDeleteValid
                  ? ''
                  : 'error'
              }
              help={
                accountDeleteValid === null ||
                  accountDeleteValid
                  ? ''
                  : 'Your confirmation phrase must match exactly'
              }
            >
              <Input
                prefix={<WalletFilled />}
                placeholder={`Type "delete ${account.name}" to confirm`}
                name="accountToBeDeletedInput"
                value={confirmationOfAccountToBeDeleted}
                onChange={e => handleAccountToDeleteInput(e)}
              />
            </Form.Item>
          </Form>
        </AntdFormWrapper>
      </Modal>
    </>
  )
}


