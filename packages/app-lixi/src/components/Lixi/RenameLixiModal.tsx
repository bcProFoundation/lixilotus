import { Form, Input, Modal } from 'antd';
import intl from 'react-intl-universal';
import * as _ from 'lodash';
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { closeModal } from '@store/modal/actions';
import { refreshLixiList } from '@store/account/actions';
import { Lixi } from '@bcpros/lixi-models';
import { ProfileFilled } from '@ant-design/icons';
import { AntdFormWrapper } from '@components/Common/EnhancedInputs';
import { AnyAction } from '@reduxjs/toolkit';
import { getSelectedAccount } from '@store/account/selectors';

export type RenameLixiModalProps = {
  lixi: Lixi;
  onOkAction?: AnyAction;
  classStyle?: string;
};

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
  };

  const handleOnCancel = () => {
    dispatch(closeModal());
  };

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
        className={`${props?.classStyle}`}
        title={`${intl.get('lixi.renameLixi')} ${lixi.name}`}
        open={true}
        onOk={handleOnOk}
        onCancel={handleOnCancel}
      >
        <AntdFormWrapper>
          <Form style={{ width: 'auto' }}>
            <Form.Item
              validateStatus={newLixiNameIsValid === null || newLixiNameIsValid ? '' : 'error'}
              help={newLixiNameIsValid === null || newLixiNameIsValid ? '' : intl.get('lixi.lixiLengthError')}
            >
              <Input
                prefix={<ProfileFilled />}
                placeholder={intl.get('lixi.enterNewLixiName')}
                name="newName"
                value={newLixiName}
                onChange={e => handleLixiNameInput(e)}
              />
            </Form.Item>
          </Form>
        </AntdFormWrapper>
      </Modal>
    </>
  );
};
