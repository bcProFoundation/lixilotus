import { Form, Input, Modal } from 'antd';
import * as _ from 'lodash';
import React, { useState } from 'react';
import { useAppDispatch,useAppSelector } from 'src/store/hooks';
import { closeModal } from 'src/store/modal/actions';
import { refreshLixiList } from '@store/account/actions';
import { Lixi } from '@bcpros/lixi-models';
import { ProfileFilled } from '@ant-design/icons';
import { AntdFormWrapper } from '@components/Common/EnhancedInputs';
import { AnyAction } from '@reduxjs/toolkit';
import { getSelectedAccount } from 'src/store/account/selectors';

export type RenameLixiModalProps = {
  lixi: Lixi;
  onOkAction?: AnyAction;
}

export const RenameLixiModal: React.FC<RenameLixiModalProps> = (props: RenameLixiModalProps) => {
  const [newLixiName, setNewLixiName] = useState('');
  const [newLixiNameIsValid, setNewLixiNameIsValid] = useState<boolean | null>(null);
  const selectedAccount = useAppSelector(getSelectedAccount);
  const dispatch = useAppDispatch();
  const { lixi } = props;

  const handleOnOk = () => {
    if (props.onOkAction) {
      // There's an action should be dispatch on ok
      // Set selected name to the clone action and dispatch
      const newAction = _.cloneDeep(props.onOkAction);
      newAction.payload.name = newLixiName;
      dispatch(newAction);
    }
    dispatch(closeModal());
  }

  const handleOnCancel = () => {
    dispatch(closeModal());
  }

  const handleLixiNameInput = e => {
    const { value } = e.target;
    // validation
    if (value && value.length && value.length < 24) {
      setNewLixiNameIsValid(true);
    } else {
      setNewLixiNameIsValid(false);
    }
    setNewLixiName(value);
  };

  return (
    <>
      <Modal
        title={`Rename Lixi ${lixi.name}`}
        visible={true}
        onOk={handleOnOk}
        onCancel={handleOnCancel}
      >
        <AntdFormWrapper>
          <Form style={{ width: 'auto' }}>
            <Form.Item
              validateStatus={
                newLixiNameIsValid === null ||
                  newLixiNameIsValid
                  ? ''
                  : 'error'
              }
              help={
                newLixiNameIsValid === null ||
                  newLixiNameIsValid
                  ? ''
                  : 'Lixi name must be a string between 1 and 24 characters long'
              }
            >
              <Input
                prefix={<ProfileFilled />}
                placeholder="Enter new lixi name"
                name="newName"
                value={newLixiName}
                onChange={e => handleLixiNameInput(e)}
              />
            </Form.Item>
          </Form>
        </AntdFormWrapper>
      </Modal>
    </>
  )
}