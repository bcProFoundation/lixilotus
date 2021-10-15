import React, { useState, useEffect } from 'react';
import { Row, Col, Form, notification, message, Modal, Alert } from 'antd';
import { isMobile, isIOS, isSafari } from 'react-device-detect';
import PrimaryButton, {
  SecondaryButton,
} from '@abcpros/givegift-components/components/Common/PrimaryButton';
import {
  FormItemRedeemCodeXpiInput,
  FormItemWithQRCodeAddon,
} from '@abcpros/givegift-components/components/Common/EnhancedInputs';
import useWindowDimensions from '@hooks/useWindowDimensions';
import useXPI from '@hooks/useXPI';
import { parseAddress } from '@utils/addressMethods';
import { currency } from '@abcpros/givegift-components/components/Common/Ticker';

type RedeemFormData = {
  dirty: boolean;
  value: string;
  address: string;
}

const Redeem: React.FC = () => {
  // const ContextValue = React.useContext(WalletContext);
  // const { wallet, previousWallet, loading } = ContextValue;

  const { width } = useWindowDimensions();
  // Load with QR code open if device is mobile and NOT iOS + anything but safari
  const scannerSupported = width < 769 && isMobile && !(isIOS && !isSafari);

  const [redeemFormData, setRedeemFormData] = useState({
    dirty: true,
    value: '',
    address: ''
  } as RedeemFormData);

  const [redeemXpiAddressError, setRedeemXpiAddressError] = useState<string | boolean>(false);


  // Show a confirmation modal on transactions created by populating redeem form from web page button
  const [isModalVisible, setIsModalVisible] = useState(false);


  const { getXPI } = useXPI();

  // jestBCH is only ever specified for unit tests, otherwise app will use getBCH();
  // const BCH = jestBCH ? jestBCH : getBCH();
  const XPI = getXPI();

  const showModal = () => {
    setIsModalVisible(true);
  };


  const handleOk = () => {
    setIsModalVisible(false);
    submit();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  async function submit() {
    setRedeemFormData({
      ...redeemFormData,
      dirty: false
    });

    if (
      !redeemFormData.address ||
      !redeemFormData.value ||
      Number(redeemFormData.value) <= 0
    ) {
      return;
    }

    const { address, value } = redeemFormData;

    // Get the param-free address
    let cleanAddress = address.split('?')[0];

    const isValidAddress = XPI.Address.isXAddress(cleanAddress);

    if (!isValidAddress) {
      const error = `Destination is not a valid ${currency.ticker} address`;
      setRedeemXpiAddressError(error);
    }

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
  }

  return (
    <>
      {/*@ts-ignore */}
      <Row type="flex">
        <Col span={24}>
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
            ></FormItemRedeemCodeXpiInput>
            <div
              style={{
                paddingTop: '12px',
              }}
            >
              <PrimaryButton>Redeem</PrimaryButton>
            </div>
          </Form>
        </Col>
      </Row>
    </>
  )
};

export default Redeem;