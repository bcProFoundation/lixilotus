import React, { useState, useEffect, useContext } from 'react';
import { 
    useLocation
} from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Form, notification, message, Modal, Alert, Checkbox } from 'antd';
import { Row, Col } from 'antd';
import Paragraph from 'antd/lib/typography/Paragraph';
import PrimaryButton from '@components/Common/PrimaryButton';
import {
    SendBchInput,
    FormItemWithQRCodeAddon,
    OpReturnMessageInput
} from '@components/Common/EnhancedInputs';
import useBCH from '@hooks/useBCH';
import {
    currency,
    isValidTokenPrefix,
    parseAddress,
} from '@components/Common/Ticker.js';
import { Event } from '@utils/GoogleAnalytics';
import { shouldRejectAmountInput } from '@utils/validation';
import BalanceHeader from '@components/Common/BalanceHeader';
import {
    ZeroBalanceHeader,
} from '@components/Common/Atoms';
import { 
    getWalletState,
    getDustXPI,
} from '@utils/cashMethods';
import { 
    CashReceivedNotificationIcon,
} from '@components/Common/CustomIcons';
import ApiError from '@components/Common/ApiError';
import { createSharedKey, encrypt } from 'utils/encryption';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { AppContext } from '@store/store';
import { useAppSelector } from '@store/hooks';
import { getSelectedAccount } from '@store/account/selectors';

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
const SendBCH = ({ jestBCH, passLoadingStatus }) => {
  const { XPI, Wallet } = React.useContext(AppContext);
  // use balance parameters from wallet.state object and not legacy balances parameter from walletState, if user has migrated wallet
    // this handles edge case of user with old wallet who has not opened latest Cashtab version yet

    // If the wallet object from ContextValue has a `state key`, then check which keys are in the wallet object
    // Else set it as blank
    
    const location = useLocation();
    const { apiError, refresh } = Wallet;
    const wallet = useAppSelector(getSelectedAccount);

    const currentAddress = wallet?.address;
    const walletState = getWalletState(wallet);
    const { balances, slpBalancesAndUtxos } = walletState;

    const [isOpReturnMsgDisabled,setIsOpReturnMsgDisabled] = useState(true);
    const [recipientPubKeyHex, setRecipientPubKeyHex] = useState(false);
    const [recipientPubKeyWarning, setRecipientPubKeyWarning] = useState(false);
    const [opReturnMsg, setOpReturnMsg] = useState('');
    const [isEncryptedOptionalOpReturnMsg, setIsEncryptedOptionalOpReturnMsg] = useState(true);
    const [bchObj, setBchObj] = useState(false);

    const [formData, setFormData] = useState({
        dirty: true,
        value: '',
        address: '',
    });
    const [queryStringText, setQueryStringText] = useState(null);
    const [sendBchAddressError, setSendBchAddressError] = useState('');
    const [sendBchAmountError, setSendBchAmountError] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState(currency.ticker);

    // Support cashtab button from web pages
    const [txInfoFromUrl, setTxInfoFromUrl] = useState({});

    // Show a Modal.ation modal on transactions created by populating form from web page button
    const [isModalVisible, setIsModalVisible] = useState(false);


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

    const { getBCH, getRestUrl, sendBch, calcFee } = useBCH();


    // If the balance has changed, unlock the UI
    // This is redundant, if backend has refreshed in 1.75s timeout below, UI will already be unlocked
    useEffect(() => {
        passLoadingStatus(false);
    }, [balances.totalBalance]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
      // jestBCH is only ever specified for unit tests, otherwise app will use getBCH();
      const BCH = jestBCH ? jestBCH : getBCH();

      // set the BCH instance to state, for other functions to reference
      setBchObj(BCH);
      const loadDataFromReplyInTxHistory = async () => {
        // Manually parse for txInfo object on page load when Send.js is loaded with a query string

        // if this was routed from Wallet screen's Reply to message link then prepopulate the address and value field
        // Todo : Enable function to load data from reply in tx history
        // if (location && location.state && location.state.replyAddress) {
        //     setFormData({
        //         address: location.state.replyAddress,
        //         // send dust amount
        //         value: getDustXPI(),
        //     });
        //     await fetchRecipientPublicKey(BCH,location.state.replyAddress);
        // }

      };
      loadDataFromReplyInTxHistory();
        // Do not set txInfo in state if query strings are not present
        if (
            !window.location ||
            !window.location.hash ||
            window.location.hash === '#/send'
        ) {
            return;
        }

        const txInfoArr = window.location.hash.split('?')[1].split('&');

        // Iterate over this to create object
        const txInfo = {};
        for (let i = 0; i < txInfoArr.length; i += 1) {
            let txInfoKeyValue = txInfoArr[i].split('=');
            let key = txInfoKeyValue[0];
            let value = txInfoKeyValue[1];
            txInfo[key] = value;
        }
        console.log(`txInfo from page params`, txInfo);
        setTxInfoFromUrl(txInfo);
        populateFormsFromUrl(txInfo);
    }, []);

    function populateFormsFromUrl(txInfo) {
        if (txInfo && txInfo.address && txInfo.value) {
            setFormData({
                ...formData,
                address: txInfo.address,
                value: txInfo.value,
            });
        }
    }

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

    async function submit() {
        setFormData({
            ...formData,
            dirty: false,
        });

        if (
            !formData.address ||
            !formData.value ||
            Number(formData.value) <= 0
        ) {
            return;
        }

        // Event("Category", "Action", "Label")
        // Track number of BCHA send transactions and whether users
        // are sending BCHA or USD
        Event('Send.js', 'Send', selectedCurrency);

        passLoadingStatus(true);
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
            passLoadingStatus(false);
            setSendBchAddressError(
                `Destination is not a valid ${currency.ticker} address`,
            );
            return;
        }

        // Calculate the amount in BCH
        let bchValue = value;

        // if (selectedCurrency !== 'XPI') {
        //     bchValue = fiatToCrypto(value, fiatPrice);
        // }

        // encrypted message limit truncation
        // NO Need this, since the OpReturn Input field make sure the message length is within limit
        // let optionalOpReturnMsg;
        // if (isEncryptedOptionalOpReturnMsg && opReturnMsg) {
        //     optionalOpReturnMsg = opReturnMsg.substring(
        //         0,
        //         currency.opReturn.encryptedMsgByteLimit,
        //     );
        // } else {
        //     optionalOpReturnMsg = opReturnMsg;
        // }

        let encryptedOpReturnMsg = undefined;
        if (opReturnMsg &&
            typeof opReturnMsg !== 'undefined' &&
            opReturnMsg.trim() !== '' &&
            recipientPubKeyHex ) {           
            try {
                encryptedOpReturnMsg = encryptOpReturnMsg(wallet.Path10605.fundingWif, recipientPubKeyHex, opReturnMsg);
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

        try {
            const link = await sendBch(
                bchObj,
                wallet,
                slpBalancesAndUtxos.nonSlpUtxos,
                cleanAddress,
                bchValue,
                currency.defaultFee,
                encryptedOpReturnMsg,
                isEncryptedOptionalOpReturnMsg,
            );

            notification.success({
                message: 'Success',
                description: (
                    <a href={link} target="_blank" rel="noopener noreferrer">
                        <Paragraph>
                            Transaction successful. Click to view in block
                            explorer.
                        </Paragraph>
                    </a>
                ),
                duration: 3,
                icon: <CashReceivedNotificationIcon />,
                style: { width: '100%' },
            });

            passLoadingStatus(false);
            // update the wallet the get the new utxos 1s after sending
            setTimeout(refresh,1000);
            // Todo: Success show notification
        } catch (e) {
            // Set loading to false here as well, as balance may not change depending on where error occured in try loop
            passLoadingStatus(false);
            let message;

            if (!e.error && !e.message) {
                message = `Transaction failed: no response from ${getRestUrl()}.`;
            } else if (
                /Could not communicate with full node or other external service/.test(
                    e.error,
                )
            ) {
                message = 'Could not communicate with API. Please try again.';
            } else if (
                e.error &&
                e.error.includes(
                    'too-long-mempool-chain, too many unModal.ed ancestors [limit: 50] (code 64)',
                )
            ) {
                message = `The ${currency.ticker} you are trying to send has too many unModal.ed ancestors to send (limit 50). Sending will be possible after a block Modal.ation. Try again in about 10 minutes.`;
            } else {
                message = e.message || e.error || JSON.stringify(e);
            }

            notification.error({
                message: 'Error',
                description: message,
                duration: 5,
            });
            console.error(e);
        }
    }

    const fetchRecipientPublicKey = async (BCH, recipientAddress) => {
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
            recipientPubKey = await BCH.encryption.getPubKey(recipientAddress);
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
            setRecipientPubKeyWarning(false);
        } else {
            setRecipientPubKeyHex(false);
            setIsOpReturnMsgDisabled(true);
            if ( publicKey && publicKey === 'not found' ) {
                setRecipientPubKeyWarning('This address has no outgoing transaction, you cannot send message.');
            } else {
                setRecipientPubKeyWarning('It looks like this address is NEW, please verify it before sending a large amount.')
            }
        }
    }

    const handleAddressChange = async e => {
        const { value, name } = e.target;
        let error = false;
        let addressString = value;

        // parse address
        const addressInfo = parseAddress(bchObj, addressString);
        /*
        Model

        addressInfo = 
        {
            address: '',
            isValid: false,
            queryString: '',
            amount: null,
        };
        */

        const { address, isValid, queryString, amount } = addressInfo;

        // If query string,
        // Show an alert that only amount and currency.ticker are supported
        setQueryStringText(queryString);
    
        // Is this valid address?
        if (!isValid) {
            error = `Invalid ${currency.ticker} address`;
            // If valid address but token format
            if (isValidTokenPrefix(address)) {
                error = `Token addresses are not supported for ${currency.ticker} sends`;
            }
        
        
        // Is this address same with my address?
        if (currentAddress && address && address === currentAddress) {
            error = 'Cannot send to yourself!';
        }}

        setSendBchAddressError(error);

        // if the address is correct
        // attempt the fetch the public key assocciated with this address
        if (!error) {
            fetchRecipientPublicKey(bchObj ,address);
        }

        // Set amount if it's in the query string
        if (amount !== null) {
            // Set currency to BCHA
            setSelectedCurrency(currency.ticker);

            // Use this object to mimic user input and get validation for the value
            let amountObj = {
                target: {
                    name: 'value',
                    value: amount,
                },
            };
            handleBchAmountChange(amountObj);
            setFormData({
                ...formData,
                value: amount,
            });
        }

        // Set address field to user input
        setFormData(p => ({
            ...p,
            [name]: value,
        }));
    };

    const handleSelectedCurrencyChange = e => {
        setSelectedCurrency(e);
        // Clear input field to prevent accidentally sending 1 BCH instead of 1 USD
        setFormData(p => ({
            ...p,
            value: '',
        }));
    };

    const handleBchAmountChange = e => {
        const { value, name } = e.target;
        let bchValue = value;
        const error = shouldRejectAmountInput(
            bchValue,
            selectedCurrency,
            fiatPrice,
            balances.totalBalance,
        );
        setSendBchAmountError(error);

        setFormData(p => ({
            ...p,
            [name]: value,
        }));
    };

    const onMax = async () => {
        // Clear amt error
        setSendBchAmountError(false);
        // Set currency to BCH
        setSelectedCurrency(currency.ticker);
        try {
            const txFeeSats = calcFee(bchObj, slpBalancesAndUtxos.nonSlpUtxos);

            const txFeeBch = txFeeSats / 10 ** currency.cashDecimals;
            let value =
                balances.totalBalance - txFeeBch >= 0
                    ? (balances.totalBalance - txFeeBch).toFixed(
                          currency.cashDecimals,
                      )
                    : 0;
            value = value.toString();
            setFormData({
                ...formData,
                value,
            });
        } catch (err) {
            console.log(`Error in onMax:`);
            console.log(err);
            message.error(
                'Unable to calculate the max value due to network errors',
            );
        }
    };

    // Only Send Mesage Checkbox
    const sendOnlyMessageCheckbox = (
        <div
            css={`
                text-align: right;
            `}
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
            <Modal
                title="Modal. Send"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <p>
                    Are you sure you want to send {formData.value}{' '}
                    {currency.ticker} to {formData.address}?
                </p>
            </Modal>
            {!balances.totalBalance ? (
                <ZeroBalanceHeader>
                    You currently have 0 {currency.ticker}
                    <br />
                    Deposit some funds to use this feature
                </ZeroBalanceHeader>
            ) : (
                <>
                    <BalanceHeader
                        balance={balances.totalBalance}
                        ticker={currency.ticker}
                    />
                </>
            )}

            {/* <Row type="flex"> */}
            <Row>
                <Col span={24}>
                    <Form
                        style={{
                            width: 'auto',
                        }}
                    >
                         { recipientPubKeyWarning &&
                            <Alert
                                style={{
                                    margin: '0 0 10px 0'
                                }}
                                message={recipientPubKeyWarning}
                                type="warning"
                                showIcon
                            />
                        }
                        <FormItemWithQRCodeAddon
                                style={{
                                    margin: '0 0 10px 0'
                                }}
                            loadWithCameraOpen={false}
                            validateStatus={sendBchAddressError ? 'error' : ''}
                            help={
                                sendBchAddressError ? sendBchAddressError : ''
                            }
                            onScan={result =>
                                handleAddressChange({
                                    target: {
                                        name: 'address',
                                        value: result,
                                    },
                                })
                            }
                            codeType='address'
                            inputProps={{
                                placeholder: `${currency.ticker} Address`,
                                name: 'address',
                                onChange: e => handleAddressChange(e),
                                required: true,
                                value: formData.address,
                            }}
                        ></FormItemWithQRCodeAddon>
                        {sendOnlyMessageCheckbox}
                        <SendBchInput
                            style={{
                                margin: '0 0 10px 0'
                            }}
                           
                            validateStatus={sendBchAmountError ? 'error' : ''}
                            help={sendBchAmountError ? sendBchAmountError : ''}
                            onMax={onMax}
                            inputProps={{
                                name: 'value',
                                dollar: selectedCurrency === 'USD' ? 1 : 0,
                                placeholder: 'Amount',
                                onChange: e => handleBchAmountChange(e),
                                required: true,
                                value: formData.value,
                            }}
                            selectProps={{
                                value: selectedCurrency,
                                disabled: queryStringText !== null,
                                onChange: e => handleSelectedCurrencyChange(e),
                            }}
                        ></SendBchInput>
                        {/* OP_RETURN message */}
                        <OpReturnMessageInput
                             style={{
                                margin: '0 0 25px 0',
                            }}
                            name="opReturnMsg"
                            allowClear={true}
                            autoSize={{minRows: 2, maxRows: 4}}
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
                            {!balances.totalBalance ||
                            apiError ||
                            sendBchAmountError ||
                            sendBchAddressError ? (
                                    <PrimaryButton>Send</PrimaryButton>
                            ) : (
                                <>
                                    {txInfoFromUrl ? (
                                        <PrimaryButton
                                            onClick={() => showModal()}
                                        >
                                            Send
                                        </PrimaryButton>
                                    ) : (
                                        <PrimaryButton onClick={() => submit()}>
                                            Send
                                        </PrimaryButton>
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
                        {apiError && <ApiError />}
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

SendBCH.defaultProps = {
    passLoadingStatus: status => {
        console.log(status);
    },
};

SendBCH.propTypes = {
    jestBCH: PropTypes.object,
    passLoadingStatus: PropTypes.func,
};

export default SendBCH;
