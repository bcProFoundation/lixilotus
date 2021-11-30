import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Spin } from 'antd';
import { isMobile, isIOS, isSafari } from 'react-device-detect';
import PrimaryButton from '@abcpros/givegift-components/components/Common/PrimaryButton';
import { CashLoadingIcon } from "@abcpros/givegift-components/components/Common/CustomIcons";
import {
  FormItemRedeemCodeXpiInput,
  FormItemWithQRCodeAddon,
} from '@abcpros/givegift-components/components/Common/EnhancedInputs';
import useWindowDimensions from '@hooks/useWindowDimensions';
import { parseAddress } from '@utils/addressMethods';
import { currency } from '@abcpros/givegift-components/components/Common/Ticker';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { postRedeem } from 'src/store/redeem/actions';
import { AppContext } from 'src/store/store';
import { CreateRedeemDto } from '@abcpros/givegift-models/lib/redeem';
import { getIsGlobalLoading } from 'src/store/loading/selectors';

const SITE_KEY = "6LdLk2odAAAAAGeveKLLu5ATP907kNbbltnz5QiQ";

type RedeemFormData = {
  dirty: boolean;
  redeemCode: string;
  address: string;
}

const RedeemComponent: React.FC = () => {

  const isLoading = useAppSelector(getIsGlobalLoading);

  const { XPI } = React.useContext(AppContext);

  const dispatch = useAppDispatch();

  const { width } = useWindowDimensions();
  // Load with QR code open if device is mobile and NOT iOS + anything but safari
  const scannerSupported = width < 769 && isMobile && !(isIOS && !isSafari);

  const [redeemFormData, setRedeemFormData] = useState({
    dirty: true,
    redeemCode: '',
    address: ''
  } as RedeemFormData);

  const [redeemXpiAddressError, setRedeemXpiAddressError] = useState<string | boolean>(false);

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
    loadScriptByURL("recaptcha-key", `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`, function () {
      console.info("Script loaded!");
    });
  }, []);

  const handleOnClick = e => {
    e.preventDefault();
    var grecaptcha = (window as any).grecaptcha
    if (grecaptcha) {
      grecaptcha.ready(() => {
        grecaptcha.execute(SITE_KEY, { action: 'submit' }).then((token: any) => {
          submit(token);
        });
      });
    }
  }

  async function submit(token) {
    setRedeemFormData({
      ...redeemFormData,
      dirty: false
    });

    if (
      !redeemFormData.address ||
      !redeemFormData.redeemCode
    ) {
      return;
    }

    const { address, redeemCode } = redeemFormData;

    // Get the param-free address
    let cleanAddress = address.split('?')[0];

    const isValidAddress = XPI.Address.isXAddress(cleanAddress);

    if (!isValidAddress) {
      const error = `Destination is not a valid ${currency.ticker} address`;
      setRedeemXpiAddressError(error);
    }

    dispatch(postRedeem({
      redeemAddress: address,
      redeemCode: redeemCode,
      captchaToken: token,
    } as CreateRedeemDto));

  }

  const handleAddressChange = e => {
    const { value, name } = e.target;
    let error: boolean | string = false;
    let addressString: string = value;

    // parse address
    const addressInfo = parseAddress(XPI, addressString);
    const { address, isValid } = addressInfo;

    // Is this valid address?
    if (!isValid) {
      error = `Invalid ${currency.ticker} address`;
      setRedeemXpiAddressError(error);
    }

    // Set address field to user input
    setRedeemFormData(p => ({
      ...p,
      [name]: value,
    }));
  }

  const handleRedeemCodeChange = e => {
    const { value, name } = e.target;
    let redeemCode = value;
    setRedeemFormData(p => ({
      ...p,
      [name]: redeemCode,
    }));
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
              <FormItemWithQRCodeAddon
                style={{
                  margin: '0 0 20px 0'
                }}
                loadWithCameraOpen={scannerSupported}
                validateStatus={redeemXpiAddressError ? 'error' : ''}
                help={redeemXpiAddressError ? redeemXpiAddressError : ''}
                onScan={result =>
                  handleAddressChange({
                    target: {
                      name: 'address',
                      value: result,
                    },
                  })
                }
                inputProps={{
                  placeholder: `${currency.ticker} Address`,
                  name: 'address',
                  onChange: e => handleAddressChange(e),
                  required: true,
                  value: redeemFormData.address,
                }}
              ></FormItemWithQRCodeAddon>
              <FormItemRedeemCodeXpiInput
                inputProps={{
                  onChange: e => handleRedeemCodeChange(e),
                }}
              ></FormItemRedeemCodeXpiInput>
              <div
                style={{
                  paddingTop: '12px',
                }}
              >
                <PrimaryButton
                  onClick={handleOnClick}
                >Redeem</PrimaryButton>
              </div>
            </Form>
          </Spin>
        </Col>
      </Row>
    </>
  )
};

export default RedeemComponent;