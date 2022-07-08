import React, { useEffect, useState } from 'react';
import intl from 'react-intl-universal';
import { Form, notification, message, Modal, Alert } from 'antd';
import { Row, Col } from 'antd';
import PrimaryButton from '@components/Common/PrimaryButton';
import { FormItemWithQRCodeAddon } from '@bcpros/lixi-components/components/Common/EnhancedInputs';
import { currency } from '@components/Common/Ticker';
import { shouldRejectAmountInput } from '@utils/validation';
import { ZeroBalanceHeader } from '@components/Common/Atoms';
import { AppContext } from '@store/store';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getSelectedAccount } from '@store/account/selectors';
import { SendXpiInput } from '@bcpros/lixi-components/components/Common/EnhancedInputs';
import _ from 'lodash';
import { parseAddress } from '@utils/addressMethods';
import useXPI from '@hooks/useXPI';
import BalanceHeader from '@bcpros/lixi-components/components/Common/BalanceHeader';
import { useDispatch } from 'react-redux';
import { sendXPISuccess } from '@store/send/actions';
import { setAccountBalance } from '@store/account/actions';
import { getWalletState } from '@utils/cashMethods';
import WalletLabel from '@bcpros/lixi-components/components/Common/WalletLabel';

// Note jestBCH is only used for unit tests; BCHJS must be mocked for jest
const SendComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { XPI, Wallet } = React.useContext(AppContext);
  // use balance parameters from wallet.state object and not legacy balances parameter from walletState, if user has migrated wallet
  // this handles edge case of user with old wallet who has not opened latest Cashtab version yet

  // If the wallet object from ContextValue has a `state key`, then check which keys are in the wallet object
  // Else set it as blank

  const wallet = useAppSelector(getSelectedAccount);

  const currentAddress = wallet?.address;
  const walletState = getWalletState(wallet);
  const { balance } = walletState;

  const [recipientPubKeyWarning, setRecipientPubKeyWarning] = useState(false);
  const [isLoadBalanceError, setIsLoadBalanceError] = useState(false);

  // const [bchObj, setBchObj] = useState(false);

  const [formData, setFormData] = useState({
    dirty: true,
    value: '',
    address: ''
  });
  const [queryStringText, setQueryStringText] = useState(null);
  const [sendXpiAddressError, setSendXpiAddressError] = useState('');
  const [sendXpiAmountError, setSendXpiAmountError] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(currency.ticker);

  // Support cashtab button from web pages
  const [txInfoFromUrl, setTxInfoFromUrl] = useState({});

  // Show a Modal.ation modal on transactions created by populating form from web page button
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      XPI.Electrumx.balance(wallet?.address)
        .then(result => {
          if (result && result.balance) {
            const balance = result.balance.confirmed + result.balance.unconfirmed;
            dispatch(setAccountBalance(balance ?? 0));
          }
        })
        .catch(e => {
          setIsLoadBalanceError(true);
        });
    }, 10000);
    return () => clearInterval(id);
  }, []);

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

  const { getRestUrl, calcFee, sendAmount } = useXPI();

  async function submit() {
    setFormData({
      ...formData,
      dirty: false
    });

    if (!formData.address || !formData.value || Number(formData.value) <= 0) {
      return;
    }

    const { address, value } = formData;

    // Get the param-free address
    let cleanAddress = address.split('?')[0];

    // Ensure address has bitcoincash: prefix and checksum
    // cleanAddress = toLegacy(cleanAddress);

    const isValidAddress = XPI.Address.isXAddress(cleanAddress);
    // try {
    //     hasValidLotusPrefix = cleanAddress.startsWith(
    //         currency.legacyPrefix + ':',
    //     );
    // } catch (err) {
    //     hasValidCashPrefix = false;
    //     console.log(`toLegacy() returned an error:`, cleanAddress);
    // }

    if (!isValidAddress) {
      // set loading to false and set address validation to false
      // Now that the no-prefix case is handled, this happens when user tries to send
      // BCHA to an SLPA address
      setSendXpiAddressError(`Destination is not a valid ${currency.ticker} address`);
      return;
    }
    try {
      const { keyPair } = await Wallet.getWalletDetails(wallet.mnemonic);
      const link = await sendAmount(
        currentAddress,
        [
          {
            address: formData.address,
            amountXpi: formData.value
          }
        ],
        keyPair,
        wallet.id
      );
      if (link) {
        dispatch(sendXPISuccess(wallet.id));
        XPI.Electrumx.balance(wallet?.address)
          .then(result => {
            if (result && result.balance) {
              const balance = result.balance.confirmed + result.balance.unconfirmed;
              dispatch(setAccountBalance(balance ?? 0));
            }
          })
          .catch(e => {
            setIsLoadBalanceError(true);
          });
      }
      // update the wallet the get the new utxos 1s after sending
      // setTimeout(refresh, 1000);
      // Todo: Success show notification
    } catch (e) {
      // Set loading to false here as well, as balance may not change depending on where error occured in try loop
      let message;

      if (!e.error && !e.message) {
        message = `Transaction failed: no response from ${getRestUrl()}.`;
      } else if (/Could not communicate with full node or other external service/.test(e.error)) {
        message = 'Could not communicate with API. Please try again.';
      } else if (
        e.error &&
        e.error.includes('too-long-mempool-chain, too many unModal.ed ancestors [limit: 50] (code 64)')
      ) {
        message = `The ${currency.ticker} you are trying to send has too many unModal.ed ancestors to send (limit 50). Sending will be possible after a block Modal.ation. Try again in about 10 minutes.`;
      } else {
        message = e.message || e.error || JSON.stringify(e);
      }

      notification.error({
        message: 'Error',
        description: message,
        duration: 5
      });
      console.error(e);
    }
  }

  const handleAddressChange = e => {
    const { value, name } = e.target;
    let error: boolean | string = false;
    let addressString: string = _.trim(value);

    // parse address
    const addressInfo = parseAddress(XPI, addressString);
    const { address, isValid, queryString, amount } = addressInfo;

    // If query string,
    // Show an alert that only amount and currency.ticker are supported
    setQueryStringText(queryString);

    // Is this valid address?
    if (!isValid) {
      error = intl.get('claim.invalidAddress', { ticker: currency.ticker });
    } else {
      // Set amount if it's in the query string
      if (amount !== null) {
        // Set currency to BCHA
        setSelectedCurrency(currency.ticker);

        // Use this object to mimic user input and get validation for the value
        let amountObj = {
          target: {
            name: 'value',
            value: amount
          }
        };
        handleBchAmountChange(amountObj);
        setFormData({
          ...formData,
          value: amount.toString()
        });
      }
      setFormData(p => ({
        ...p,
        address
      }));
      error = false;
    }
  };

  const handleSelectedCurrencyChange = e => {
    setSelectedCurrency(e);
    // Clear input field to prevent accidentally sending 1 BCH instead of 1 USD
    setFormData(p => ({
      ...p,
      value: ''
    }));
  };

  const handleBchAmountChange = e => {
    const { value, name } = e.target;
    let bchValue = value;
    const error = shouldRejectAmountInput(bchValue, balance);
    setSendXpiAmountError(error);

    setFormData(p => ({
      ...p,
      value
    }));
  };

  const onMax = async () => {
    // Clear amt error
    setSendXpiAmountError('');
    // Set currency to BCH
    setSelectedCurrency(currency.ticker);
    try {
      const utxos = await XPI.Utxo.get(formData.address);
      const utxoStore = utxos[0];
      const txFeeSats = calcFee(XPI, (utxoStore as any).bchUtxos);
      const txFeeBch = txFeeSats / 10 ** currency.cashDecimals;
      let value = balance - txFeeBch >= 0 ? (balance - txFeeBch).toFixed(currency.cashDecimals) : 0;
      value = value.toString();
      setFormData({
        ...formData,
        value
      });
    } catch (err) {
      console.log(`Error in onMax:`);
      console.log(err);
      message.error('Unable to calculate the max value due to network errors');
    }
  };

  return (
    <>
      <Modal title="Modal. Send" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <p>
          Are you sure you want to send {formData.value} {currency.ticker} to {formData.address}?
        </p>
      </Modal>
      {!balance ? (
        <ZeroBalanceHeader>
          You currently have 0 {currency.ticker}
          <br />
          Deposit some funds to use this feature
        </ZeroBalanceHeader>
      ) : (
        <>
          <WalletLabel name={wallet?.name ?? ''} />
          <BalanceHeader balance={balance || 0} ticker={currency.ticker} />
        </>
      )}

      {/* <Row type="flex"> */}
      <Row>
        <Col span={24}>
          <Form
            style={{
              width: 'auto'
            }}
          >
            {recipientPubKeyWarning && (
              <Alert
                style={{
                  margin: '0 0 10px 0'
                }}
                message={recipientPubKeyWarning}
                type="warning"
                showIcon
              />
            )}
            <FormItemWithQRCodeAddon
              style={{
                margin: '0 0 10px 0'
              }}
              loadWithCameraOpen={false}
              validateStatus={sendXpiAddressError ? 'error' : ''}
              help={sendXpiAddressError ? sendXpiAddressError : ''}
              onScan={result =>
                handleAddressChange({
                  target: {
                    name: 'address',
                    value: result
                  }
                })
              }
              inputProps={{
                placeholder: `${currency.ticker} Address`,
                name: 'address',
                onChange: e => handleAddressChange(e),
                required: true,
                value: formData.address
              }}
            ></FormItemWithQRCodeAddon>
            <SendXpiInput
              style={{
                margin: '0 0 10px 0'
              }}
              validateStatus={sendXpiAmountError ? 'error' : ''}
              help={sendXpiAmountError ? sendXpiAmountError : ''}
              onMax={() => onMax()}
              inputProps={{
                name: 'value',
                dollar: selectedCurrency === 'USD' ? 1 : 0,
                placeholder: 'Amount',
                onChange: e => handleBchAmountChange(e),
                required: true,
                value: formData.value
              }}
              selectProps={{
                value: selectedCurrency,
                disabled: queryStringText !== null,
                onChange: e => handleSelectedCurrencyChange(e)
              }}
              activeFiatCode={''}
            ></SendXpiInput>
            <div>
              {!balance || sendXpiAmountError || sendXpiAddressError ? (
                <PrimaryButton>Send</PrimaryButton>
              ) : (
                <>
                  {txInfoFromUrl ? (
                    <PrimaryButton onClick={() => showModal()}>Send</PrimaryButton>
                  ) : (
                    <PrimaryButton onClick={() => submit()}>Send</PrimaryButton>
                  )}
                </>
              )}
            </div>
            {queryStringText && (
              <Alert
                message={`You are sending a transaction to an address including query parameters "${queryStringText}." Only the "amount" parameter, in units of ${currency.ticker} satoshis, is currently supported.`}
                type="warning"
              />
            )}
          </Form>
        </Col>
      </Row>
    </>
  );
};

/*
passLoadingStatus must receive a default prop that is a function
in order to pass the rendering unit test in Send.test.js

status => {console.log(status)} is an arbitrary stub function
*/

export default SendComponent;
