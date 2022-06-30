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
import { parseAddress } from '@utils/addressMethods';
import { currency } from '@bcpros/lixi-components/components/Common/Ticker';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { postClaim, postRegisterWithClaimCode, postRegisterWithPackId, saveClaimAddress, saveClaimCode } from 'src/store/claim/actions';
import { AppContext } from 'src/store/store';
import { CreateClaimDto } from '@bcpros/lixi-models/lib/claim';
import { getIsGlobalLoading } from 'src/store/loading/selectors';
import { getCurrentAddress, getCurrentClaimCode } from 'src/store/claim/selectors';
import { useSelector } from 'react-redux';
import { getSelectedAccount } from '@store/account/selectors';
import { base58ToNumber } from '@utils/encryptionMethods';
import { Account } from '@bcpros/lixi-models/src/lib/account';

const SITE_KEY = "6Lc1rGwdAAAAABrD2AxMVIj4p_7ZlFKdE5xCFOrb";

type ClaimFormData = {
  dirty: boolean;
  claimCode: string;
  address: string;
}

const RegisterComponent: React.FC = () => {

  const isLoading = useAppSelector(getIsGlobalLoading);

  const { XPI, Wallet } = React.useContext(AppContext);

  const dispatch = useAppDispatch();

  // const { width } = useWindowDimensions();
  // Load with QR code open if device is mobile and NOT iOS + anything but safari
  const scannerSupported = false;// width < 769 && isMobile && !(isIOS && !isSafari);

  const currentAddress = useAppSelector(getCurrentAddress);
  const currentClaimCode = useSelector(getCurrentClaimCode);
  const selectedAccount: Account | undefined = useAppSelector(getSelectedAccount);

  const [claimXpiAddressError, setClaimXpiAddressError] = useState<string | boolean>(false);

  useEffect(() => {
    const loadScriptByURL = (id: string, url: string, callback: { (): void; (): void; }) => {
      const isScriptExist = document.getElementById(id);

      if (!isScriptExist) {
        let script = document.createElement("script");
        script.type = "text/javascript";
        script.src = url;
        script.id = id;
        script.onload = function () {
          if (callback) callback();
        };
        document.body.appendChild(script);
      }

      if (isScriptExist && callback) callback();
    }

    // load the script by passing the URL
    loadScriptByURL("recaptcha-key", `https://www.google.com/recaptcha/enterprise.js?render=${SITE_KEY}`, function () {
      console.info("Script loaded!");
    });

    // set the default claim address
    if (selectedAccount && selectedAccount.address && !currentAddress) {
      dispatch(saveClaimAddress(selectedAccount.address));
    }
  }, []);

  const handleOnClick = e => {
    e.preventDefault();
    let captcha = (window as any).grecaptcha.enterprise
    if (captcha) {
      captcha.ready(() => {
        captcha.execute(SITE_KEY, { action: 'submit' }).then((token: any) => {
          submit(token);
        });
      });
    }
  }

  async function submit(token) {
    if (!currentAddress || !currentClaimCode) {
      return;
    }
    else if (currentClaimCode.includes('lixi_')) {
      const claimCode = currentClaimCode.match('(?<=lixi_).*')[0];
      dispatch(postRegisterWithClaimCode({claimCode, account: selectedAccount}));
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
