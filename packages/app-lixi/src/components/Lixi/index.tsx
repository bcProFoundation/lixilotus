import { WalletContext } from '@context/index';
import { Button, Collapse, Descriptions, Form, message, Progress } from 'antd';
import { saveAs } from 'file-saver';
import { toPng } from 'html-to-image';
import * as _ from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import intl from 'react-intl-universal';
import { getAllClaims } from 'src/store/claim/selectors';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import {
  archiveLixi,
  fetchMoreSubLixies,
  refreshLixi,
  renameLixi,
  setLixiBalance,
  unarchiveLixi,
  withdrawLixi
} from 'src/store/lixi/actions';
import { getHasMoreSubLixies, getSelectedLixi, getSelectedLixiId } from 'src/store/lixi/selectors';
import { showToast } from 'src/store/toast/actions';
import styled from 'styled-components';

import {
  CaretRightOutlined,
  CopyOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  QuestionCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { SmartButton } from '@bcpros/lixi-components/components/Common/PrimaryButton';
import QRCode, { FormattedWalletAddress } from '@bcpros/lixi-components/components/Common/QRCode';
import { countries } from '@bcpros/lixi-models/constants/countries';
import {
  ArchiveLixiCommand,
  LixiType,
  LotteryAddress,
  RenameLixiCommand,
  UnarchiveLixiCommand,
  WithdrawLixiCommand
} from '@bcpros/lixi-models/lib/lixi';
import { currency } from '@components/Common/Ticker';
import { getSelectedAccount } from '@store/account/selectors';
import { getAllSubLixies, getLoadMoreSubLixiesStartId } from '@store/lixi/selectors';
import { openModal } from '@store/modal/actions';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { ClaimType } from '@bcpros/lixi-models/lib/lixi';
import { exportSubLixies } from 'src/store/lixi/actions';
import { RenameLixiModalProps } from './RenameLixiModal';
import SubLixiList from './SubLixiList';
import LixiClaimedList from './LixiClaimedList';
import useWindowDimensions from '@hooks/useWindowDimensions';
import { QRCodeModal } from '@components/Common/QRCodeModal';
import { QRCodeModalType } from '@bcpros/lixi-models/constants';

type CopiedProps = {
  style?: React.CSSProperties;
};

const Copied = styled.div<CopiedProps>`
  font-size: 18px;
  font-weight: bold;
  width: 100%;
  text-align: center;
  border: 1px solid;
  background-color: ${({ ...props }) => props.theme.primary};
  border-color: ${({ ...props }) => props.theme.qr.copyBorderCash};
  color: ${props => props.theme.contrast};
  position: absolute;
  top: 65px;
  padding: 30px 0;
  @media (max-width: 768px) {
    top: 52px;
    padding: 20px 0;
  }
`;

const LabelHeader = styled.h4`
  height: 28px;
  left: 15px;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 22px;
  line-height: 28px;
  display: flex;
  align-items: center;
  color: #333333;
  margin-bottom: unset;
`;

const DescriptionsCustom = styled(Descriptions)`
  .ant-descriptions-view {
    border: none;
  }
  .ant-descriptions-item-content {
    border: none;
    padding-left: 0px;
    @media (max-width: 768px) {
      padding-right: 0px;
    }
  }
  .ant-descriptions-row {
    border: none;
  }
`;

const InfoCard = styled.div`
  box-sizing: border-box;
  position: inherit;
  width: 100%;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  height: fit-content;
  @media (min-width: 768px) {
    height: 315px;
  }

  img {
    border-radius: 16px;
    height: 80px;
    width: 80px;
  }
  &.overview {
    .ant-descriptions-view {
      height: 100% !important;
      > table {
        height: 100% !important;
      }

      .ant-descriptions-item-content {
        height: 100% !important;
        justify-content: center;
        flex-direction: column;
      }
    }
  }

  .ant-descriptions-item-label {
    border-right: none;
    width: 140px;
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: rgba(30, 26, 29, 0.38);
    background: #ffffff;
    padding: 5px 16px;
  }

  .ant-descriptions-item-content {
    display: flex;
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.5px;
    color: #1e1a1d;
    border: none !important;
    padding-left: 16px;

    @media (min-width: 768px) {
      padding: 4px 16px !important;
    }
  }

  .ant-descriptions-view {
    border: none !important;
  }
  .ant-descriptions-row {
    border: none !important;
  }
`;

const Text = styled.p`
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  display: flex;
  color: #333333;
  margin: 0px;
`;

const StyleButton = styled(Button)`
  color: #9e2a9c;
  background: #ffffff;
  margin-right: 20px;
  font-weight: 500;

  :active {
    background: #ffffff !important;
  }

  :hover {
    background: #ffffff !important;
  }

  :focus {
    background: #ffffff !important;
  }
`;

const StyledQRCode = styled.div`
  flex: 1 auto;
  text-align: unset;
  opacity: 0.7;
  #borderedQRCode {
    @media (max-width: 768px) {
      border-radius: 18px;
      width: 126px;
      height: 126px;
    }
    @media (min-width: 768px) {
      border-radius: 18px;
      width: 77px;
      height: 77px;
    }
  }
`;

const { Panel } = Collapse;
const Lixi = props => {
  const { lixi } = props;
  const dispatch = useAppDispatch();
  const Wallet = React.useContext(WalletContext);
  const { XPI } = Wallet;
  const selectedAccount = useAppSelector(getSelectedAccount);
  // const selectedLixiId = useAppSelector(getSelectedLixiId);
  // const selectedLixi = useAppSelector(getSelectedLixi);
  const selectedLixiRedux = useAppSelector(getSelectedLixi);
  const selectedLixiIdRedux = useAppSelector(getSelectedLixiId);
  const selectedLixiId = lixi.id ? selectedLixiIdRedux : lixi;
  const selectedLixi = lixi ? selectedLixiRedux : lixi;
  const allClaimsCurrentLixi = useAppSelector(getAllClaims);
  const [claimCodeVisible, setClaimCodeVisible] = useState(false);
  const qrPanelRef = React.useRef(null);
  const [isLoadBalanceError, setIsLoadBalanceError] = useState(false);
  const hasMoreSubLixies = useAppSelector(getHasMoreSubLixies);
  const loadMoreStartId = useAppSelector(getLoadMoreSubLixiesStartId);
  let subLixies = useAppSelector(getAllSubLixies);

  subLixies = _.sortBy(subLixies, ['isClaimed', 'packageId']);

  const { width } = useWindowDimensions();
  const [isMobileDetailLixi, setIsMobileDetailLixi] = useState(false);

  useEffect(() => {
    const isMobileDetail = width < 768 ? true : false;
    setIsMobileDetailLixi(isMobileDetail);
  }, [width]);

  const handleRefeshLixi = () => {
    if (!(selectedLixi && selectedLixiId)) {
      // Ignore if no lixi is selected
      return;
    }
    const lixiId = selectedLixiId;
    dispatch(refreshLixi(lixiId));
  };

  const handleExportLixi = () => {
    if (!(selectedLixi && selectedLixiId)) {
      // Ignore if no lixi is selected
      return;
    }
    const exportLixiData = {
      id: selectedLixiId,
      mnemonicHash: selectedAccount?.mnemonicHash
    };
    dispatch(exportSubLixies(exportLixiData));
  };

  const handleOnClickClaimCode = evt => {
    setClaimCodeVisible(true);
    setTimeout(() => {
      setClaimCodeVisible(false);
    }, 1500);
  };

  const handleOnCopyClaimCode = () => {
    setClaimCodeVisible(true);
    message.info(intl.get('claim.claimCodeCopied'));
  };

  const handleOnCopyDistributionAddress = () => {
    message.info(intl.get('lixi.addressCopied'));
  };

  const handleDownloadQRClaimCode = () => {
    if (qrPanelRef.current) {
      toPng(qrPanelRef.current, { cacheBust: true })
        .then(url => {
          saveAs(url);
        })
        .catch(err => {
          dispatch(
            showToast('error', {
              message: intl.get('claim.unableDownloadClaimCode'),
              description: intl.get('claim.pleaseCopyManually'),
              duration: 5
            })
          );
        });
    }
  };

  const typeLixi = () => {
    switch (selectedLixi?.lixiType) {
      case LixiType.Fixed:
        return <>{intl.get('account.fixed')} </>;
      case LixiType.Divided:
        return <> {intl.get('lixi.dividedBy')} </>;
      case LixiType.Equal:
        return <> {intl.get('account.equal')} </>;
      default:
        return <> {intl.get('account.random')} </>;
    }
  };

  const rulesLixi = () => {
    switch (selectedLixi?.lixiType) {
      case LixiType.Fixed:
        return (
          <>
            {' '}
            {selectedLixi.fixedValue} {currency.ticker}{' '}
          </>
        );
      case LixiType.Divided:
        return <> {selectedLixi.dividedValue} </>;
      case LixiType.Equal:
        return (
          <>
            {' '}
            {selectedLixi.amount / selectedLixi.numberOfSubLixi} {currency.ticker}{' '}
          </>
        );
      default:
        return (
          <>
            {selectedLixi?.minValue}-{selectedLixi?.maxValue} {currency.ticker}
          </>
        );
    }
  };

  const showRedemption = () => {
    if (selectedLixi.claimType == ClaimType.Single) {
      if (selectedLixi?.maxClaim != 0) {
        return (
          <>
            {selectedLixi?.claimedNum} / {selectedLixi?.maxClaim}
          </>
        );
      } else {
        return <>{selectedLixi?.claimedNum}</>;
      }
    } else {
      return (
        <>
          {_.size(subLixies.filter(item => item.isClaimed))}/{selectedLixi.numberOfSubLixi}
        </>
      );
    }
  };

  const showMinStaking = () => {
    return selectedLixi?.minStaking ? (
      <Descriptions.Item label={intl.get('account.minStaking')} key="desc.minstaking">
        {selectedLixi.minStaking} {currency.ticker}
      </Descriptions.Item>
    ) : (
      ''
    );
  };

  const formatDate = () => {
    if (selectedLixi?.expiryAt != null) {
      return (
        <Descriptions.Item label={intl.get('lixi.expireAt')} key="desc.expiryat">
          {moment(selectedLixi?.expiryAt).format('YYYY-MM-DD HH:mm')}
        </Descriptions.Item>
      );
    } else {
      return;
    }
  };

  const formatActivationDate = () => {
    if (selectedLixi?.activationAt != null) {
      return (
        <Descriptions.Item label={intl.get('lixi.activatedAt')} key="desc.activatedat">
          {moment(selectedLixi?.activationAt).format('YYYY-MM-DD HH:mm')}
        </Descriptions.Item>
      );
    } else {
      return;
    }
  };

  const formatValidityDate = () => {
    const activeAt = selectedLixi.activationAt;
    const expiryAt = selectedLixi.expiryAt;
    switch (true) {
      case !_.isEmpty(activeAt) && _.isEmpty(expiryAt):
        return <>{moment(activeAt).format('YYYY-MM-DD HH:mm')} - 'N/A'</>;
      case _.isEmpty(activeAt) && !_.isEmpty(expiryAt):
        return <>'N/A' - {moment(expiryAt).format('YYYY-MM-DD HH:mm')}</>;
      case !_.isEmpty(activeAt) && !_.isEmpty(expiryAt):
        return (
          <>
            {moment(activeAt).format('YYYY-MM-DD HH:mm')} - <br /> {moment(expiryAt).format('YYYY-MM-DD HH:mm')}
          </>
        );
      default:
        return <>'N/A' - 'N/A'</>;
    }
  };

  const showCountry = () => {
    return selectedLixi?.country != null ? (
      <Descriptions.Item label={intl.get('lixi.country')} key="desc.country">
        {countries.find(country => country.id === selectedLixi?.country)?.name}
      </Descriptions.Item>
    ) : (
      ''
    );
  };

  const showIsFamilyFriendly = () => {
    return selectedLixi?.isFamilyFriendly ? (
      <Descriptions.Item label={intl.get('lixi.optional')} key="desc.optional">
        Family Friendly
      </Descriptions.Item>
    ) : (
      ''
    );
  };

  const showIsNFTEnabled = () => {
    return selectedLixi?.isNFTEnabled ? (
      <Descriptions.Item label={intl.get('lixi.optional')} key="desc.optional">
        {intl.get('lixi.isNFTEnabled')}
      </Descriptions.Item>
    ) : (
      ''
    );
  };

  const showDistributions = () => {
    const dist =
      selectedLixi.distributions &&
      selectedLixi.distributions.map(item => {
        return (
          <Descriptions.Item
            label={item.distributionType == 'staff' ? intl.get('lixi.staffAddress') : intl.get('lixi.charityAddress')}
            key={'desc.' + item.distributionType}
          >
            <CopyToClipboard text={item.address} onCopy={handleOnCopyDistributionAddress}>
              <div>
                <CopyOutlined /> {item.address}
              </div>
            </CopyToClipboard>
          </Descriptions.Item>
        );
      });
    return dist;
  };

  const showLottery = () => {
    return (
      selectedLixi.joinLotteryProgram && (
        <Descriptions.Item label={intl.get('lixi.lotteryAddress')} key="desc.lottery">
          <CopyToClipboard text={LotteryAddress} onCopy={handleOnCopyDistributionAddress}>
            <div>
              <CopyOutlined /> {LotteryAddress}
            </div>
          </CopyToClipboard>
        </Descriptions.Item>
      )
    );
  };

  const singleCodeColumns = [
    { title: intl.get('general.num'), dataIndex: 'num', width: 70 },
    { title: `${intl.get('general.amount')} (XPI)`, dataIndex: 'amount' },
    { title: 'Time of claim', dataIndex: 'claimedAt' }
  ];

  const claimReportSingleCode = allClaimsCurrentLixi.map((item, i) => {
    return {
      num: i + 1,
      amount: fromSmallestDenomination(item.amount),
      claimedAt: moment(item.createdAt).format('YYYY-MM-DD HH:mm')
    };
  });

  const oneTimeCodeColumns = [
    { title: intl.get('general.num'), dataIndex: 'num', width: 70 },
    { title: 'Code', dataIndex: 'claimCode' },
    { title: `${intl.get('general.amount')} (XPI)`, dataIndex: 'amount' },
    { title: intl.get('lixi.status'), dataIndex: 'isClaimed' }
  ];

  const showMoreSubLixies = () => {
    if (hasMoreSubLixies) {
      dispatch(fetchMoreSubLixies({ parentId: selectedLixi.id, startId: loadMoreStartId }));
    }
  };

  const getLixiPanelDetailsIcon = (status: string, isPanelOpen: boolean) => {
    switch (status) {
      case 'pending':
        return <LoadingOutlined />;
      case 'failed':
        return <ExclamationCircleOutlined />;
      case 'active':
      case 'lock':
      default:
        return <CaretRightOutlined rotate={isPanelOpen ? 90 : 0} />;
    }
  };

  const showPopulatedRenameLixiModal = e => {
    e.domEvent;
    const command: RenameLixiCommand = {
      id: selectedLixi.id,
      name: selectedLixi.name,
      mnemonic: selectedAccount?.mnemonic,
      mnemonicHash: selectedAccount?.mnemonicHash
    };
    const renameLixiModalProps: RenameLixiModalProps = {
      lixi: selectedLixi,
      onOkAction: renameLixi(command)
    };
    dispatch(openModal('RenameLixiModal', renameLixiModalProps));
  };

  const postLixiData = {
    id: selectedLixi?.id,
    mnemonic: selectedAccount?.mnemonic,
    mnemonicHash: selectedAccount?.mnemonicHash
  };

  const archiveButton = () => {
    if (selectedLixi.status == 'active') {
      return dispatch(archiveLixi(postLixiData as ArchiveLixiCommand));
    } else {
      return dispatch(unarchiveLixi(postLixiData as UnarchiveLixiCommand));
    }
  };

  const withdrawButton = () => {
    return dispatch(withdrawLixi(postLixiData as WithdrawLixiCommand));
  };

  const statusLixi = () => {
    if (moment().isAfter(selectedLixi.expiryAt)) {
      return (
        <Text
          style={{
            color: '#FFFFFF',
            padding: '4px 8px',
            borderRadius: '8px',
            alignItems: 'center',
            fontWeight: '400',
            fontSize: '14px',
            background: '#74546F'
          }}
        >
          {intl.get('general.ended')}
        </Text>
      );
    } else {
      switch (selectedLixi.status) {
        case 'active':
          return (
            <p
              style={{
                color: '#FFFFFF',
                padding: '4px 8px',
                borderRadius: '8px',
                alignItems: 'center',
                fontWeight: '400',
                fontSize: '14px',
                background: '#2F80ED'
              }}
            >
              {intl.get('general.running')}
            </p>
          );
        case 'pending':
          return (
            <p
              style={{
                color: '#FFFFFF',
                padding: '4px 8px',
                borderRadius: '8px',
                alignItems: 'center',
                fontWeight: '400',
                fontSize: '14px',
                background: '#E37100'
              }}
            >
              {intl.get('general.waiting')}
            </p>
          );
        case 'locked':
          return (
            <p
              style={{
                color: '#FFFFFF',
                padding: '4px 8px',
                borderRadius: '8px',
                alignItems: 'center',
                fontWeight: '400',
                fontSize: '14px',
                background: '#BA1A1A'
              }}
            >
              {intl.get('lixi.archived')}
            </p>
          );
      }
    }
  };

  const infoLixi = () => {
    return (
      <React.Fragment>
        <Descriptions
          className={isMobileDetailLixi ? '' : 'lixi-detail'}
          column={isMobileDetailLixi ? 1 : 2}
          bordered
          size="small"
          style={{
            paddingTop: '1%',
            color: 'rgb(23,23,31)'
          }}
        >
          <Descriptions.Item
            key="desc.avatar"
            label={
              <img
                src={selectedLixi.envelope ? selectedLixi.envelope.image : '/images/lixi_logo.svg'}
                style={{
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  display: 'flex'
                }}
              />
            }
            style={{ borderRadius: '24px', textAlign: 'left' }}
          >
            <Text style={{ color: 'rgba(30, 26, 29, 0.38)' }}>{intl.get('lixi.name')}</Text>
            <Text style={{ alignItems: 'center' }}>
              {selectedLixi?.name ?? ''} &nbsp; <EditOutlined onClick={e => showPopulatedRenameLixiModal(e)} />
            </Text>
            {statusLixi()}
          </Descriptions.Item>
          <Descriptions.Item key="desc.button" style={{ justifyContent: 'center' }}>
            <StyleButton shape="round" onClick={archiveButton}>
              {selectedLixi.status == 'active' ? intl.get('lixi.archive') : intl.get('lixi.unarchive')}
            </StyleButton>
            <StyleButton shape="round" onClick={withdrawButton}>
              {intl.get('lixi.withdraw')}
            </StyleButton>
            {selectedLixi.claimType == ClaimType.OneTime && (
              <StyleButton shape="round" onClick={() => handleExportLixi()}>
                {intl.get('lixi.exportLixi')}
              </StyleButton>
            )}
          </Descriptions.Item>
        </Descriptions>
      </React.Fragment>
    );
  };

  const detailLixi = () => {
    switch (selectedLixi.claimType) {
      case ClaimType.Single:
        return (
          <Descriptions
            column={isMobileDetailLixi ? 1 : 3}
            bordered={isMobileDetailLixi ? true : false}
            layout={isMobileDetailLixi ? 'horizontal' : 'vertical'}
            size="small"
            style={{
              paddingBottom: '1%',
              color: 'rgb(23,23,31)'
            }}
          >
            <Descriptions.Item label={intl.get('lixi.type')} key="desc.claimtype">
              {intl.get('account.singleCode')}
            </Descriptions.Item>
            <Descriptions.Item label={intl.get('lixi.rules')} key="desc.rules">
              {typeLixi()}
            </Descriptions.Item>
            <Descriptions.Item label={intl.get('lixi.valuePerClaim')} key="desc.valuePerClaim">
              {rulesLixi()}
            </Descriptions.Item>
            <Descriptions.Item label={intl.get('lixi.validity')} key="desc.validity">
              {formatValidityDate()}
            </Descriptions.Item>
            <Descriptions.Item
              label={intl.get('lixi.validCountries')}
              key="desc.country"
              style={{ borderBottomLeftRadius: '24px' }}
            >
              {countries.find(country => country.id === selectedLixi?.country)?.name ?? intl.get('lixi.allCountries')}
            </Descriptions.Item>
            <Descriptions.Item>
              <Button type="link">{intl.get('general.viewmore')}</Button>
            </Descriptions.Item>
          </Descriptions>
        );
      case ClaimType.OneTime:
        return (
          <Descriptions
            column={isMobileDetailLixi ? 1 : 4}
            bordered={isMobileDetailLixi ? true : false}
            layout={isMobileDetailLixi ? 'horizontal' : 'vertical'}
            size="small"
            style={{
              padding: '0 0 20px 0',
              color: 'rgb(23,23,31)'
            }}
          >
            <Descriptions.Item label={intl.get('account.budget')} key="desc.budget">
              {selectedLixi.amount} {currency.ticker}
            </Descriptions.Item>
            <Descriptions.Item label={intl.get('lixi.type')} key="desc.claimtype">
              {intl.get('account.oneTimeCode')}
            </Descriptions.Item>
            <Descriptions.Item label={intl.get('lixi.rules')} key="desc.rules">
              {typeLixi()}
            </Descriptions.Item>
            <Descriptions.Item label={intl.get('lixi.valuePerClaim')} key="desc.valuePerClaim">
              {rulesLixi()}
            </Descriptions.Item>
            <Descriptions.Item label={intl.get('account.perPack')} key="desc.valuePerClaim">
              {selectedLixi.numberLixiPerPackage} {intl.get('account.lixiForPack')}
            </Descriptions.Item>
            <Descriptions.Item label={intl.get('lixi.validity')} key="desc.validity">
              {formatValidityDate()}
            </Descriptions.Item>
            <Descriptions.Item label={intl.get('lixi.validCountries')} key="desc.country">
              {countries.find(country => country.id === selectedLixi?.country)?.name ?? intl.get('lixi.allCountries')}
            </Descriptions.Item>
            <Descriptions.Item>
              <Button type="link">{intl.get('general.viewmore')}</Button>
            </Descriptions.Item>
            {/* View more */}
          </Descriptions>
        );
    }
  };

  const overviewLixi = () => {
    switch (selectedLixi.claimType) {
      case ClaimType.Single:
        return (
          <>
            <LabelHeader>
              {intl.get('lixi.accountLixi')} &nbsp; <QuestionCircleOutlined />
            </LabelHeader>
            <InfoCard style={{ height: 'fit-content' }}>
              <Descriptions
                column={1}
                bordered
                size="small"
                style={{
                  padding: '1% 0%',
                  color: 'rgb(23,23,31)'
                }}
                contentStyle={{ display: 'table-cell' }}
              >
                <Descriptions.Item
                  key="desc.balance"
                  label={
                    <>
                      <StyledQRCode>
                        <QRCodeModal address={selectedLixi.address} type={QRCodeModalType.address} />
                      </StyledQRCode>
                      <FormattedWalletAddress address={selectedLixi.address} isAccountPage={true} />
                    </>
                  }
                  style={{ borderTopLeftRadius: '24px', borderBottomLeftRadius: '24px' }}
                >
                  <Text style={{ fontSize: '14px', color: 'rgba(30, 26, 29, 0.38)' }}>{intl.get('lixi.balance')}</Text>
                  <Text style={{ fontSize: '22px', color: '#1E1A1D' }}>
                    {fromSmallestDenomination(selectedLixi?.balance) ?? 0} {currency.ticker}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </InfoCard>

            <LabelHeader>{intl.get('claim.claimCode')}</LabelHeader>
            <InfoCard style={{ height: 'fit-content' }}>
              <Descriptions
                column={1}
                bordered
                size="small"
                style={{
                  padding: '1% 0%',
                  color: 'rgb(23,23,31)'
                }}
                contentStyle={{ display: 'table-cell' }}
              >
                <Descriptions.Item
                  key="desc.balance"
                  label={
                    <>
                      <StyledQRCode>
                        <QRCodeModal address={'lixi_' + selectedLixi.claimCode} type={QRCodeModalType.claimCode} />
                      </StyledQRCode>
                      lixi_{selectedLixi.claimCode}
                      {/* <FormattedWalletAddress address={selectedLixi.claimCode} isAccountPage={true} /> */}
                    </>
                  }
                  style={{ borderTopLeftRadius: '24px', borderBottomLeftRadius: '24px' }}
                >
                  <Text style={{ fontSize: '14px', color: 'rgba(30, 26, 29, 0.38)' }}>{intl.get('lixi.claimed')}</Text>
                  <br />
                  <Text style={{ fontSize: '22px', color: '#1E1A1D' }}>
                    {fromSmallestDenomination(selectedLixi?.totalClaim) ?? 0} {currency.ticker}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </InfoCard>
          </>
        );
      case ClaimType.OneTime:
        return (
          <>
            <LabelHeader>{intl.get('lixi.overview')}</LabelHeader>
            <InfoCard className="overview">
              <Descriptions
                column={1}
                bordered
                size="small"
                style={{
                  color: 'rgb(23,23,31)',
                  height: '100%',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Descriptions.Item
                  key="desc.overview"
                  label={
                    <>
                      <Text style={{ color: 'rgba(30, 26, 29, 0.38)', alignItems: 'baseline' }}>
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            background: 'rgb(82, 196, 26)',
                            borderRadius: '4px'
                          }}
                        />
                        &nbsp; {intl.get('lixi.claimed')}
                      </Text>
                      <Text style={{ color: '#1E1A1D', paddingBottom: '24px' }}>
                        {selectedLixi.subLixiTotalClaim.toFixed(2)} {currency.ticker}
                      </Text>
                      <Text style={{ color: 'rgba(30, 26, 29, 0.38)', alignItems: 'baseline' }}>
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            background: '#E37100',
                            borderRadius: '4px'
                          }}
                        />
                        &nbsp; {intl.get('lixi.remaining')}
                      </Text>
                      <Text style={{ color: '#1E1A1D' }}>
                        {(selectedLixi.subLixiBalance - selectedLixi.subLixiTotalClaim).toFixed(2)} {currency.ticker}
                      </Text>
                    </>
                  }
                  style={{ borderTopLeftRadius: '24px', borderBottomLeftRadius: '24px', paddingTop: '0px' }}
                >
                  <Progress
                    showInfo={false}
                    type="circle"
                    strokeColor="#E37100"
                    strokeLinecap="butt"
                    percent={100}
                    success={{
                      percent: (selectedLixi.subLixiTotalClaim * 100) / selectedLixi.subLixiBalance
                    }}
                    style={{ paddingTop: '12.5px' }}
                  />
                </Descriptions.Item>
              </Descriptions>
            </InfoCard>
          </>
        );
    }
  };

  const claimReport = () => {
    switch (selectedLixi.claimType) {
      case ClaimType.Single:
        const lixiClaimedList =
          claimReportSingleCode.length === 0 ? (
            <b>No one has claimed yet</b>
          ) : (
            <LixiClaimedList dataSource={claimReportSingleCode} columns={singleCodeColumns} />
          );
        return lixiClaimedList;
      case ClaimType.OneTime:
        const lixiStatus =
          selectedLixi.status === 'pending' ? (
            <LoadingOutlined />
          ) : (
            <SubLixiList dataSource={subLixies} columns={oneTimeCodeColumns} loadMore={() => showMoreSubLixies()} />
          );
        return lixiStatus;
    }
  };

  return (
    <>
      {selectedLixi && selectedLixi.address ? (
        <>
          <Form>
            <DescriptionsCustom
              bordered
              style={{ width: '100%' }}
              layout={isMobileDetailLixi ? 'vertical' : 'horizontal'}
            >
              <Descriptions.Item>
                <>
                  <LabelHeader>{intl.get('lixi.detail')}</LabelHeader>
                  <InfoCard>
                    {/* Image, name, status lixi */}
                    {infoLixi()}

                    {/* Detail */}
                    {detailLixi()}
                  </InfoCard>
                </>
              </Descriptions.Item>

              <Descriptions.Item>
                {/* Address or Overview */}
                {overviewLixi()}
              </Descriptions.Item>
            </DescriptionsCustom>

            {/* Claim report */}
            <LabelHeader>{intl.get('claim.claimReport')}</LabelHeader>
            {claimReport()}
          </Form>

          {/* Reload Lixi */}
          <SmartButton onClick={() => handleRefeshLixi()}>
            <ReloadOutlined /> {intl.get('lixi.refreshLixi')}
          </SmartButton>
        </>
      ) : (
        intl.get('lixi.noLixiSelected')
      )}
    </>
  );
};
export default Lixi;
