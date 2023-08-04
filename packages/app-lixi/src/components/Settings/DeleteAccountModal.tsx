import { Form, Input, Modal } from 'antd';
import intl from 'react-intl-universal';
import * as _ from 'lodash';
import React, { useState } from 'react';
import { useAppDispatch } from '@store/hooks';
import { closeModal } from '@store/modal/actions';

import { Account } from '@bcpros/lixi-models';
import { WalletFilled } from '@ant-design/icons';
import { AntdFormWrapper } from '@components/Common/EnhancedInputs';
import { AnyAction } from '@reduxjs/toolkit';
import { selectAccount } from '@store/account/actions';

export type DeleteAccountModalProps = {
  account: Account;
  remainingAccounts?: Account[];
  onOkAction?: AnyAction;
};

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = (props: DeleteAccountModalProps) => {
  const [accountDeleteValid, setAccountDeleteValid] = useState<boolean | null>(null);
  const [confirmationOfAccountToBeDeleted, setConfirmationOfAccountToBeDeleted] = useState('');
  const dispatch = useAppDispatch();
  const { account } = props;

  const handleOnOk = () => {
    if (props.onOkAction && accountDeleteValid) {
      // There's an action should be dispatch on ok
      // Set selected name to the clone action and dispatch
      const newAction = _.cloneDeep(props.onOkAction);
      if (props.remainingAccounts.length > 0) {
        dispatch(selectAccount(props.remainingAccounts[0].id));
      }
      dispatch(newAction);
      dispatch(closeModal());
    }
  };

  const handleOnCancel = () => {
    dispatch(closeModal());
  };

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
        title={intl.get('settings.deleteAccountConfirmMessage', { account: account.name })}
        transitionName=''
        open={true}
        onOk={handleOnOk}
        onCancel={() => handleOnCancel()}
      >
        <AntdFormWrapper>
          <Form style={{ width: 'auto' }}>
            <Form.Item
              validateStatus={accountDeleteValid === null || accountDeleteValid ? '' : 'error'}
              help={
                accountDeleteValid === null || accountDeleteValid
                  ? ''
                  : intl.get('settings.yourConfirmationPhraseMustExact')
              }
            >
              <Input
                prefix={<WalletFilled />}
                placeholder={intl.get('settings.deleteAccountConfirm', { account: account.name })}
                name="accountToBeDeletedInput"
                value={confirmationOfAccountToBeDeleted}
                onChange={e => handleAccountToDeleteInput(e)}
              />
            </Form.Item>
          </Form>
        </AntdFormWrapper>
      </Modal>
    </>
  );
};
