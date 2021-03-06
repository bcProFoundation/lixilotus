import _ from 'lodash';
import intl from 'react-intl-universal';
import React, { useState } from 'react';
import { Row, Col, Form, Spin } from 'antd';
import PrimaryButton from '@bcpros/lixi-components/components/Common/PrimaryButton';
import { CashLoadingIcon } from '@bcpros/lixi-components/components/Common/CustomIcons';
import { FormItemClaimCodeXpiInput } from '@bcpros/lixi-components/components/Common/EnhancedInputs';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getIsGlobalLoading } from 'src/store/loading/selectors';
import { getSelectedAccount } from '@store/account/selectors';
import { Account } from '@bcpros/lixi-models/src/lib/account';
import { registerLixiPack, registerLixiPackFailure } from '@store/lixi/actions';
import { RegisterLixiPackCommand } from '@bcpros/lixi-models';

const RegisterComponent: React.FC = () => {
  const isLoading = useAppSelector(getIsGlobalLoading);
  const dispatch = useAppDispatch();
  const [currentClaimCode, setCurrentClaimCode] = useState('');
  const selectedAccount: Account | undefined = useAppSelector(getSelectedAccount);

  const handleOnClick = e => {
    e.preventDefault();
    submit();
  };

  async function submit() {
    if (!currentClaimCode) {
      return;
    } else if (currentClaimCode.includes('lixi_')) {
      const claimCode = currentClaimCode.match('(?<=lixi_).*')[0];
      const dataApi: RegisterLixiPackCommand = {
        claimCode,
        account: selectedAccount
      };
      dispatch(registerLixiPack(dataApi));
    } else {
      dispatch(registerLixiPackFailure());
    }
    setCurrentClaimCode('');
  }

  const handleClaimCodeChange = e => {
    const { value, name } = e.target;
    let claimCode: string = _.trim(value);
    setCurrentClaimCode(claimCode);
  };

  return (
    <>
      <Row
        style={{
          display: 'flex'
        }}
      >
        <Col span={24}>
          <Spin spinning={isLoading} indicator={CashLoadingIcon}>
            <Form
              style={{
                width: 'auto'
              }}
            >
              <FormItemClaimCodeXpiInput
                loadWithCameraOpen={false}
                onScan={result =>
                  handleClaimCodeChange({
                    target: {
                      name: 'claimCode',
                      value: result
                    }
                  })
                }
                inputProps={{
                  onChange: e => handleClaimCodeChange(e),
                  value: currentClaimCode
                }}
              ></FormItemClaimCodeXpiInput>
              <div
                style={{
                  paddingTop: '12px'
                }}
              >
                <PrimaryButton onClick={handleOnClick}>{intl.get('register.register')}</PrimaryButton>
              </div>
            </Form>
          </Spin>
        </Col>
      </Row>
    </>
  );
};

export default RegisterComponent;
