import { AnyAction } from 'redux';
import intl from 'react-intl-universal';
import { Modal } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { LixiParamLabel } from '@bcpros/lixi-components/components/Common/Atoms';
import { useAppDispatch } from 'src/store/hooks';
import { closeModal } from 'src/store/modal/actions';
import { countries } from '@bcpros/lixi-models/constants';
import { LixiType, ClaimType } from '@bcpros/lixi-models/lib/lixi';


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
  newLixiName: string;
  newMaxClaim: string;
  newMinStaking: string;
  newExpiryAt: string;
  newCountryLixi: string;
  isFamilyFriendly: boolean;
  newEnvelopeId: number | null;
  onOkAction?: AnyAction
}

export const CreateLixiConfirmationModal: React.FC<CreateLixiConfirmationModalProps> = (props: CreateLixiConfirmationModalProps) => {

  const dispatch = useAppDispatch();

  const {
    newAccountName,
    newLixiName,
    newLixiAmount,
    newNumberOfSubLixi,
    newMaxClaim,
    newMinStaking,
    newExpiryAt,
    claimType,
    lixiType,
    newLixiMinValue,
    newLixiMaxValue,
    newLixiFixedValue,
    newLixiDividedValue,
    newCountryLixi,
    isFamilyFriendly,
    newEnvelopeId
  } = props;

  const handleOnCancel = () => {
    dispatch(closeModal());
  }

  const handleOnOk = () => {
    if (props.onOkAction) {
      // There's an action should be dispatch on ok
      const newAction = _.cloneDeep(props.onOkAction);
      dispatch(newAction);
    }
    dispatch(closeModal());
  }

  const confirmLixiType = () => {
    switch (lixiType) {
      // isFixed
      case LixiType.Fixed:
        return (
          <>
            <LixiParamLabel>{intl.get('lixi.FundGiveFixed')}</LixiParamLabel>
            <br />
            <LixiParamLabel>{intl.get('lixi.FixedFund')}</LixiParamLabel> {newLixiFixedValue}
          </>
        );
      // isDivided
      case LixiType.Divided:
        return (
          <>
            <LixiParamLabel>{intl.get('lixi.FundGiveDividend')}</LixiParamLabel>
            <br />
            <LixiParamLabel>{intl.get('lixi.DividedFund')}</LixiParamLabel> {newLixiDividedValue}
          </>
        );
      // Equal
      case LixiType.Equal:
        return (
          <>
            <LixiParamLabel>{intl.get('lixi.FundGiveEqual')}</LixiParamLabel>
            <br />
            <LixiParamLabel>{intl.get('lixi.EqualFund')}</LixiParamLabel> {Number(newLixiAmount) / Number(newNumberOfSubLixi)}
          </>
        );
      // isRandom
      default:
        return (
          <>
            <LixiParamLabel>{intl.get('lixi.FundGiveRandomize')}</LixiParamLabel>
            <br />
            <LixiParamLabel>{intl.get('lixi.RandomFund', { newLixiMinValue: newLixiMinValue, newLixiMaxValue: newLixiMaxValue })}</LixiParamLabel>
          </>
        );
    }
  }

  const confirmAmount = () => {
    return (newLixiAmount == "" ? "" : <LixiParamLabel>{intl.get('lixi.Amount', { newLixiAmount: newLixiAmount })} <br /></LixiParamLabel>);
  }

  const confirmSubLixies = () => {
    return (claimType == ClaimType.OneTime ? <LixiParamLabel>{intl.get('lixi.NumberOfSub', { newNumberOfSubLixi: newNumberOfSubLixi })} <br /></LixiParamLabel> : "");
  }

  const confirmCountry = () => {
    const country = countries.find(country => country.id === newCountryLixi);
    return <LixiParamLabel>{intl.get('lixi.Country')} {country ? intl.get(`country.${country.id}`) : intl.get(`country.all`)}<br /></LixiParamLabel>
  }

  const confirmMaxClaim = () => {
    return (newMaxClaim == "" ? "" : <LixiParamLabel>{intl.get('lixi.MaxClaim', { newMaxClaim: newMaxClaim })} <br /></LixiParamLabel>);
  }

  const confirmMinStaking = () => {
    return (newMinStaking == "" ? "" : <LixiParamLabel>{intl.get('lixi.MinStake', { newMinStaking: newMinStaking })} <br /></LixiParamLabel>);
  }

  const formatDate = () => {
    if (newExpiryAt != "") {
      return <LixiParamLabel>{intl.get('lixi.ExpireAt')} {moment(newExpiryAt).format("YYYY-MM-DD HH:mm")}<br /></LixiParamLabel>;
    }
    else {
      return;
    }
  }

  return (
    <>
      <Modal
        title={intl.get('lixi.settingConfirm')}
        visible={true}
        onOk={() => handleOnOk()}
        onCancel={() => handleOnCancel()}
      >
        <LixiParamLabel>{intl.get('lixi.Name')}</LixiParamLabel> {newLixiName}
        <br />
        <LixiParamLabel>{intl.get('lixi.FundForAccount')} </LixiParamLabel> {newAccountName}
        <br />
        {/* <LixiParamLabel>The claim type is: </LixiParamLabel> {claimType==0 ? "Single" : "One-Time Codes"} */}
        {/* <br /> */}
        {confirmAmount()}
        {confirmSubLixies()}
        {confirmLixiType()}
        <br />
        {confirmCountry()}
        {confirmMaxClaim()}
        {confirmMinStaking()}
        {formatDate()}
        <LixiParamLabel>{isFamilyFriendly ? intl.get('lixi.OptionFamilyFriendly') : ""}</LixiParamLabel>
      </Modal>
    </>
  );
}
