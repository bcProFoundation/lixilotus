import _ from 'lodash';
import intl from 'react-intl-universal';
import React, { useState } from 'react';
import { Row, Col, Form, Spin } from 'antd';
import PrimaryButton from '@bcpros/lixi-components/components/Common/PrimaryButton';
import { CashLoadingIcon } from '@bcpros/lixi-components/components/Common/CustomIcons';
import {
  FormItemClaimCodeXpiInput,
  FormItemRegistrantAddressInput
} from '@bcpros/lixi-components/components/Common/EnhancedInputs';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getIsGlobalLoading } from 'src/store/loading/selectors';
import { getSelectedAccount } from '@store/account/selectors';
import { Account } from '@bcpros/lixi-models/src/lib/account';
import { registerLixiPack, registerLixiPackFailure } from '@store/lixi/actions';
import { RegisterLixiPackCommand } from '@bcpros/lixi-models';
import { WrapperPage } from '@components/Settings';

const RegisterComponent: React.FC = () => {
  const selectedAccount: Account | undefined = useAppSelector(getSelectedAccount);
  const isLoading = useAppSelector(getIsGlobalLoading);
  const dispatch = useAppDispatch();

  const [currentClaimCode, setCurrentClaimCode] = useState('');
  const [newRegistrantAddress, setNewRegistrantAddress] = useState('');

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
        account: selectedAccount,
        registrant: newRegistrantAddress
      };
      dispatch(registerLixiPack(dataApi));
      setCurrentClaimCode('');
    } else {
      const dataApi: RegisterLixiPackCommand = {
        claimCode: currentClaimCode,
        account: selectedAccount,
        registrant: newRegistrantAddress
      };
      dispatch(registerLixiPack(dataApi));
      setCurrentClaimCode('');
    }
  }

  const handleClaimCodeChange = e => {
    const { value, name } = e.target;
    let claimCode: string = _.trim(value);
    setCurrentClaimCode(claimCode);
  };

  const handleRegistrantAddressChange = e => {
    const { value, name } = e.target;
    let registrantAddress: string = _.trim(value);
    setNewRegistrantAddress(registrantAddress);
  };

  return (
    <>
      <WrapperPage>
        <Row
          style={{
            display: 'flex'
          }}
        >
          <Col span={24}>
            <Spin spinning={isLoading} indicator={CashLoadingIcon}>
              <h3 style={{ marginBottom: '1rem', textTransform: 'uppercase' }}>Register Pack</h3>
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
                <FormItemRegistrantAddressInput
                  loadWithCameraOpen={false}
                  onScan={result =>
                    handleRegistrantAddressChange({
                      target: {
                        name: 'registrantAddress',
                        value: result
                      }
                    })
                  }
                  inputProps={{
                    onChange: e => handleRegistrantAddressChange(e),
                    value: newRegistrantAddress
                  }}
                ></FormItemRegistrantAddressInput>
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
      </WrapperPage>
    </>
  );
};

export default RegisterComponent;
