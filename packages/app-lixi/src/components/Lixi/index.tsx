import { WalletContext } from '@context/index';
import { Button, Descriptions, message, Popover, Progress, Space } from 'antd';
import { saveAs } from 'file-saver';
import { toPng } from 'html-to-image';
import * as _ from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import intl from 'react-intl-universal';
import { getAllClaims } from '@store/claim/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import {
  archiveLixi,
  fetchMoreSubLixies,
  refreshLixi,
  renameLixi,
  setLixiBalance,
  unarchiveLixi,
  withdrawLixi
} from '@store/lixi/actions';
import { getHasMoreSubLixies, getSelectedLixi, getSelectedLixiId } from '@store/lixi/selectors';
import { showToast } from '@store/toast/actions';
import styled from 'styled-components';

import {
  CaretRightOutlined,
  CopyOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  WarningOutlined
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
import { exportSubLixies } from '@store/lixi/actions';
import { RenameLixiModalProps } from './RenameLixiModal';
import SubLixiList from './SubLixiList';
import LixiClaimedList from './LixiClaimedList';
import useWindowDimensions from '@hooks/useWindowDimensions';
import { QRCodeModal } from '@components/Common/QRCodeModal';
import { QRCodeModalType } from '@bcpros/lixi-models/constants';
import { PageMessageSessionStatus } from '@generated/types.generated';

type CopiedProps = {
  style?: React.CSSProperties;
};

export const InfoSubCard = ({
  icon,
  typeName,
  content,
  onClickIcon
}: {
  icon?: React.FC;
  typeName?: any;
  content: any;
  onClickIcon?: (e) => void;
}) => (
  <StyledInfoSubCard onClick={onClickIcon}>
    <p className="type-name">{typeName}</p>
    <p className="content">
      {content} <span>{icon && React.createElement(icon)}</span>{' '}
    </p>
  </StyledInfoSubCard>
);

const WrapperDetailLixi = styled.div`
  @media screen and (max-width: 960px) {
    // padding-bottom: 9rem;
  }
`;

const DetailLixiContainer = styled.div`
  justify-content: space-between;
  display: flex;
  gap: 2rem;
  margin: 1rem 0;
  .detail-lixi-single {
    display: flex;
    flex-direction: column;
    flex-grow: 3;
    text-align: left;
    .info-detail-lixi {
      height: 100%;
      background: #ffffff;
      border: 1px solid rgba(128, 116, 124, 0.12);
      border-radius: var(--border-radius-primary);
      padding: 2rem;
      .card-lixi {
        display: flex;
        gap: 2rem;
        @media screen and (max-width: 960px) {
          flex-direction: column;
        }
        .ant-space {
          min-width: 130px;
          @media screen and (max-width: 960px) {
            min-width: auto;
          }
        }
        .card-name {
          flex-direction: row;
          display: flex;
          gap: 2rem;
          @media screen and (max-width: 960px) {
            .ant-space {
              flex-direction: column;
              justify-content: center;
              gap: 2rem;
              align-items: baseline;
            }
          }
        }
      }
      .group-action-btn {
        flex-grow: 1;
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        button {
          margin: 0;
        }
        @media screen and (max-width: 1100px) {
          justify-content: center;
        }
      }
      @media screen and (max-width: 960px) {
        padding: 1rem;
      }
    }
  }
  .qr-code-lixi-single {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    .sub-box-qrCode {
      text-align: left;
      .content-box-qrCode {
        display: flex;
        justify-content: space-between;
        background: #ffffff;
        border: 1px solid rgba(128, 116, 124, 0.12);
        border-radius: var(--border-radius-primary);
        padding: 1rem;
      }
      @media screen and (max-width: 960px) {
        .ant-space {
          flex-direction: column;
          justify-content: center;
          align-items: baseline;
        }
      }
    }
  }

  .chart-container {
    display: flex;
    flex-direction: column;
    .overview-one-time {
      height: 100%;
      background: #ffffff;
      border: 1px solid rgba(128, 116, 124, 0.12);
      border-radius: var(--border-radius-primary);
      display: flex;
      gap: 2rem;
      align-items: center;
      padding: 2rem;
      justify-content: space-between;
      @media screen and (max-width: 960px) {
        padding: 1rem;
      }
    }
  }
  @media screen and (max-width: 960px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const StyledInfoSubCard = styled(Space)`
  display: flex;
  gap: 4px !important;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  @media screen and (max-width: 960px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  .type-name {
    color: rgba(30, 26, 29, 0.38);
    letter-spacing: 0.1px;
    margin: 0;
    font-weight: 500;
  }
  .content {
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.5px;
    color: #1e1a1d;
    margin: 0;
  }
`;

const LabelHeader = styled.h4`
  font-weight: 400;
  font-size: 22px;
  line-height: 28px;
  text-align: left;
  color: #1e1a1d;
`;

const BlankClaim = styled.div`
  background: #ffffff;
  border: 1px solid rgba(128, 116, 124, 0.12);
  border-radius: var(--border-radius-primary);
  padding: 2rem;
`;

const Text = styled.p`
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 24px;
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
      width: 77px;
      height: 77px;
    }
    @media (min-width: 768px) {
      border-radius: 18px;
      width: 77px;
      height: 77px;
    }
  }
`;

const StyledStatusContainer = styled.div`
  display: flex;
  gap: 5px;
`;

const Lixi = props => {
  const { lixi } = props;
  const dispatch = useAppDispatch();
  const Wallet = React.useContext(WalletContext);
  const { XPI } = Wallet;
  const selectedAccount = useAppSelector(getSelectedAccount);
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
    dispatch(
      showToast('info', {
        message: intl.get('toast.erroinfo'),
        description: intl.get('claim.claimCodeCopied')
      })
    );
  };

  const handleOnCopyDistributionAddress = () => {
    dispatch(
      showToast('info', {
        message: intl.get('toast.info'),
        description: intl.get('lixi.addressCopied')
      })
    );
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
    switch (selectedLixi?.claimType) {
      case ClaimType.Single:
        switch (selectedLixi?.lixiType) {
          case LixiType.Fixed:
            return (
              <React.Fragment>
                {selectedLixi.fixedValue} {currency.ticker}
              </React.Fragment>
            );
          case LixiType.Divided:
            return <React.Fragment> {selectedLixi.dividedValue} </React.Fragment>;
          case LixiType.Random:
            return (
              <React.Fragment>
                {selectedLixi?.minValue}-{selectedLixi?.maxValue} {currency.ticker}
              </React.Fragment>
            );
        }
        break;
      case ClaimType.OneTime:
        switch (selectedLixi?.lixiType) {
          case LixiType.Equal:
            return (
              <React.Fragment>
                {selectedLixi.subLixiBalance / selectedLixi.numberOfSubLixi} {currency.ticker}
              </React.Fragment>
            );
          case LixiType.Random:
            return (
              <React.Fragment>
                {selectedLixi?.minValue}-{selectedLixi?.maxValue} {currency.ticker}
              </React.Fragment>
            );
        }
        break;
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
        return (
          <>
            {moment(activeAt).format('YYYY-MM-DD HH:mm')} - {'N/A'}
          </>
        );
      case _.isEmpty(activeAt) && !_.isEmpty(expiryAt):
        return (
          <>
            {'N/A'} - {moment(expiryAt).format('YYYY-MM-DD HH:mm')}
          </>
        );
      case !_.isEmpty(activeAt) && !_.isEmpty(expiryAt):
        return (
          <>
            {moment(activeAt).format('YYYY-MM-DD HH:mm')} - <br /> {moment(expiryAt).format('YYYY-MM-DD HH:mm')}
          </>
        );
      default:
        return <>{`'N/A' - 'N/A'`}</>;
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

  const StatusOfLixi = () => {
    let bgStatus = '';
    let status = '';
    if (moment().isAfter(selectedLixi.expiryAt)) {
      bgStatus = '#74546F';
      status = `general.ended`;
    } else {
      switch (selectedLixi.status) {
        case 'active':
          bgStatus = '#2F80ED';
          status = `general.running`;
          break;
        case 'pending':
          bgStatus = '#E37100';
          status = `general.waiting`;
          break;
        case 'locked':
          bgStatus = '#BA1A1A';
          status = `lixi.archived`;
          break;
        case 'failed':
          bgStatus = '#BA1A1A';
          status = `general.failed`;
          break;
        case 'withdrawn':
          bgStatus = '#CDC4C8';
          status = `lixi.withdrawn`;
          break;
      }
    }
    return (
      <p
        style={{
          width: 'fit-content',
          color: '#FFFFFF',
          padding: '6px 8px',
          borderRadius: '8px',
          alignItems: 'center',
          fontWeight: '400',
          fontSize: '14px',
          letterSpacing: '0.25px',
          marginTop: '4px',
          background: bgStatus,
          marginBottom: '0'
        }}
      >
        {intl.get(status)}
      </p>
    );
  };

  const GroupActionBtn = () => {
    return (
      <>
        <div className="group-action-btn">
          <StyleButton shape="round" onClick={archiveButton} disabled={selectedLixi.pageMessageSession}>
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
        </div>
      </>
    );
  };

  const DetailLixi = () => {
    switch (selectedLixi.claimType) {
      case ClaimType.Single:
        return (
          <DetailLixiContainer>
            <div className="detail-lixi-single">
              <LabelHeader>{intl.get('lixi.detail')}</LabelHeader>
              <div className="info-detail-lixi">
                <div className="card-lixi">
                  <div className="card-name">
                    <img width={80} height={80} src="/images/default-img-lixi.svg" alt="" />
                    <div>
                      <InfoSubCard
                        typeName={'Name'}
                        content={selectedLixi?.name}
                        onClickIcon={e => showPopulatedRenameLixiModal(e)}
                        icon={EditOutlined}
                      />
                      <StyledStatusContainer>
                        {StatusOfLixi()}
                        {selectedLixi.pageMessageSession &&
                          claimReportSingleCode.length === 0 &&
                          selectedLixi.pageMessageSession.status !== PageMessageSessionStatus.Close && (
                            <Popover content={'This lixi is for page message. If claimed, the session will close'}>
                              <WarningOutlined style={{ fontSize: '20px', color: '#FF9966' }} />
                            </Popover>
                          )}
                      </StyledStatusContainer>
                    </div>
                  </div>
                  {GroupActionBtn()}
                </div>
                <div style={{ margin: '2rem 0' }} className="card-lixi">
                  <InfoSubCard typeName={intl.get('lixi.type')} content={intl.get('account.singleCode')} />
                  <InfoSubCard typeName={intl.get('lixi.rules')} content={typeLixi()} />
                  <InfoSubCard typeName={intl.get('lixi.valuePerClaim')} content={rulesLixi()} />
                </div>
                <div className="card-lixi">
                  <InfoSubCard typeName={intl.get('lixi.validity')} content={formatValidityDate()} />
                  <InfoSubCard
                    typeName={intl.get('lixi.validCountries')}
                    content={
                      countries.find(country => country.id === selectedLixi?.country)?.name ??
                      intl.get('lixi.allCountries')
                    }
                  />
                  <InfoSubCard typeName={intl.get('general.viewmore')} content={'None'} />
                </div>
              </div>
            </div>

            {Overview()}
          </DetailLixiContainer>
        );
      case ClaimType.OneTime:
        return (
          <>
            <DetailLixiContainer className="detail-lixi">
              <div className="detail-lixi-single">
                <LabelHeader>{intl.get('lixi.detail')}</LabelHeader>
                <div className="info-detail-lixi">
                  <div className="card-lixi">
                    <div className="card-name">
                      <img
                        width={80}
                        height={80}
                        src={selectedLixi.envelope ? selectedLixi.envelope.image : '/images/default-img-lixi.svg'}
                        alt=""
                      />
                      <div>
                        <InfoSubCard typeName={'Name'} content={selectedLixi?.name} />
                        {StatusOfLixi()}
                      </div>
                    </div>
                    {GroupActionBtn()}
                  </div>
                  <div style={{ margin: '2rem 0' }} className="card-lixi">
                    <InfoSubCard typeName={intl.get('account.budget')} content={selectedLixi.subLixiBalance} />
                    <InfoSubCard typeName={intl.get('lixi.type')} content={intl.get('account.oneTimeCode')} />
                    <InfoSubCard typeName={intl.get('lixi.rules')} content={typeLixi()} />
                    <InfoSubCard typeName={intl.get('lixi.valuePerClaim')} content={rulesLixi()} />
                  </div>
                  <div className="card-lixi">
                    <InfoSubCard
                      typeName={intl.get('account.perPack')}
                      content={
                        selectedLixi.numberLixiPerPackage
                          ? selectedLixi.numberLixiPerPackage + ' ' + intl.get('account.lixiForPack')
                          : 'None'
                      }
                    />
                    <InfoSubCard typeName={intl.get('lixi.validity')} content={formatValidityDate()} />
                    <InfoSubCard
                      typeName={intl.get('lixi.validCountries')}
                      content={
                        countries.find(country => country.id === selectedLixi?.country)?.name ??
                        intl.get('lixi.allCountries')
                      }
                    />
                    <InfoSubCard typeName={intl.get('general.viewmore')} content={'None'} />
                  </div>
                </div>
              </div>

              {Overview()}
            </DetailLixiContainer>
          </>
        );
    }
  };

  const Overview = () => {
    switch (selectedLixi.claimType) {
      case ClaimType.Single:
        return (
          <>
            <div className="qr-code-lixi-single">
              <div className="sub-box-qrCode">
                <LabelHeader>{intl.get('lixi.accountLixi')}</LabelHeader>
                <div className="content-box-qrCode">
                  <div style={{ textAlign: 'center' }}>
                    <StyledQRCode>
                      <QRCodeModal address={selectedLixi.address} type={QRCodeModalType.address} />
                    </StyledQRCode>
                    <FormattedWalletAddress address={selectedLixi.address} isAccountPage={true} />
                  </div>
                  <InfoSubCard
                    typeName={'Balance'}
                    content={fromSmallestDenomination(selectedLixi?.balance).toFixed(2) + ' ' + currency.ticker}
                  />
                </div>
              </div>
              <div className="sub-box-qrCode">
                <LabelHeader>{intl.get('claim.claimCode')}</LabelHeader>
                <div className="content-box-qrCode">
                  <div style={{ textAlign: 'center' }}>
                    <StyledQRCode>
                      <QRCodeModal address={'lixi_' + selectedLixi.claimCode} type={QRCodeModalType.claimCode} />
                    </StyledQRCode>
                    <FormattedWalletAddress address={`lixi_${selectedLixi.claimCode}`} isAccountPage={true} />
                    {/* lixi_{selectedLixi.claimCode} */}
                  </div>
                  <InfoSubCard
                    typeName={intl.get('lixi.claimed')}
                    content={fromSmallestDenomination(selectedLixi?.totalClaim).toFixed(2) + ' ' + currency.ticker}
                  />
                </div>
              </div>
            </div>
          </>
        );
      case ClaimType.OneTime:
        return (
          <>
            <div className="chart-container">
              <LabelHeader>{intl.get('lixi.overview')}</LabelHeader>
              <div className="overview-one-time">
                <div className="info-chart-overview">
                  <Text className="type-claim" style={{ color: 'rgba(30, 26, 29, 0.38)', alignItems: 'baseline' }}>
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
                  <Text className="claim-amount" style={{ color: '#1E1A1D', paddingBottom: '24px' }}>
                    {selectedLixi.subLixiTotalClaim.toFixed(2)} {currency.ticker}
                  </Text>
                  <Text className="type-claim" style={{ color: 'rgba(30, 26, 29, 0.38)', alignItems: 'baseline' }}>
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
                  <Text className="claim-amount" style={{ color: '#1E1A1D' }}>
                    {(selectedLixi.subLixiBalance - selectedLixi.subLixiTotalClaim).toFixed(2)} {currency.ticker}
                  </Text>
                </div>
                <Progress
                  showInfo={false}
                  type="circle"
                  strokeColor="#E37100"
                  strokeLinecap="butt"
                  percent={100}
                  success={{
                    percent: (selectedLixi.subLixiTotalClaim * 100) / selectedLixi.subLixiBalance
                  }}
                />
              </div>
            </div>
          </>
        );
    }
  };

  const ClaimReport = () => {
    switch (selectedLixi.claimType) {
      case ClaimType.Single:
        const lixiClaimedListSingle =
          claimReportSingleCode.length === 0 ? (
            <>
              <LabelHeader>{intl.get('claim.claimReport')}</LabelHeader>
              <BlankClaim className="blank-claim">
                <b>No one has claimed yet</b>
              </BlankClaim>
            </>
          ) : (
            <>
              <LabelHeader>{intl.get('claim.claimReport')}</LabelHeader>
              <LixiClaimedList dataSource={claimReportSingleCode} columns={singleCodeColumns} />
            </>
          );
        return lixiClaimedListSingle;
      case ClaimType.OneTime:
        const lixiClaimedListOneTime =
          subLixies.length === 0 ? (
            <>
              <LabelHeader>{intl.get('claim.claimReport')}</LabelHeader>
              <BlankClaim className="blank-claim">
                <b>No one has claimed yet</b>
              </BlankClaim>
            </>
          ) : (
            <>
              <LabelHeader>{intl.get('claim.claimReport')}</LabelHeader>
              <SubLixiList dataSource={subLixies} columns={oneTimeCodeColumns} loadMore={() => showMoreSubLixies()} />
            </>
          );
        return lixiClaimedListOneTime;
    }
  };

  return (
    <>
      {selectedLixi && selectedLixi.address ? (
        <React.Fragment>
          <WrapperDetailLixi className="detail-lixi">
            {DetailLixi()}
            {ClaimReport()}

            {/* Reload Lixi */}
            <SmartButton style={{ marginTop: '1rem' }} onClick={() => handleRefeshLixi()}>
              <ReloadOutlined /> {intl.get('lixi.refreshLixi')}
            </SmartButton>
          </WrapperDetailLixi>
        </React.Fragment>
      ) : (
        intl.get('lixi.noLixiSelected')
      )}
    </>
  );
};
export default Lixi;
