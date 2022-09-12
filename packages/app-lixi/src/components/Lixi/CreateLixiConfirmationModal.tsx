import { AnyAction } from 'redux';
import intl from 'react-intl-universal';
import { Descriptions, Modal } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { LixiParamLabel } from '@bcpros/lixi-components/components/Common/Atoms';
import { useAppDispatch } from 'src/store/hooks';
import { closeModal } from 'src/store/modal/actions';
import { countries } from '@bcpros/lixi-models/constants';
import { LixiType, ClaimType, LotteryAddress } from '@bcpros/lixi-models/lib/lixi';
import { InfoCircleOutlined } from '@ant-design/icons';

export type CreateLixiConfirmationModalProps = {
  claimType: number;
  lixiType: number;
  newAccountName?: string;
  newLixiMinValue: string;
  newLixiMaxValue: string;
  newLixiFixedValue: string;
  newLixiDividedValue: string;
  newLixiAmount: string;
  newNumberOfSubLixi: string;
  newNumberLixiPerPackage: string;
  newLixiName: string;
  newMaxClaim: string;
  newMinStaking: string;
  newActivatedAt: string;
  newExpiryAt: string;
  newCountryLixi: string;
  isFamilyFriendly: boolean;
  isNFTEnabled: boolean;
  newEnvelopeId: number | null;
  newStaffAddress: string | null;
  newCharityAddress: string | null;
  joinLotteryProgram: boolean;
  networkType: string;
  onOkAction?: AnyAction;
};

export const CreateLixiConfirmationModal: React.FC<CreateLixiConfirmationModalProps> = (
  props: CreateLixiConfirmationModalProps
) => {
  const dispatch = useAppDispatch();

  const {
    newAccountName,
    newLixiName,
    newLixiAmount,
    newNumberOfSubLixi,
    newNumberLixiPerPackage,
    newMaxClaim,
    newMinStaking,
    newExpiryAt,
    newActivatedAt,
    claimType,
    lixiType,
    newLixiMinValue,
    newLixiMaxValue,
    newLixiFixedValue,
    newLixiDividedValue,
    newCountryLixi,
    isFamilyFriendly,
    isNFTEnabled,
    newEnvelopeId,
    newStaffAddress,
    newCharityAddress,
    joinLotteryProgram,
    networkType
  } = props;

  const distributions = _.filter([newStaffAddress, newCharityAddress], address => {
    return !!address;
  });
  if (joinLotteryProgram) {
    distributions.push(LotteryAddress);
  }
  const numberOfDistribution = distributions.length + 1; // for the user distribution
  const requireAmount = Number(newLixiAmount) * numberOfDistribution;

  const handleOnCancel = () => {
    dispatch(closeModal());
  };

  const handleOnOk = () => {
    if (props.onOkAction) {
      // There's an action should be dispatch on ok
      const newAction = _.cloneDeep(props.onOkAction);
      dispatch(newAction);
    }
    dispatch(closeModal());
  };

  const confirmLixiType = () => {
    switch (lixiType) {
      // isFixed
      case LixiType.Fixed:
        return (
          <>
            <LixiParamLabel>{intl.get('lixi.fundGiveFixed')}</LixiParamLabel>
            <br />
            <LixiParamLabel>{intl.get('lixi.fixedFund')}</LixiParamLabel> {newLixiFixedValue}
          </>
        );
      // isDivided
      case LixiType.Divided:
        return (
          <>
            <LixiParamLabel>{intl.get('lixi.fundGiveDividend')}</LixiParamLabel>
            <br />
            <LixiParamLabel>{intl.get('lixi.dividedFund')}</LixiParamLabel> {newLixiDividedValue}
          </>
        );
      // Equal
      case LixiType.Equal:
        return (
          <>
            <LixiParamLabel>{intl.get('lixi.fundGiveEqual')}</LixiParamLabel>
            <br />
            <LixiParamLabel>{intl.get('lixi.equalFund')}</LixiParamLabel>{' '}
            {Number(newLixiAmount) / Number(newNumberOfSubLixi)}
          </>
        );
      // isRandom
      default:
        return (
          <>
            <LixiParamLabel>{intl.get('lixi.fundGiveRandomize')}</LixiParamLabel>
            <br />
            <LixiParamLabel>
              {intl.get('lixi.randomFund', { newLixiMinValue: newLixiMinValue, newLixiMaxValue: newLixiMaxValue })}
            </LixiParamLabel>
          </>
        );
    }
  };

  const confirmAmount = () => {
    return newLixiAmount == '' ? (
      ''
    ) : (
      <LixiParamLabel>
        {intl.get('lixi.totalAmountRequire', { newLixiAmount: requireAmount })} <br />
      </LixiParamLabel>
    );
  };

  const confirmSubLixies = () => {
    return claimType == ClaimType.OneTime ? (
      <LixiParamLabel>
        {intl.get('lixi.numberOfSub', { newNumberOfSubLixi: newNumberOfSubLixi })} <br />
      </LixiParamLabel>
    ) : (
      ''
    );
  };

  const confirmPackages = () => {
    return (
      <>
        <LixiParamLabel>
          {intl.get('lixi.numberLixiPerPackage', { newNumberLixiPerPackage: newNumberLixiPerPackage })}{' '}
        </LixiParamLabel>
        <br />
      </>
    );
  };

  const confirmCountry = () => {
    const country = countries.find(country => country.id === newCountryLixi);
    return (
      <LixiParamLabel>
        {intl.get('lixi.country')} {country ? intl.get(`country.${country.id}`) : intl.get(`country.all`)}
        <br />
      </LixiParamLabel>
    );
  };

  const confirmMaxClaim = () => {
    return newMaxClaim == '' ? (
      ''
    ) : (
      <LixiParamLabel>
        {intl.get('lixi.maxClaim', { newMaxClaim: newMaxClaim })} <br />
      </LixiParamLabel>
    );
  };

  const confirmMinStaking = () => {
    return newMinStaking == '' ? (
      ''
    ) : (
      <LixiParamLabel>
        {intl.get('lixi.minStake', { newMinStaking: newMinStaking })} <br />
      </LixiParamLabel>
    );
  };

  const formatActivationDate = () => {
    if (newActivatedAt != '') {
      return (
        <>
          <LixiParamLabel>
            {intl.get('lixi.activatedAt')} {moment(newActivatedAt).format('YYYY-MM-DD HH:mm')}
            <br />
          </LixiParamLabel>
        </>
      );
    } else {
      return;
    }
  };

  const formatExpireDate = () => {
    if (newExpiryAt != '') {
      return (
        <>
          <LixiParamLabel>
            {intl.get('lixi.expireAt')} {moment(newExpiryAt).format('YYYY-MM-DD HH:mm')}
            <br />
          </LixiParamLabel>
        </>
      );
    } else {
      return;
    }
  };

  const confirmStaff = () => {
    return (
      <Descriptions.Item label={newStaffAddress}>
        {Number(newLixiAmount) / Number(newNumberOfSubLixi)}
      </Descriptions.Item>
    );
  };
  const confirmCharity = () => {
    return (
      <Descriptions.Item label={newCharityAddress}>
        {Number(newLixiAmount) / Number(newNumberOfSubLixi)}
      </Descriptions.Item>
    );
  };
  const confirmLottery = () => {
    return (
      <Descriptions.Item label={LotteryAddress}>{Number(newLixiAmount) / Number(newNumberOfSubLixi)}</Descriptions.Item>
    );
  };

  return (
    <>
      <Modal
        title={intl.get('lixi.settingConfirm')}
        visible={true}
        onOk={() => handleOnOk()}
        onCancel={() => handleOnCancel()}
      >
        <LixiParamLabel>{intl.get('lixi.name')}</LixiParamLabel> {newLixiName}
        <br />
        <LixiParamLabel>{intl.get('lixi.fundForAccount')} </LixiParamLabel> {newAccountName}
        <br />
        {/* <LixiParamLabel>The claim type is: </LixiParamLabel> {claimType==0 ? "Single" : "One-Time Codes"} */}
        {/* <br /> */}
        {confirmAmount()}
        {confirmSubLixies()}
        {confirmLixiType()}
        <br />
        {confirmCountry()}
        {newNumberLixiPerPackage == '' ? '' : confirmPackages()}
        {confirmMaxClaim()}
        {confirmMinStaking()}
        {formatActivationDate()}
        {formatExpireDate()}
        <LixiParamLabel>
          {intl.get('lixi.networkType', { networkType: networkType })}
        </LixiParamLabel>
        <br />
        <LixiParamLabel>{isNFTEnabled ? intl.get('lixi.optionNFTEnabled') : ''}</LixiParamLabel>
        {/* Note */}
        {numberOfDistribution >= 2 && (
          <span>
            <InfoCircleOutlined /> {intl.get('lixi.loyaltyProgram')} <br />
            <Descriptions column={1} bordered>
              {newStaffAddress != '' && confirmStaff()}
              {newCharityAddress != '' && confirmCharity()}
              {joinLotteryProgram && confirmLottery()}
            </Descriptions>
          </span>
        )}
      </Modal>
    </>
  );
};
