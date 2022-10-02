import {
  Button,
  Checkbox,
  Col,
  Collapse,
  Descriptions,
  Form,
  Image,
  Input,
  List,
  message,
  Modal,
  Progress,
  Row,
  Tabs,
  Typography
} from 'antd';
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
  getLixi,
  refreshLixi,
  renameLixi,
  setLixiBalance,
  unarchiveLixi,
  withdrawLixi
} from 'src/store/lixi/actions';
import {
  getHasMoreSubLixies,
  getLixiesBySelectedAccount,
  getSelectedLixi,
  getSelectedLixiId
} from 'src/store/lixi/selectors';
import { WalletContext } from 'src/store/store';
import { showToast } from 'src/store/toast/actions';
import styled from 'styled-components';

import { green, red } from '@ant-design/colors';
import {
  CaretRightOutlined,
  CopyOutlined,
  DownloadOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
  FilterOutlined,
  LoadingOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  SearchOutlined
} from '@ant-design/icons';
import BalanceHeader from '@bcpros/lixi-components/components/Common/BalanceHeader';
import { SmartButton } from '@bcpros/lixi-components/components/Common/PrimaryButton';
import { QRClaimCode } from '@bcpros/lixi-components/components/Common/QRClaimCode';
import QRCode, { FormattedWalletAddress } from '@bcpros/lixi-components/components/Common/QRCode';
import { StyledCollapse } from '@bcpros/lixi-components/components/Common/StyledCollapse';
import WalletLabel from '@bcpros/lixi-components/components/Common/WalletLabel';
import { countries } from '@bcpros/lixi-models/constants/countries';
import {
  ArchiveLixiCommand,
  LixiType,
  LotteryAddress,
  RenameLixiCommand,
  UnarchiveLixiCommand,
  WithdrawLixiCommand
} from '@bcpros/lixi-models/lib/lixi';
import ClaimList from '@components/Claim/ClaimList';
import { currency } from '@components/Common/Ticker';
import { getSelectedAccount } from '@store/account/selectors';
import { getAllSubLixies, getLoadMoreSubLixiesStartId } from '@store/lixi/selectors';
import { fromSmallestDenomination, toSmallestDenomination } from '@utils/cashMethods';
import { numberToBase58 } from '@utils/encryptionMethods';

import { ClaimType } from '../../../../lixi-models/src/lib/lixi';
import lixiLogo from '../../assets/images/lixi_logo.svg';
import { exportSubLixies } from '../../store/lixi/actions';
import VirtualTable from './SubLixiListScroll';
import { RenameLixiModalProps } from './RenameLixiModal';
import { openModal } from '@store/modal/actions';

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

const InfoCard = styled.div`
  box-sizing: border-box;
  position: inherit;
  width: 100%;
  height: fit-content;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 24px;

  img {
    border-radius: 16px;
    height: 80px;
    width: 80px;
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
  }

  .ant-descriptions-bordered {
    .ant-descriptions-view {
      border: none;
    }

    .ant-descriptions-row {
      border-bottom: none;
    }
  }
`;

const Text = styled.p`
  position: absolute;
  height: 24px;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  display: flex;
  color: #333333;
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
  text-align: right;
  opacity: 0.7;
  #borderedQRCode {
    @media (max-width: 768px) {
      border-radius: 18px;
      width: 120px;
      height: 120px;
    }
    @media (min-width: 768px) {
      border-radius: 18px;
      width: 120px;
      height: 120px;
    }
  }
`;

const { Panel } = Collapse;
const Lixi: React.FC = () => {
  const dispatch = useAppDispatch();
  const ContextValue = React.useContext(WalletContext);
  const { XPI, Wallet } = ContextValue;
  const selectedAccount = useAppSelector(getSelectedAccount);
  const selectedLixiId = useAppSelector(getSelectedLixiId);
  const selectedLixi = useAppSelector(getSelectedLixi);
  const allClaimsCurrentLixi = useAppSelector(getAllClaims);
  const [claimCodeVisible, setClaimCodeVisible] = useState(false);
  const qrPanelRef = React.useRef(null);
  const [isLoadBalanceError, setIsLoadBalanceError] = useState(false);
  const hasMoreSubLixies = useAppSelector(getHasMoreSubLixies);
  const loadMoreStartId = useAppSelector(getLoadMoreSubLixiesStartId);
  let subLixies = useAppSelector(getAllSubLixies);

  subLixies = _.sortBy(subLixies, ['isClaimed', 'packageId']);

  const [loadings, setLoadings] = useState<boolean[]>([]);

  useEffect(() => {
    if (selectedLixi) {
      dispatch(getLixi(selectedLixi.id));
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      XPI.Electrumx.balance(selectedLixi?.address)
        .then(result => {
          if (result && result.balance) {
            const balance = result.balance.confirmed + result.balance.unconfirmed;
            dispatch(setLixiBalance(balance ?? 0));
          }
        })
        .catch(e => {
          setIsLoadBalanceError(true);
        });
    }, 10000);
    return () => {
      return clearInterval(id);
    };
  }, []);

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
    { title: 'Value redeem (XPI)', dataIndex: 'amount' },
    { title: 'Time of claim', dataIndex: 'createAt' }
  ];

  const claimReportSingleCode = allClaimsCurrentLixi.map((item, i) => {
    return {
      num: i + 1,
      amount: item.amount.toFixed(2),
      createAt: item.createdAt
    };
  });

  const onetimeCodeColumns = [
    { title: intl.get('general.num'), dataIndex: 'num', width: 70 },
    { title: 'Code', dataIndex: 'claimCode' },
    { title: 'Value redeem (XPI)', dataIndex: 'amount' },
    { title: 'Statusses', dataIndex: 'isClaimed' }
  ];
  const prefixClaimCode = 'lixi';

  const subLixiesDataSource = subLixies.map((item, i) => {
    return {
      num: i + 1,
      claimCode: (
        <CopyToClipboard text={`${prefixClaimCode}_${item.claimCode}`} onCopy={handleOnCopyClaimCode}>
          <div>
            <CopyOutlined /> {`${prefixClaimCode}_${item.claimCode}`}
          </div>
        </CopyToClipboard>
      ),
      amount: item.amount.toFixed(2),
      isClaimed: item.isClaimed ? (
        <Text
          style={{
            color: '#FFFFFF',
            padding: '4px 8px',
            borderRadius: '8px',
            fontWeight: '400',
            fontSize: '14px',
            background: '#598300'
          }}
        >
          Redeemed
        </Text>
      ) : (
        <Text
          style={{
            color: '#FFFFFF',
            padding: '4px 8px',
            borderRadius: '8px',
            fontWeight: '400',
            fontSize: '14px',
            background: '#E37100'
          }}
        >
          Remaining
        </Text>
      )
    };
  });

  const showMoreSubLixies = () => {
    dispatch(fetchMoreSubLixies({ parentId: selectedLixi.id, startId: loadMoreStartId }));
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
          Ended
        </Text>
      );
    } else {
      switch (selectedLixi.status) {
        case 'active':
          return (
            <Text
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
              Running
            </Text>
          );
        case 'pending':
          return (
            <Text
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
              Waiting
            </Text>
          );
        case 'locked':
          return (
            <Text
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
              Archived
            </Text>
          );
      }
    }
  };

  const infoLixi = () => {
    return (
      <Descriptions
        column={1}
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
          style={{ borderTopLeftRadius: '24px' }}
        >
          <Text style={{ color: 'rgba(30, 26, 29, 0.38)' }}>{intl.get('lixi.name')}</Text>
          <br />
          <Text style={{ alignItems: 'center' }}>
            {selectedLixi?.name ?? ''} &nbsp; <EditOutlined onClick={e => showPopulatedRenameLixiModal(e)} />
          </Text>
          <br />
          {statusLixi()}
        </Descriptions.Item>
        <Descriptions.Item key="desc.button">
          <StyleButton shape="round" onClick={archiveButton}>
            {selectedLixi.status == 'active' ? intl.get('lixi.archive') : intl.get('lixi.unarchive')}
          </StyleButton>
          <StyleButton shape="round" onClick={withdrawButton}>
            {intl.get('lixi.withdraw')}
          </StyleButton>
          {selectedLixi.claimType == ClaimType.OneTime &&
            <StyleButton shape="round" onClick={() => handleExportLixi()}>
              {intl.get('lixi.exportLixi')}
            </StyleButton>
          }
        </Descriptions.Item>
      </Descriptions>
    );
  };

  const detailLixi = () => {
    switch (selectedLixi.claimType) {
      case ClaimType.Single:
        return (
          <Descriptions
            column={1}
            bordered
            size="small"
            style={{
              paddingBottom: '1%',
              color: 'rgb(23,23,31)'
            }}
          >
            <Descriptions.Item label={intl.get('lixi.type')} key="desc.claimtype">
              Single Code
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
          </Descriptions>
        );
      case ClaimType.OneTime:
        return (
          <Descriptions
            column={1}
            bordered
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
              One-time Codes
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
            <Descriptions.Item label={intl.get('lixi.validCountries')} key="desc.country">
              {countries.find(country => country.id === selectedLixi?.country)?.name ?? intl.get('lixi.allCountries')}
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
              {intl.get('lixi.detail')} &nbsp; <QuestionCircleOutlined />
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
                        <QRCode address={selectedAccount?.address} isAccountPage={true} />
                      </StyledQRCode>
                      <FormattedWalletAddress address={selectedAccount?.address} isAccountPage={true} />
                    </>
                  }
                  style={{ borderTopLeftRadius: '24px', borderBottomLeftRadius: '24px' }}
                >
                  <Text style={{ fontSize: '14px', color: 'rgba(30, 26, 29, 0.38)' }}>{intl.get('lixi.balance')}</Text>
                  <br />
                  <Text style={{ fontSize: '22px', color: '#1E1A1D' }}>
                    {fromSmallestDenomination(selectedLixi?.balance) ?? 0} {currency.ticker}
                  </Text>
                  <br />
                  {/* Convert XPI to USD */}
                </Descriptions.Item>
              </Descriptions>
            </InfoCard>

            <LabelHeader>Claim code </LabelHeader>
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
                        <QRCode address={selectedLixi.claimCode} isAccountPage={true} />
                      </StyledQRCode>
                      {selectedLixi.claimCode}
                      {/* <FormattedWalletAddress address={selectedLixi.claimCode} isAccountPage={true} /> */}
                    </>
                  }
                  style={{ borderTopLeftRadius: '24px', borderBottomLeftRadius: '24px' }}
                >
                  <Text style={{ fontSize: '14px', color: 'rgba(30, 26, 29, 0.38)' }}>Claimed</Text>
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
            <InfoCard style={{ height: 'fit-content' }}>
              <Descriptions
                column={1}
                bordered
                size="small"
                style={{
                  color: 'rgb(23,23,31)'
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
                        &nbsp; Claimed
                      </Text>
                      <br />
                      <Text style={{ color: '#1E1A1D', paddingBottom: '24px' }}>
                        {fromSmallestDenomination(_.sumBy(subLixies, 'totalClaim'))} {currency.ticker}
                      </Text>
                      <br />
                      <br />
                      <Text style={{ color: 'rgba(30, 26, 29, 0.38)', alignItems: 'baseline' }}>
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            background: '#E37100',
                            borderRadius: '4px'
                          }}
                        />
                        &nbsp; Remaining
                      </Text>
                      <br />
                      <Text style={{ color: '#1E1A1D' }}>
                        {fromSmallestDenomination(_.sumBy(subLixies, 'amount')) ?? '0'} {currency.ticker}
                      </Text>
                    </>
                  }
                  style={{ borderTopLeftRadius: '24px', borderBottomLeftRadius: '24px', paddingTop: '0px' }}
                >
                  <Progress
                    showInfo={false}
                    type="circle"
                    strokeColor="#E37100"
                    percent={100}
                    success={{
                      percent:
                        fromSmallestDenomination(_.sumBy(subLixies, 'totalClaim')) /
                        (fromSmallestDenomination(_.sumBy(subLixies, 'amount')) +
                          fromSmallestDenomination(_.sumBy(subLixies, 'totalClaim')))
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
        return (
          <VirtualTable
            columns={singleCodeColumns}
            dataSource={claimReportSingleCode}
            scroll={{ y: claimReportSingleCode.length * 54 <= 270 ? claimReportSingleCode.length * 54 : 270 }}
          />
        );
      case ClaimType.OneTime:
        return (
          <>
            <VirtualTable
              columns={onetimeCodeColumns}
              dataSource={subLixiesDataSource}
              scroll={{ y: subLixiesDataSource.length * 54 <= 270 ? subLixiesDataSource.length * 54 : 270 }}
            />
            {hasMoreSubLixies && (
              <SmartButton onClick={() => showMoreSubLixies()}>{intl.get('lixi.loadmore')}</SmartButton>
            )}
          </>
        );
    }
  }

  return (
    <>
      {selectedLixi && selectedLixi.address ? (
        <>
          <Form>
            <LabelHeader>{intl.get('lixi.detail')}</LabelHeader>
            <InfoCard>
              {/* Image, name, status lixi */}
              {infoLixi()}

              {/* Detail */}
              {detailLixi()}
            </InfoCard>

            {/* Address or Overview */}
            {overviewLixi()}

            {/* Claim report */}
            <LabelHeader>Claim report</LabelHeader>
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
