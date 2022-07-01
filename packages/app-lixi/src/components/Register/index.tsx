import _ from 'lodash';
import intl from 'react-intl-universal';
import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Spin } from 'antd';
import { isMobile, isIOS, isSafari } from 'react-device-detect';
import PrimaryButton from '@bcpros/lixi-components/components/Common/PrimaryButton';
import { CashLoadingIcon } from "@bcpros/lixi-components/components/Common/CustomIcons";
import {
  FormItemClaimCodeXpiInput,
  FormItemWithQRCodeAddon
} from '@bcpros/lixi-components/components/Common/EnhancedInputs';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { saveClaimCode } from 'src/store/claim/actions';
import { AppContext } from 'src/store/store';
import { CreateClaimDto } from '@bcpros/lixi-models/lib/claim';
import { getIsGlobalLoading } from 'src/store/loading/selectors';
import { getCurrentAddress, getCurrentClaimCode } from 'src/store/claim/selectors';
import { useSelector } from 'react-redux';
import { getSelectedAccount } from '@store/account/selectors';
import { base58ToNumber } from '@utils/encryptionMethods';
import { Account } from '@bcpros/lixi-models/src/lib/account';
import { registerLixiPack, registerLixiPackFailure } from '@store/lixi/actions';
import { RegisterLixiPackCommand } from '@bcpros/lixi-models';
import { getCurrentClaimCodeRegister } from '@store/register/selectors';

const RegisterComponent: React.FC = () => {

  const isLoading = useAppSelector(getIsGlobalLoading);
  const dispatch = useAppDispatch();
  const currentClaimCode = useSelector(getCurrentClaimCodeRegister);
  const selectedAccount: Account | undefined = useAppSelector(getSelectedAccount);



  const handleOnClick = e => {
    e.preventDefault();
    submit();
  }

  async function submit() {
    console.log('abc');
    if (!currentClaimCode) {
      console.log('return');
      return;
    }
    else if (currentClaimCode.includes('lixi_')) {
      const claimCode = currentClaimCode.match('(?<=lixi_).*')[0];
      const dataApi: RegisterLixiPackCommand = {
        claimCode,
        account: selectedAccount
      };
      dispatch(registerLixiPack(dataApi));
    }
    else{
      dispatch(registerLixiPackFailure());
    }
  }

  const handleClaimCodeChange = e => {
    const { value, name } = e.target;
    let claimCode: string = _.trim(value);
    dispatch(saveClaimCode(claimCode));
  }

  return (
    <>
      <Row style={{
        display: 'flex'
      }}>
        <Col span={24}>
          <Spin spinning={isLoading} indicator={CashLoadingIcon}>
            <Form
              style={{
                width: 'auto',
              }}
            >
              <FormItemClaimCodeXpiInput
                loadWithCameraOpen={false}
                onScan={result =>
                  handleClaimCodeChange({
                    target: {
                      name: 'claimCode',
                      value: result,
                    },
                  })
                }
                inputProps={{
                  onChange: e => handleClaimCodeChange(e),
                  value: currentClaimCode
                }}
              ></FormItemClaimCodeXpiInput>
              <div
                style={{
                  paddingTop: '12px',
                }}
              >
                <PrimaryButton
                  onClick={handleOnClick}
                >{intl.get('register.register')}</PrimaryButton>
              </div>
            </Form>
          </Spin>
        </Col>
      </Row>
    </>
  )
};

export default RegisterComponent;
