import _ from 'lodash';
import intl from 'react-intl-universal';
import React, { useContext, useEffect, useState } from 'react';
import { Row, Col, Form, Spin } from 'antd';
import PrimaryButton from '@bcpros/lixi-components/components/Common/PrimaryButton';
import { CashLoadingIcon } from '@bcpros/lixi-components/components/Common/CustomIcons';
import {
  FormItemClaimCodeXpiInput,
  FormItemWithQRCodeAddon
} from '@bcpros/lixi-components/components/Common/EnhancedInputs';
import { parseAddress } from '@utils/addressMethods';
import { currency } from '@bcpros/lixi-components/components/Common/Ticker';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import {
  checkInformationAndClaim,
  checkInformationAndClaimNoAccount,
  postClaim,
  saveClaimAddress,
  saveClaimCode
} from '@store/claim/actions';
import { CreateClaimDto } from '@bcpros/lixi-models/lib/claim';
import { getIsGlobalLoading } from '@store/loading/selectors';
import { getCurrentAddress, getCurrentClaimCode } from '@store/claim/selectors';
import { useSelector } from 'react-redux';
import { getSelectedAccount } from '@store/account/selectors';
import styled from 'styled-components';
import { AuthorizationContext, WalletContext } from '@context/index';
import { openModal } from '@store/modal/actions';
import useAuthorization from '@components/Common/Authorization/use-authorization.hooks';
import InApp from '@utils/inapp';
import { generateAccount } from '@store/account';

const SITE_KEY = '6Lc1rGwdAAAAABrD2AxMVIj4p_7ZlFKdE5xCFOrb';

type ClaimFormData = {
  dirty: boolean;
  claimCode: string;
  address: string;
};

const RedeemCodeBox = styled.div`
  background: #fff;
  padding: 1rem;
  @media (max-width: 768px) {
    padding: 2rem 0 3rem 0;
  }
  .title-redeem-code {
    font-size: 14px;
    font-weight: 600;
    color: #333333;
    margin-bottom: 1rem;
  }
  .ant-input-affix-wrapper {
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
    border-right: 0 !important;
    .ant-input {
      height: 35px;
    }
  }
  .ant-input-group-addon {
    border: 1px solid #e2e2e2;
    border-left: none;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
    cursor: pointer;
    background-color: #ffffff !important;
    span {
      border-right-width: 0px;
    }
  }
  button {
    padding: 8px 0;
    border-radius: var(--border-radius-primary);
    margin-bottom: 0;
  }
`;
type ClaimProps = {
  isClaimFromAccount?: boolean;
  claimCodeFromURL?: string;
};

const ClaimComponent = ({ isClaimFromAccount, claimCodeFromURL }: ClaimProps) => {
  const isLoading = useAppSelector(getIsGlobalLoading);

  const Wallet = React.useContext(WalletContext);
  const { XPI } = Wallet;

  const dispatch = useAppDispatch();

  // const { width } = useWindowDimensions();
  // Load with QR code open if device is mobile and NOT iOS + anything but safari
  const scannerSupported = false; // width < 769 && isMobile && !(isIOS && !isSafari);

  const currentAddress = useAppSelector(getCurrentAddress);
  const currentClaimCode = claimCodeFromURL ?? useSelector(getCurrentClaimCode);
  const selectedAccount = useAppSelector(getSelectedAccount);
  const askAuthorization = useAuthorization();
  const authorization = useContext(AuthorizationContext);

  const [claimXpiAddressError, setClaimXpiAddressError] = useState<string | boolean>(false);
  const inapp = new InApp(navigator.userAgent || navigator.vendor);

  useEffect(() => {
    const loadScriptByURL = (id: string, url: string, callback: { (): void; (): void }) => {
      const isScriptExist = document.getElementById(id);

      if (!isScriptExist) {
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.id = id;
        script.onload = function () {
          if (callback) callback();
        };
        document.body.appendChild(script);
      }

      if (isScriptExist && callback) callback();
    };

    // load the script by passing the URL
    loadScriptByURL('recaptcha-key', `https://www.google.com/recaptcha/enterprise.js?render=${SITE_KEY}`, function () {
      console.info('Script loaded!');
    });

    // set the default claim address
    if (selectedAccount && selectedAccount.address && !currentAddress) {
      dispatch(saveClaimAddress(selectedAccount.address));
    }
  }, []);

  useEffect(() => {
    if (claimCodeFromURL) {
      dispatch(saveClaimCode(claimCodeFromURL));
    }
  }, [claimCodeFromURL]);

  const handleOnClick = e => {
    e.preventDefault();
    let captcha = (window as any).grecaptcha.enterprise;
    if (captcha) {
      captcha.ready(() => {
        captcha.execute(SITE_KEY, { action: 'submit' }).then((token: any) => {
          if (authorization.authorized) {
            const payload = {
              claimAddress: currentAddress,
              claimCode: currentClaimCode,
              captchaToken: token
            };
            dispatch(checkInformationAndClaim(payload));
          } else {
            dispatch(checkInformationAndClaimNoAccount(token));
            dispatch(generateAccount());
          }
        });
      });
    }
  };

  const handleAddressChange = e => {
    const { value, name } = e.target;
    let error: boolean | string = false;
    let addressString: string = _.trim(value);

    // parse address
    const addressInfo = parseAddress(XPI, addressString);
    const { address, isValid } = addressInfo;

    // Is this valid address?
    if (!isValid) {
      error = intl.get('claim.invalidAddress', { ticker: currency.ticker });
    } else {
      error = false;
    }
    setClaimXpiAddressError(error);

    dispatch(saveClaimAddress(address));
  };

  const handleClaimCodeChange = e => {
    const { value, name } = e.target;
    let claimCode: string = _.trim(value);
    dispatch(saveClaimCode(claimCode));
  };

  return (
    <>
      {!isClaimFromAccount && (
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
                <FormItemWithQRCodeAddon
                  style={{
                    margin: '0 0 20px 0'
                  }}
                  loadWithCameraOpen={false}
                  validateStatus={claimXpiAddressError ? 'error' : ''}
                  help={claimXpiAddressError ? claimXpiAddressError : ''}
                  onScan={result =>
                    handleAddressChange({
                      target: {
                        name: 'address',
                        value: result
                      }
                    })
                  }
                  inputProps={{
                    placeholder: intl.get('claim.tickerAddress', { ticker: currency.ticker }),
                    name: 'address',
                    onChange: e => handleAddressChange(e),
                    required: true,
                    value: currentAddress
                  }}
                ></FormItemWithQRCodeAddon>
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
                    defaultValue: currentClaimCode
                  }}
                ></FormItemClaimCodeXpiInput>
                <div
                  style={{
                    paddingTop: '12px'
                  }}
                >
                  <PrimaryButton onClick={handleOnClick}>{intl.get('claim.claim')}</PrimaryButton>
                </div>
              </Form>
            </Spin>
          </Col>
        </Row>
      )}
      {isClaimFromAccount && (
        <RedeemCodeBox className="redeem-box">
          <h3 className="title-redeem-code">{intl.get('lixi.redeemLixi')}</h3>
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
              defaultValue: currentClaimCode
            }}
          ></FormItemClaimCodeXpiInput>
          <PrimaryButton onClick={handleOnClick}>{intl.get('claim.claim')}</PrimaryButton>
        </RedeemCodeBox>
      )}
    </>
  );
};

export default ClaimComponent;
