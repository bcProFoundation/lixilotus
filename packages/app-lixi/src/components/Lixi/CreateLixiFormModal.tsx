import {
  Button,
  Checkbox,
  Col,
  Collapse,
  DatePicker,
  Form,
  Input,
  List,
  Modal,
  Radio,
  RadioChangeEvent,
  Row,
  Select,
  Space,
  Tooltip
} from 'antd';
import _, { range } from 'lodash';
import isEmpty from 'lodash.isempty';
import moment from 'moment';
import React, { useState } from 'react';
import intl from 'react-intl-universal';
import { getAllEnvelopes } from 'src/store/envelope/selectors';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { generateLixi } from 'src/store/lixi/actions';
import { closeModal, openModal } from 'src/store/modal/actions';
import { showToast } from 'src/store/toast/actions';
import styled from 'styled-components';

import { DollarOutlined, PlusSquareOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
  AntdFormWrapper,
  FormItemCharityAddressInput,
  FormItemStaffAddressInput
} from '@bcpros/lixi-components/components/Common/EnhancedInputs';
import { SmartButton } from '@bcpros/lixi-components/components/Common/PrimaryButton';
import {
  AdvancedCollapse,
  LixiCollapse,
  StyledCollapse
} from '@bcpros/lixi-components/components/Common/StyledCollapse';
import { currency } from '@bcpros/lixi-components/components/Common/Ticker';
import { countries, UPLOAD_BUTTON_TYPE, UPLOAD_TYPES } from '@bcpros/lixi-models/constants';
import { Account } from '@bcpros/lixi-models/lib/account';
import { ClaimType, GenerateLixiCommand, LixiType, LotteryAddress, NetworkType } from '@bcpros/lixi-models/lib/lixi';
import CountrySelectDropdown from '@components/Common/CountrySelectDropdown';
import EnvelopeCarousel from '@components/Common/EnvelopeCarousel';
import { getEnvelopeUpload } from '@store/account/selectors';
import { WalletContext } from '@store/store';
import { isValidAmountInput } from '@utils/validation';
import TextArea from 'antd/lib/input/TextArea';
import { CreateLixiConfirmationModalProps } from './CreateLixiConfirmationModal';
import { StyledUploader } from '@components/Common/Uploader';

const { Panel } = Collapse;
const { Option } = Select;
const baseUrl = process.env.NEXT_PUBLIC_LIXI_API;

// const LotteryInput = styled(Input)`
//   .ant-input-group-addon {
//     width: 52px;
//   }
// `;

const StyledDivider = styled.h3`
  width: 100%;
  text-align: center;
  border-bottom: 1px solid #000;
  line-height: 0.1em;
  margin: 10px 0 20px;
`;

const Title = styled.h1`
  display: flex;
  height: 32px;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 24px;
  line-height: 32px;
  text-align: center;
  color: #1e1a1d;
  flex: none;
  order: 1;
  flex-grow: 0;
`;

const CreateForm = styled(Form)`
  .ant-form-item-label {
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    display: flex;
    align-items: center;
    letter-spacing: 0.4px;
    color: #4e444b;
    flex: none;
    order: 0;
    flex-grow: 0;
  }

  .ant-radio-group {
    display: flex;

    .ant-radio-wrapper {
      font-family: 'Roboto';
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      display: flex;
      align-items: baseline !important;
      letter-spacing: 0.5px;
      color: #1e1a1d;
      flex: none;
      order: 0;
      flex-grow: 0;
    }
  }

  .ant-form-vertical .ant-form-item .ant-form-item-control {
    display: flex;
  }

  .ant-checkbox-wrapper {
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    letter-spacing: 0.5px;
    color: #4e444b;
    flex: none;
    order: 1;
    flex-grow: 0;
    align-items: baseline !important;

    .ant-checkbox-inner {
      background: #ffffff;
    }
  }

  .ant-picker.ant-picker-large {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 16px 12px;
    gap: 16px;
    width: 343px;
    height: 56px;
    background: #ffffff;
    border: 1px solid #80747c;
    border-radius: 8px;
    flex: none;
    order: 1;
    align-self: stretch;
    flex-grow: 0;
  }
`;

const CreateInput = styled(Input)`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px;
  gap: 16px;
  width: 100%;
  height: 56px;
  background: #ffffff;
  border: 1px solid #80747c;
  border-radius: 8px;
  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 0;
`;

const Envelope = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 142px;
  background: #ffffff;
  border: 1px dashed #4e444b;
  border-radius: 16px;
  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 0;
`;

const NetworkSelect = styled(Select)`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px 12px;
  gap: 16px;
  width: 100%
  height: 56px;
  background: #FFFFFF;
  border: 1px solid #80747C;
  border-radius: 8px;
  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 0;

  .ant-select-selector {
    border: none !important;
    padding: 0px !important;
  }

  .ant-select-selection-item {
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    letter-spacing: 0.5px;
    color: #1E1A1D;
    flex: none;
    order: 2;
    flex-grow: 1;
  }
`;

type CreateLixiFormModalProps = {
  account?: Account;
} & React.HTMLProps<HTMLElement>;

export const CreateLixiFormModal: React.FC<CreateLixiFormModalProps> = ({
  account,
  disabled
}: CreateLixiFormModalProps) => {
  const dispatch = useAppDispatch();
  const envelopes = useAppSelector(getAllEnvelopes);
  const envelopeUpload = useAppSelector(getEnvelopeUpload);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { XPI, Wallet } = React.useContext(WalletContext);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // New Lixi name
  const [newLixiName, setNewLixiName] = useState('');
  const [newLixiNameIsValid, setNewLixiNameIsValid] = useState<boolean | null>(null);

  // LixiType && ClaimType && NetworkType
  const [lixiType, setLixiType] = useState<number>(LixiType.Random);
  const [claimType, setClaimType] = useState<number>(ClaimType.Single);
  const [networkType, setNetworkType] = useState<string>(NetworkType.SingleIP);

  // New lixi balance number
  const [newLixiAmount, setNewLixiAmount] = useState('');
  const [newLixiAmountValueIsValid, setNewLixiAmountValueIsValid] = useState(true);

  // New Lixi sub Value
  const [newNumberOfSubLixi, setNewNumberOfSubLixi] = useState('');
  const [newSubLixiIsValid, setNewSubLixiIsValid] = useState(false);

  // New Lixi Min Value
  const [newLixiMinValue, setNewLixiMinValue] = useState('');
  const [newLixiMinValueIsValid, setNewLixiMinValueIsValid] = useState(false);

  // New Lixi Max Value
  const [newLixiMaxValue, setNewLixiMaxValue] = useState('');
  const [newLixiMaxValueIsValid, setNewLixiMaxValueIsValid] = useState(false);

  // New Lixi Default Value
  const [newLixiFixedValue, setNewLixiFixedValue] = useState('');
  const [newLixiFixedValueIsValid, setNewLixiFixedValueIsValid] = useState(false);

  // New Lixi Divided Value
  const [newLixiDividedValue, setNewLixiDividedValue] = useState('');
  const [newLixiDividedValueIsValid, setNewLixiDividedValueIsValid] = useState(false);

  // New Envelope
  const [newEnvelopeId, setNewEnvelopeId] = useState<number | null>(null);
  const [newEnvelopeMessage, setNewEnvelopeMessage] = useState('');

  // New Country
  const [newCountryLixi, setNewCountryLixi] = useState('');
  const [newCountryLixiIsValid, setNewCountryLixiIsValid] = useState(true);

  // New max redemption number
  const [checkMaxClaim, setCheckMaxClaim] = useState<boolean>(false);
  const [newMaxClaim, setNewMaxClaimLixi] = useState('');
  const [newMaxClaimLixiIsValid, setNewMaxClaimLixiIsValid] = useState(true);

  // New Lixi Packages Value
  const [newNumberLixiPerPackage, setNewNumberLixiPerPackage] = useState('');
  const [newPackageIsValid, setNewPackageIsValid] = useState(true);

  // New minimum staking number
  const [newMinStaking, setNewMinStaking] = useState('');
  const [newMinStakingIsValid, setNewMinStakingIsValid] = useState(true);

  // New ActivatedAt
  const [newActivatedAt, setNewActivatedAtLixi] = useState('');
  const [newActivatedAtLixiIsValid, setActivatedAtLixiIsValid] = useState(true);

  // New ExpiryAt
  const [newExpiryAt, setNewExpiryAtLixi] = useState('');
  const [newExpiryAtLixiIsValid, setExpiryAtLixiIsValid] = useState(true);

  // New FamilyFriendly
  const [isFamilyFriendly, setIsFamilyFriendlyLixi] = useState<boolean>(false);

  // New isNFTEnabled
  const [isNFTEnabled, setIsNFTEnabledLixi] = useState<boolean>(false);

  // New distribution program
  const [newStaffAddress, setNewStaffAddress] = useState('');
  const [claimStaffAddressError, setClaimStaffAddressError] = useState<string | boolean>(false);

  const [newCharityAddress, setNewCharityAddress] = useState('');
  const [claimCharityAddressError, setClaimCharityAddressError] = useState<string | boolean>(false);

  const [joinLotteryProgram, setJoinLotteryProgram] = useState<boolean>(false);

  const handleNewLixiNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewLixiName(value);
    if (value && !isEmpty(value)) {
      setNewLixiNameIsValid(true);
    } else {
      setNewLixiNameIsValid(false);
    }
  };

  const handleEnvelopeMessageInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setNewEnvelopeMessage(value);
  };

  const handleStaffAddressChange = e => {
    const { value, name } = e.target;
    let staffAddress: string = _.trim(value);
    setNewStaffAddress(staffAddress);
  };

  const handleCharityAddressChange = e => {
    const { value, name } = e.target;
    let charityAddress: string = _.trim(value);
    setNewCharityAddress(charityAddress);
  };

  const handleJoinLotteryProgram = e => {
    const value = e.target.checked;
    setJoinLotteryProgram(value);
  };

  // Only enable CreateLixi button if all form entries are valid
  let createLixiFormDataIsValid =
    (newLixiNameIsValid &&
      newMaxClaimLixiIsValid &&
      newPackageIsValid &&
      newExpiryAtLixiIsValid &&
      account &&
      newActivatedAtLixiIsValid &&
      ((claimType == ClaimType.OneTime &&
        lixiType == LixiType.Random &&
        newSubLixiIsValid &&
        newLixiAmountValueIsValid &&
        newLixiMinValueIsValid &&
        newLixiMaxValueIsValid) ||
        (lixiType == LixiType.Equal && newSubLixiIsValid && newLixiAmountValueIsValid))) ||
    (claimType == ClaimType.Single &&
      lixiType == LixiType.Random &&
      newLixiMinValueIsValid &&
      newLixiMaxValueIsValid) ||
    (lixiType == LixiType.Fixed && newLixiFixedValueIsValid) ||
    (lixiType == LixiType.Divided && newLixiDividedValueIsValid);

  const handleChangeClaimType = (e: RadioChangeEvent) => {
    const { value } = e.target;
    setClaimType(value);
    setLixiType(LixiType.Random);
  };

  const handleChangeLixiType = (e: RadioChangeEvent) => {
    const { value } = e.target;
    setLixiType(value);
  };

  const handleNewLixiAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewLixiAmountValueIsValid(isValidAmountInput(value));
    setNewLixiAmount(value);
  };

  const handleNewNumberOfSubLixi = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewSubLixiIsValid(isValidAmountInput(value) && Number(value) !== 0);
    setNewNumberOfSubLixi(value);
  };

  const handleChangeMinValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewLixiMinValueIsValid(isValidAmountInput(value));
    setNewLixiMinValue(value);
  };
  const handleChangeMaxValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewLixiMaxValueIsValid(isValidAmountInput(value) && Number(value) !== 0);
    setNewLixiMaxValue(value);
  };

  const handleChangeFixedValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewLixiFixedValueIsValid(isValidAmountInput(value));
    setNewLixiFixedValue(value);
  };

  const handleChangeDividedValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewLixiDividedValueIsValid(isValidAmountInput(value));
    setNewLixiDividedValue(value);
  };

  const handleNewNumberLixiPerPackage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewPackageIsValid(isValidAmountInput(value));
    setNewNumberLixiPerPackage(value);
  };

  const handleChangeCountry = (value, e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCountryLixi(value);
    if (value && !isEmpty(value)) {
      setNewCountryLixiIsValid(true);
    }
  };

  const handleChangeNetworkType = (value, e: React.ChangeEvent<HTMLInputElement>) => {
    setNetworkType(value);
  };

  const handleChangeEnvelope = (value: number) => {
    setNewEnvelopeId(value);
  };

  const handleNewMaxClaimInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewMaxClaimLixi(value);
    if (value && !isEmpty(value)) {
      setNewMaxClaimLixiIsValid(true);
    }
  };

  // Minimum Staking
  const handleNewMinStakingInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewMinStaking(value);
    if (value && !isEmpty(value)) {
      setNewMinStakingIsValid(true);
    }
  };

  // Expiry Time
  const disabledDate = current => {
    return current && current < moment().startOf('day');
  };
  const disabledDateTime = current => {
    if (newExpiryAt && moment(newExpiryAt).date() > moment().date()) {
      return {
        disabledHours: () => [],
        disabledMinutes: () => []
      };
    }
    return {
      disabledHours: () => range(0, moment().hour()),
      disabledMinutes: () => range(0, moment().minute())
    };
  };
  const handleNewExpityTimeInput = value => {
    setNewExpiryAtLixi(value._d.toString());
  };

  const handleNewActivatedTimeInput = value => {
    setNewActivatedAtLixi(value._d.toString());
  };

  const handleMaxClaim = e => {
    const value = e.target.checked;
    setCheckMaxClaim(value);
  };

  const handleFamilyFriendly = e => {
    const value = e.target.checked;
    setIsFamilyFriendlyLixi(value);
  };

  const handleOnCancel = () => {
    dispatch(closeModal());
  };

  const lotterProgram = () => {
    return (
      <StyledCollapse>
        <StyledCollapse>
          <StyledCollapse>
            <Panel key={''} header={intl.get('lixi.loyaltyProgram')}>
              {/* address for staff */}
              <FormItemStaffAddressInput
                loadWithCameraOpen={false}
                onScan={result =>
                  handleStaffAddressChange({
                    target: {
                      name: 'staffAddress',
                      value: result
                    }
                  })
                }
                inputProps={{
                  onChange: e => handleStaffAddressChange(e),
                  value: newStaffAddress
                }}
              ></FormItemStaffAddressInput>

              {/* Charity */}
              <FormItemCharityAddressInput
                loadWithCameraOpen={false}
                onScan={result =>
                  handleCharityAddressChange({
                    target: {
                      name: 'charityAddress',
                      value: result
                    }
                  })
                }
                inputProps={{
                  onChange: e => handleCharityAddressChange(e),
                  value: newCharityAddress
                }}
              ></FormItemCharityAddressInput>

              {/* Lottery */}
              <Form.Item>
                <Tooltip title={intl.get('lixi.loterryAddress')}>
                  <div>
                    <CreateInput
                      disabled
                      prefix={<DollarOutlined />}
                      name="loterryAddress"
                      value={LotteryAddress}
                      placeholder={intl.get('lixi.loterryAddress')}
                      addonAfter={
                        <Checkbox value={joinLotteryProgram} onChange={e => handleJoinLotteryProgram(e)}></Checkbox>
                      }
                    />
                  </div>
                </Tooltip>
              </Form.Item>
            </Panel>
          </StyledCollapse>
        </StyledCollapse>
      </StyledCollapse>
    );
  };

  const handleNFTEnabled = e => {
    const value = e.target.checked;
    setIsNFTEnabledLixi(value);
  };

  const handleSubmitCreateLixi = () => {
    if (!account) {
      dispatch(
        showToast('error', {
          message: intl.get('account.unableCreateLixi'),
          description: intl.get('account.selectLixiFirst'),
          duration: 5
        })
      );
    }

    const command: GenerateLixiCommand = {
      name: newLixiName,
      accountId: account?.id ?? 0,
      mnemonic: account?.mnemonic ?? '',
      mnemonicHash: account?.mnemonicHash ?? '',
      maxClaim: newMaxClaim,
      expiryAt: newExpiryAt,
      activationAt: newActivatedAt,
      minValue: newLixiMinValue,
      maxValue: newLixiMaxValue,
      fixedValue: newLixiFixedValue,
      dividedValue: newLixiDividedValue,
      claimType: claimType,
      lixiType: lixiType,
      minStaking: newMinStaking,
      country: newCountryLixi,
      isFamilyFriendly: isFamilyFriendly,
      isNFTEnabled: isNFTEnabled,
      amount: newLixiAmount,
      numberOfSubLixi: newNumberOfSubLixi,
      envelopeId: newEnvelopeId,
      envelopeMessage: newEnvelopeMessage,
      numberLixiPerPackage: newNumberLixiPerPackage,
      upload: envelopeUpload,
      staffAddress: newStaffAddress,
      charityAddress: newCharityAddress,
      joinLotteryProgram: joinLotteryProgram,
      networkType: networkType
    };

    const createLixiModalProps: CreateLixiConfirmationModalProps = {
      claimType,
      lixiType,
      newAccountName: account?.name ?? '',
      newLixiName,
      newMaxClaim,
      newExpiryAt,
      newActivatedAt,
      newLixiAmount,
      newNumberOfSubLixi,
      newNumberLixiPerPackage,
      newLixiMinValue,
      newLixiMaxValue,
      newLixiFixedValue,
      newLixiDividedValue,
      newMinStaking,
      newCountryLixi,
      isFamilyFriendly,
      isNFTEnabled,
      newEnvelopeId,
      newStaffAddress,
      newCharityAddress,
      joinLotteryProgram,
      networkType,
      onOkAction: generateLixi(command)
    };
    dispatch(closeModal());
    dispatch(openModal('CreateLixiConfirmationModal', createLixiModalProps));
  };

  const onOk = value => {
    setNewExpiryAtLixi(value._d.toUTCString());
    if (value && !isEmpty(value)) {
      setExpiryAtLixiIsValid(true);
    }
  };

  const onActivatedOk = value => {
    setNewActivatedAtLixi(value._d.toUTCString());
    if (value && !isEmpty(value)) {
      setActivatedAtLixiIsValid(true);
    }
  };

  const selectClaimType = () => {
    if (claimType == ClaimType.Single) {
      return (
        <Form.Item label={intl.get('lixi.claimType')}>
          <Radio.Group value={lixiType} onChange={handleChangeLixiType}>
            <Radio value={LixiType.Fixed}>{intl.get('account.fixed')}</Radio>
            <Radio value={LixiType.Random}>
              {intl.get('account.random')}{' '}
              <Tooltip title={intl.get('account.random')}>
                {' '}
                <QuestionCircleOutlined />
              </Tooltip>
            </Radio>
            <Radio value={LixiType.Divided}>
              {intl.get('account.divided')}{' '}
              <Tooltip title={intl.get('account.divided')}>
                {' '}
                <QuestionCircleOutlined />
              </Tooltip>
            </Radio>
          </Radio.Group>
        </Form.Item>
      );
    } else {
      return (
        <>
          <Form.Item label={intl.get('lixi.claimType')}>
            <Radio.Group value={lixiType} onChange={handleChangeLixiType}>
              <Radio value={LixiType.Random}>{intl.get('account.random')}</Radio>
              <Radio value={LixiType.Equal}>{intl.get('account.equal')}</Radio>
            </Radio.Group>
          </Form.Item>
        </>
      );
    }
  };

  const selectLixiType = () => {
    switch (lixiType) {
      // isFixed
      case LixiType.Fixed:
        return (
          <>
            <Form.Item label={intl.get('account.eachClaim')}>
              <CreateInput
                type="number"
                step={1 / 10 ** currency.cashDecimals}
                value={newLixiFixedValue}
                name="fixedValue"
                onChange={e => handleChangeFixedValue(e)}
                onWheel={e => e.currentTarget.blur()}
                suffix={currency.ticker}
              />
            </Form.Item>
          </>
        );
      // isDivided
      case LixiType.Divided:
        return (
          <>
            <Form.Item label={intl.get('account.eachClaim')}>
              <CreateInput
                prefix="1 / "
                suffix={intl.get('account.balance')}
                type="number"
                step={1 / 10 ** currency.cashDecimals}
                value={newLixiDividedValue}
                placeholder={intl.get('account.dividedNumber')}
                name="dividedValue"
                onChange={e => handleChangeDividedValue(e)}
                onWheel={e => e.currentTarget.blur()}
              ></CreateInput>
            </Form.Item>
          </>
        );
      // isEqual
      case LixiType.Equal:
        return;
      // isRandom
      default:
        return (
          <>
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Form.Item label={intl.get('account.min')}>
                  <CreateInput
                    id="min"
                    onWheel={e => e.currentTarget.blur()}
                    type="number"
                    step={1 / 10 ** currency.cashDecimals}
                    name="minValue"
                    value={newLixiMinValue}
                    onChange={e => handleChangeMinValue(e)}
                    suffix={currency.ticker}
                  ></CreateInput>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={intl.get('account.max')}>
                  <CreateInput
                    type="number"
                    step={1 / 10 ** currency.cashDecimals}
                    name="maxValue"
                    value={newLixiMaxValue}
                    onChange={e => handleChangeMaxValue(e)}
                    onWheel={e => e.currentTarget.blur()}
                    suffix={currency.ticker}
                  ></CreateInput>
                </Form.Item>
              </Col>
            </Row>
          </>
        );
    }
  };

  const advanceOptions = () => {
    return (
      <>
        {/* Max redemption && Packages*/}
        {claimType == ClaimType.Single ? (
          <Form.Item validateStatus={newMaxClaimLixiIsValid === null || newMaxClaimLixiIsValid ? '' : 'error'}>
            <Input
              addonBefore={intl.get('account.maxClaim')}
              type="number"
              placeholder={intl.get('account.enterMaxClaimNumber')}
              name="lixiMaxClaim"
              value={newMaxClaim}
              onChange={e => handleNewMaxClaimInput(e)}
              onWheel={e => e.currentTarget.blur()}
            />
          </Form.Item>
        ) : (
          <Form.Item validateStatus={newPackageIsValid === null || newPackageIsValid ? '' : 'error'}>
            <Input
              addonBefore={intl.get('account.perPack')}
              type="number"
              placeholder={intl.get('account.numberLixiPerPackage')}
              name="package"
              value={newNumberLixiPerPackage}
              onChange={e => handleNewNumberLixiPerPackage(e)}
              onWheel={e => e.currentTarget.blur()}
            />
          </Form.Item>
        )}

        {/* Minimum Staking */}
        <Form.Item validateStatus={newMinStakingIsValid === null || newMinStakingIsValid ? '' : 'error'}>
          <Input
            addonBefore={intl.get('account.minStaking')}
            type="number"
            step={1 / 10 ** currency.cashDecimals}
            placeholder={intl.get('account.enterMinStaking')}
            name="MinStaking"
            value={newMinStaking}
            onChange={e => handleNewMinStakingInput(e)}
            onWheel={e => e.currentTarget.blur()}
          />
        </Form.Item>

        {/* Activation Time */}
        <Form.Item validateStatus={newActivatedAtLixiIsValid === null || newActivatedAtLixiIsValid ? '' : 'error'}>
          <DatePicker
            placeholder={intl.get('account.activatedTime')}
            name="lixiActivatedAt"
            disabledDate={current => disabledDate(current)}
            disabledTime={current => disabledDateTime(current)}
            showTime={{
              format: 'HH:mm'
            }}
            format="YYYY-MM-DD HH:mm"
            size={'large'}
            style={{
              width: '100%'
            }}
            onSelect={handleNewActivatedTimeInput}
            onOk={onActivatedOk}
          />
        </Form.Item>

        {/* Expiry Time */}
        <Form.Item validateStatus={newExpiryAtLixiIsValid === null || newExpiryAtLixiIsValid ? '' : 'error'}>
          <DatePicker
            placeholder={intl.get('account.expiryTime')}
            name="lixiExpiryAt"
            disabledDate={current => disabledDate(current)}
            disabledTime={current => disabledDateTime(current)}
            showTime={{
              format: 'HH:mm'
            }}
            format="YYYY-MM-DD HH:mm"
            size={'large'}
            style={{
              width: '100%'
            }}
            onSelect={handleNewExpityTimeInput}
            onOk={onOk}
          />
        </Form.Item>
      </>
    );
  };

  return (
    <>
      <Modal
        className='custom-create-lixi-modal'
        title={intl.get('lixi.createLixi')}
        visible={true}
        onCancel={handleOnCancel}
        footer={null}
        style={{ top: '0 !important' }}
      >
        <CreateForm layout="vertical">
          <Form.Item label={intl.get('lixi.claimType')}>
            <Radio.Group value={claimType} onChange={handleChangeClaimType}>
              <Space direction="vertical">
                <Radio value={ClaimType.Single}>
                  {intl.get('account.singleCode')}
                  &nbsp;
                  <Tooltip title={intl.get('lixi.claimType')}>
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Radio>
                <Radio value={ClaimType.OneTime}>
                  {intl.get('account.oneTimeCode')}
                  &nbsp;
                  <Tooltip title={intl.get('lixi.claimType')}>
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          {claimType == ClaimType.Single ? (
            <Form.Item label={intl.get('lixi.claimType')}>
              <Radio.Group value={lixiType} onChange={handleChangeLixiType}>
                <Space direction="vertical">
                  <Radio value={LixiType.Fixed}>{intl.get('account.fixed')}</Radio>
                  <Radio value={LixiType.Random}>
                    {intl.get('account.random')}{' '}
                    <Tooltip title={intl.get('account.random')}>
                      {' '}
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </Radio>
                  <Radio value={LixiType.Divided}>
                    {intl.get('account.divided')}{' '}
                    <Tooltip title={intl.get('account.divided')}>
                      {' '}
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
          ) : (
            <Form.Item label={intl.get('lixi.claimType')}>
              <Radio.Group value={lixiType} onChange={handleChangeLixiType}>
                <Space direction="vertical">
                  <Radio value={LixiType.Random}>{intl.get('account.random')}</Radio>
                  <Radio value={LixiType.Equal}>{intl.get('account.equal')}</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
          )}

          <Form.Item className="lixiName" label={intl.get('lixi.name')} required>
            <CreateInput name="lixiName" value={newLixiName} onChange={e => handleNewLixiNameInput(e)} />
          </Form.Item>

          <Form.Item label={intl.get('account.budget')} required={claimType == ClaimType.OneTime}>
            <CreateInput
              name="lixiAmount"
              value={newLixiAmount}
              onChange={e => handleNewLixiAmountInput(e)}
              suffix={currency.ticker}
            />
          </Form.Item>

          {selectLixiType()}
          {claimType == ClaimType.OneTime && (
            <Form.Item label={intl.get('account.numberOfSubLixi')}>
              <CreateInput
                type="number"
                step={1}
                value={newNumberOfSubLixi}
                name="numberOfSubLixi"
                onChange={e => handleNewNumberOfSubLixi(e)}
                onWheel={e => e.currentTarget.blur()}
              />
            </Form.Item>
          )}

          <Form.Item>
            <Checkbox value={checkMaxClaim} onChange={e => handleMaxClaim(e)}>
              {intl.get('account.checkMaxClaim')}
            </Checkbox>
            {checkMaxClaim === true && (
              <Form.Item label={intl.get('account.maxClaim')} required>
                <CreateInput
                  type="number"
                  name="lixiMaxClaim"
                  value={newMaxClaim}
                  onChange={e => handleNewMaxClaimInput(e)}
                  onWheel={e => e.currentTarget.blur()}
                />
              </Form.Item>
            )}
          </Form.Item>

          <Form.Item label={intl.get('account.validityFrom')}>
            <DatePicker
              placeholder={intl.get('account.activatedTime')}
              name="lixiActivatedAt"
              disabledDate={current => disabledDate(current)}
              disabledTime={current => disabledDateTime(current)}
              showTime={{
                format: 'HH:mm'
              }}
              format="YYYY-MM-DD HH:mm"
              size={'large'}
              style={{
                width: '100%'
              }}
              onSelect={handleNewActivatedTimeInput}
              onOk={onActivatedOk}
            />
          </Form.Item>

          <Form.Item label={intl.get('account.validityTo')}>
            <DatePicker
              placeholder={intl.get('account.expiryTime')}
              name="lixiExpiryAt"
              disabledDate={current => disabledDate(current)}
              disabledTime={current => disabledDateTime(current)}
              showTime={{
                format: 'HH:mm'
              }}
              format="YYYY-MM-DD HH:mm"
              size={'large'}
              style={{
                width: '100%'
              }}
              onSelect={handleNewExpityTimeInput}
              onOk={onOk}
            />
          </Form.Item>

          <Form.Item label={intl.get('account.country')}>
            <CountrySelectDropdown
              countries={countries}
              defaultValue={newCountryLixi ? newCountryLixi : intl.get('account.allCountry')}
              handleChangeCountry={handleChangeCountry}
            />
          </Form.Item>

          <Form.Item label={intl.get('account.envelope')}>
            <Envelope>
              <Row>
                <Col span={18} push={6} style={{ padding: '35px 0px 35px 0px', textAlign: 'center' }}>
                  {/* <Button type="link" onClick={}> */}
                  <Button
                    onClick={showModal}
                    type="link"
                    style={{
                      fontFamily: 'Roboto',
                      fontStyle: 'normal',
                      fontWeight: '400',
                      fontSize: '14px',
                      lineHeight: '20px',
                      alignItems: 'center',
                      color: '#9E2A9C',
                      flex: 'none',
                      order: '0',
                      flexGrow: '0'
                    }}
                  >
                    {' '}
                    {intl.get('lixi.envelopesSelect')}{' '}
                  </Button>
                  <br />
                  <span> {intl.get('special.or')} </span>
                  <br />
                  <StyledUploader
                    type={UPLOAD_TYPES.ENVELOPE}
                    isIcon={false}
                    buttonName={intl.get('lixi.browser')}
                    buttonType={UPLOAD_BUTTON_TYPE.LINK}
                    showUploadList={false}
                  />
                </Col>
                <Col span={6} pull={18}>
                  <img
                    src={
                      !newEnvelopeId && !envelopeUpload
                        ? '/images/lotus_logo.png'
                        : (newEnvelopeId &&
                          !envelopeUpload &&
                          baseUrl + 'api/' + envelopes.find(item => item.id === newEnvelopeId).thumbnail) ||
                        (envelopeUpload && envelopeUpload.url)
                    }
                    style={{
                      position: 'absolute',
                      width: '110px',
                      height: '110px',
                      left: '16px',
                      top: '16px'
                    }}
                  ></img>
                </Col>
              </Row>
            </Envelope>
          </Form.Item>

          <Form.Item label={intl.get('account.networkType')}>
            <NetworkSelect defaultValue={intl.get('NetworkType.SingleIP')} onChange={handleChangeNetworkType}>
              <Option value={NetworkType.SingleIP}>
                {intl.get('NetworkType.SingleIP')}
                &nbsp;
                <Tooltip title={intl.get('NetworkType.SingleIPInfo')}>
                  <QuestionCircleOutlined />
                </Tooltip>
              </Option>
              <Option value={NetworkType.FamilyFriendly}>
                {intl.get('NetworkType.FamilyFriendly')}
                &nbsp;
                <Tooltip title={intl.get('NetworkType.FamilyFriendlyInfo')}>
                  <QuestionCircleOutlined />
                </Tooltip>
              </Option>
              <Option value={NetworkType.NoWifiRestriction}>
                {intl.get('NetworkType.NoWifiRestriction')}
                &nbsp;
                <Tooltip title={intl.get('NetworkType.NoWifiRestrictionInfo')}>
                  <QuestionCircleOutlined />
                </Tooltip>
              </Option>
            </NetworkSelect>
          </Form.Item>
        </CreateForm>
        <SmartButton
          style={{
            width: '247px',
            height: '40px',
            padding: '10px 24px',
            gap: '8px'
          }}
          onClick={() => handleSubmitCreateLixi()}
          disabled={!createLixiFormDataIsValid}
        >
          {intl.get('account.createLixi')}
        </SmartButton>
      </Modal>

      {/* Envelope modal */}
      <Modal
        closable={false}
        visible={isModalVisible}
        width={400}
        style={{
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '0px',
          background: '#FFFBFF',
          border: '1px solid rgba(128, 116, 124, 0.12)',
          boxShadow: '0px 0px 12px rgba(0, 0, 0, 0.12)',
          borderRadius: '12px'
        }}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '10px 24px',
              gap: '10px',
              width: '67px',
              height: '40px',
              background: '#9E2A9C',
              color: '#FFFFFF',
              borderRadius: '16px',
              flex: 'none',
              order: '0',
              flexGrow: '0',
              border: 'none'
            }}
            key={intl.get('cancel')}
            onClick={handleCancel}
          >
            {intl.get('cancel')}
          </Button>,
          <Button
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '10px 24px',
              gap: '10px',
              width: '67px',
              height: '40px',
              background: '#9E2A9C',
              color: '#FFFFFF',
              borderRadius: '16px',
              flex: 'none',
              order: '0',
              flexGrow: '0',
              border: 'none'
            }}
            key="Ok"
            type="primary"
            onClick={handleOk}
          >
            Ok
          </Button>
        ]}
      >
        <EnvelopeCarousel envelopes={envelopes} handleChangeEnvelope={handleChangeEnvelope} />
      </Modal>
    </>
  );
};

function setClaimXpiAddressError(error: string | boolean) {
  throw new Error('Function not implemented.');
}
