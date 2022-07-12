import React, { useEffect, useState } from 'react';
import intl from 'react-intl-universal';
import { Form, notification, message, Modal, Alert, Checkbox } from 'antd';
import { Row, Col } from 'antd';
import PrimaryButton from '@components/Common/PrimaryButton';
import { FormItemWithQRCodeAddon, OpReturnMessageInput } from '@bcpros/lixi-components/components/Common/EnhancedInputs';
import { currency } from '@components/Common/Ticker';
import { shouldRejectAmountInput } from '@utils/validation';
import { AppContext } from '@store/store';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getSelectedAccount } from '@store/account/selectors';
import { SendXpiInput } from '@bcpros/lixi-components/components/Common/EnhancedInputs';
import _ from 'lodash';
import { parseAddress } from '@utils/addressMethods';
import useXPI from '@hooks/useXPI';
import BalanceHeader from '@bcpros/lixi-components/components/Common/BalanceHeader';
import { sendXPIFailure, sendXPISuccess } from '@store/send/actions';
import { setAccountBalance } from '@store/account/actions';
import { getDustXPI, getWalletState } from '@utils/cashMethods';
import WalletLabel from '@bcpros/lixi-components/components/Common/WalletLabel';
import { ZeroBalanceHeader } from '@bcpros/lixi-components/components/Common/Atoms';
import styled from 'styled-components';
import { createSharedKey, encrypt } from '@utils/encryption';

const StyledCheckbox = styled(Checkbox)`
    .ant-checkbox-inner {
        background-color: #fff !important;
        border: 1px solid ${props => props.theme.forms.border} !important
    }

    .ant-checkbox-checked .ant-checkbox-inner::after {
        position: absolute;
        display: table;
        border: 2px solid ${props => props.theme.primary};
        border-top: 0;
        border-left: 0;
        transform: rotate(45deg) scale(1) translate(-50%, -50%);
        opacity: 1;
        transition: all 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46) 0.1s;
        content: ' ';
    }
`
// Note jestBCH is only used for unit tests; BCHJS must be mocked for jest
const SendComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { XPI, Wallet } = React.useContext(AppContext);
  const wallet = useAppSelector(getSelectedAccount);
  const currentAddress = wallet?.address;
  const walletState = getWalletState(wallet);
  const { balance } = walletState;


  const [isLoadBalanceError, setIsLoadBalanceError] = useState(false);
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

  const [isOpReturnMsgDisabled,setIsOpReturnMsgDisabled] = useState(true);
  const [isEncryptedOptionalOpReturnMsg, setIsEncryptedOptionalOpReturnMsg] = useState(true);
  const [opReturnMsg, setOpReturnMsg] = useState('');
  const [recipientPubKeyWarning, setRecipientPubKeyWarning] = useState('');
  const [recipientPubKeyHex, setRecipientPubKeyHex] = useState('');

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

  const encryptOpReturnMsg = (
    privateKeyWIF,
    recipientPubKeyHex,
    plainTextMsg,
) => {
    let encryptedMsg;
    try {
        const sharedKey = createSharedKey(privateKeyWIF, recipientPubKeyHex);
        encryptedMsg = encrypt(sharedKey,Uint8Array.from(Buffer.from(plainTextMsg)));

    } catch (err) {
        console.log(`SendBCH.encryptOpReturnMsg() error: ` + err);
        throw err;
    }

    return encryptedMsg;
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
    const isValidAddress = XPI.Address.isXAddress(cleanAddress);
    if (!isValidAddress) {
      setSendXpiAddressError(`Destination is not a valid ${currency.ticker} address`);
      return;
    }
    try {
      const { keyPair, fundingWif } = await Wallet.getWalletDetails(wallet.mnemonic);
      let encryptedOpReturnMsg = undefined;
        if (opReturnMsg &&
            typeof opReturnMsg !== 'undefined' &&
            opReturnMsg.trim() !== '' &&
            recipientPubKeyHex ) {
            try {
                encryptedOpReturnMsg = encryptOpReturnMsg(fundingWif , recipientPubKeyHex, opReturnMsg);
            } catch (error) {
                notification.error({
                    message: 'Error',
                    description: 'Cannot encrypt message',
                    duration: 5,
                });
                console.log(error);
                return;
            }
        }

      const link = await sendAmount(
        currentAddress,
        [
          {
            address: formData.address,
            amountXpi: formData.value
          }
        ],
        keyPair,
        encryptedOpReturnMsg,
        isEncryptedOptionalOpReturnMsg
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
    } catch (e) {
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
      dispatch(sendXPIFailure(message));
    }
  }

  const fetchRecipientPublicKey = async (recipientAddress) => {
    let recipientPubKey;
    try {
        // see https://api.fullstack.cash/docs/#api-Encryption-Get_encryption_key_for_bch_address
        // if successful, returns
        // {
        //   success: true,
        //   publicKey: hex string
        // }
        // if Address only has incoming transaction but NO outgoing transaction, returns
        // {
        //   success: false,
        //   publicKey: "not found"
        // }
        recipientPubKey = await XPI.encryption.getPubKey(recipientAddress);
    } catch (err) {
        console.log(`SendBCH.handleAddressChange() error: ` + err);
        recipientPubKey = {
            success: false,
            error: 'fetch error - exception thrown'
        }
    }
    const {success, publicKey} = recipientPubKey;
    if ( success ) {
        setRecipientPubKeyHex(publicKey);
        setIsOpReturnMsgDisabled(false);
        setRecipientPubKeyWarning('');
    } else {
        setRecipientPubKeyHex('');
        setIsOpReturnMsgDisabled(true);
        if ( publicKey && publicKey === 'not found' ) {
            setRecipientPubKeyWarning('This address has no outgoing transaction, you cannot send message.');
        } else {
            setRecipientPubKeyWarning('It looks like this address is NEW, please verify it before sending a large amount.')
        }
    }
}

  const handleAddressChange = e => {
    const { value, name } = e.target;
    let error: string = '';
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
    }
     // Is this address same with my address?
     if (currentAddress && address && address === currentAddress) {
      error = 'Cannot send to yourself!';
    }
    setSendXpiAddressError(error);
    // if the address is correct
    // attempt the fetch the public key assocciated with this address
    if (error === '') {
        fetchRecipientPublicKey(address);
    }

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
      error = '';
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
    // Set currency to XPI
    setSelectedCurrency(currency.ticker);
    try {
      const utxos = await XPI.Utxo.get(formData.address);
      const utxoStore = utxos[0];
      const utxosStore = (utxoStore as any).bchUtxos.length > 0 ? (utxoStore as any).bchUtxos : (utxoStore as any).nullUtxos;
      const txFeeSats = calcFee(XPI, utxosStore);
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

  // Only Send Mesage Checkbox
  const sendOnlyMessageCheckbox = (
    <div
    style={{textAlign: "right"}}
    >
        send only message &nbsp;
        <StyledCheckbox
            defaultChecked={false}
            onChange={() =>
                setFormData({
                    ...formData,
                    value: getDustXPI(),
                })
            }
        />
    </div>
);

  const computeOpReturnMsgMaxByteLength = () => {
    const maxOpReturnLimit = (
        isEncryptedOptionalOpReturnMsg
            ? currency.opReturn.encryptedMsgByteLimit
            : currency.opReturn.unencryptedMsgByteLimit
    );

    return maxOpReturnLimit
}

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
                                    {sendOnlyMessageCheckbox}

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
                                    {/* OP_RETURN message */}
                                    <OpReturnMessageInput
                             style={{
                                margin: '0 0 25px 0',
                            }}
                            placeholder="Optional Private Message"
                            disabled={isOpReturnMsgDisabled}
                            value={
                                opReturnMsg
                                    ? isEncryptedOptionalOpReturnMsg
                                        ? opReturnMsg.substring(0,currency.opReturn.encryptedMsgByteLimit)
                                        : opReturnMsg
                                    : ''
                            }
                            onChange={msg => setOpReturnMsg(msg)}
                            maxByteLength={computeOpReturnMsgMaxByteLength()}
                            labelTop={null}
                            labelBottom={null}
                        />
                        {/* END OF OP_RETURN message */}
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

export default SendComponent;
