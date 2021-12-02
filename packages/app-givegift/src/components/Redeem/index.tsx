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
import { postRedeem, saveRedeemAddress, saveRedeemCode } from 'src/store/redeem/actions';
import { AppContext } from 'src/store/store';
import { CreateRedeemDto } from '@abcpros/givegift-models/lib/redeem';
import { getIsGlobalLoading } from 'src/store/loading/selectors';
import { RedeemsState } from 'src/store/redeem/state';
import { getCurrentAddress, getCurrentInput, getCurrentRedeemCode } from 'src/store/redeem/selectors';
import { useSelector } from 'react-redux';

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

  const input = useAppSelector(getCurrentInput);
  const redeemInput = useSelector(getCurrentRedeemCode)
  
  redeemFormData.address = input.currentAddress;
  redeemFormData.redeemCode = input.currentRedeemCode;

  const [redeemXpiAddressError, setRedeemXpiAddressError] = useState<string | boolean>(false);

  async function submit() {
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
      redeemCode: redeemCode
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

    dispatch(saveRedeemAddress({
      currentAddress: address
    } as RedeemsState))
  }

  const handleRedeemCodeChange = e => {
    const { value, name } = e.target;
    let redeemCode = value;
    setRedeemFormData(p => ({
      ...p,
      [name]: redeemCode,
    }));

    dispatch(saveRedeemCode({
      currentRedeemCode: redeemCode
    } as RedeemsState))
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
                  value: input.currentRedeemCode
                }}
              ></FormItemRedeemCodeXpiInput>
              <div
                style={{
                  paddingTop: '12px',
                }}
              >
                <PrimaryButton
                  onClick={() => submit()}
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