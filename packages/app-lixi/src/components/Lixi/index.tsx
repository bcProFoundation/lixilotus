import { Collapse, Descriptions, message } from 'antd';
import { saveAs } from 'file-saver';
import { toPng } from 'html-to-image';
import * as _ from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import intl from 'react-intl-universal';
import { getAllClaims } from 'src/store/claim/selectors';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { fetchMoreSubLixies, getLixi, refreshLixi, setLixiBalance } from 'src/store/lixi/actions';
import { getHasMoreSubLixies, getSelectedLixi, getSelectedLixiId } from 'src/store/lixi/selectors';
import { AppContext } from 'src/store/store';
import { showToast } from 'src/store/toast/actions';
import styled from 'styled-components';

import { CaretRightOutlined, CopyOutlined, DownloadOutlined, ExportOutlined, LoadingOutlined, ReloadOutlined } from '@ant-design/icons';
import BalanceHeader from '@bcpros/lixi-components/components/Common/BalanceHeader';
import { SmartButton } from '@bcpros/lixi-components/components/Common/PrimaryButton';
import { QRClaimCode } from '@bcpros/lixi-components/components/Common/QRClaimCode';
import QRCode from '@bcpros/lixi-components/components/Common/QRCode';
import { StyledCollapse } from '@bcpros/lixi-components/components/Common/StyledCollapse';
import WalletLabel from '@bcpros/lixi-components/components/Common/WalletLabel';
import { countries } from '@bcpros/lixi-models/constants/countries';
import { LixiType } from '@bcpros/lixi-models/lib/lixi';
import ClaimList from '@components/Claim/ClaimList';
import { currency } from '@components/Common/Ticker';
import { getSelectedAccount } from '@store/account/selectors';
import { getAllSubLixies, getLoadMoreSubLixiesStartId } from '@store/lixi/selectors';
import { fromSmallestDenomination, toSmallestDenomination } from '@utils/cashMethods';

import { ClaimType } from '../../../../lixi-models/src/lib/lixi';
import lixiLogo from '../../assets/images/lixi_logo.svg';
import { exportSubLixies } from '../../store/lixi/actions';
import VirtualTable from './SubLixiListScroll';

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

const { Panel } = Collapse;

const Lixi: React.FC = () => {
  const dispatch = useAppDispatch();
  const ContextValue = React.useContext(AppContext);
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

  subLixies = _.sortBy(subLixies, ['isClaimed']);

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
        return (
          <>
            {intl.get('account.fixed')} {selectedLixi.fixedValue} {currency.ticker}
          </>
        );
      case LixiType.Divided:
        return (
          <>
            {intl.get('lixi.dividedBy')} {selectedLixi.dividedValue}{' '}
          </>
        );
      case LixiType.Equal:
        return (
          <>
            {intl.get('account.equal')} {selectedLixi.amount / selectedLixi.numberOfSubLixi} {currency.ticker}
          </>
        );
      default:
        return (
          <>
            {intl.get('account.random')} {selectedLixi?.minValue}-{selectedLixi?.maxValue} {currency.ticker}
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

  const columns = [
    { title: 'Num', dataIndex: 'num', width: 70 },
    { title: 'Claim Code', dataIndex: 'claimCode' },
    { title: 'Amount', dataIndex: 'amount' }
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
      amount: item.isClaimed ? 0 : item.amount == 0 ? 0 : (item.amount - 0.000455).toFixed(2)
    };
  });

  const showMoreSubLixies = () => {
    dispatch(fetchMoreSubLixies({ parentId: selectedLixi.id, startId: loadMoreStartId }));
  };

  return (
    <>
      {selectedLixi && selectedLixi.address ? (
        <>
          <WalletLabel name={selectedLixi?.name ?? ''} />
          <BalanceHeader
            balance={
              selectedLixi.claimType == ClaimType.Single
                ? fromSmallestDenomination(selectedLixi?.balance) ?? 0
                : _.sumBy(subLixies, 'amount').toFixed(2) + fromSmallestDenomination(selectedLixi?.balance)
            }
            ticker={currency.ticker}
          />
          {selectedLixi?.claimType === ClaimType.Single ? <QRCode address={selectedLixi.address} /> : <></>}
          <Descriptions
            column={1}
            bordered
            title={intl.get('lixi.lixiInfo', { lixiName: selectedLixi.name })}
            style={{
              padding: '0 0 20px 0',
              color: 'rgb(23,23,31)'
            }}
          >
            <Descriptions.Item label={intl.get('lixi.claimType')} key="desc.claimtype">
              {selectedLixi.claimType == ClaimType.Single ? 'Single' : 'One-Time Codes'}
            </Descriptions.Item>
            <Descriptions.Item label={intl.get('lixi.type')} key="desc.type">
              {typeLixi()}
            </Descriptions.Item>
            <Descriptions.Item label={intl.get('lixi.totalClaimed')} key="desc.totalclaimed">
              {selectedLixi.claimType == ClaimType.Single
                ? fromSmallestDenomination(selectedLixi?.totalClaim) ?? 0
                : fromSmallestDenomination(_.sumBy(subLixies, 'totalClaim')).toFixed(2)}{' '}
              {currency.ticker}
            </Descriptions.Item>
            <Descriptions.Item label={intl.get('lixi.remainingLixi')} key="desc.claim">
              {showRedemption()}
            </Descriptions.Item>
            {selectedLixi.envelopeMessage && (
              <Descriptions.Item label={intl.get('lixi.message')}>{selectedLixi?.envelopeMessage}</Descriptions.Item>
            )}
            {showCountry()}
            {showMinStaking()}
            {formatActivationDate()}
            {formatDate()}
            {showIsFamilyFriendly()}
            {showIsNFTEnabled()}
          </Descriptions>

          {/* Lixi details */}
          <StyledCollapse
            style={{ marginBottom: '20px' }}
            collapsible={selectedLixi.status == 'active' ? "header" : "disabled"}
            expandIcon={({ isActive }) => (selectedLixi.status == 'active') ? <CaretRightOutlined rotate={isActive ? 90 : 0} /> : <LoadingOutlined />}
          >
            <Panel header={intl.get('lixi.lixiDetail')} key="panel-1">
              {selectedLixi.claimType == ClaimType.Single ? (
                <>
                  <div ref={qrPanelRef}>
                    {selectedLixi && selectedLixi.claimCode && (
                      <QRClaimCode logoImage={lixiLogo} code={`${prefixClaimCode}_${selectedLixi?.claimCode}`} />
                    )}
                  </div>
                  <SmartButton onClick={() => handleDownloadQRClaimCode()}>
                    <DownloadOutlined /> {intl.get('lixi.downloadCode')}
                  </SmartButton>
                </>
              ) : (
                <>
                  <VirtualTable
                    columns={columns}
                    dataSource={subLixiesDataSource}
                    scroll={{ y: subLixiesDataSource.length * 54 <= 270 ? subLixiesDataSource.length * 54 : 270 }}
                  />
                  {hasMoreSubLixies && (
                    <SmartButton onClick={() => showMoreSubLixies()}>{intl.get('lixi.loadmore')}</SmartButton>
                  )}
                </>
              )}
            </Panel>
          </StyledCollapse>

          {/* Copy ClaimCode or Export Lixi*/}
          {selectedLixi.claimType == ClaimType.Single ? (
            <CopyToClipboard
              style={{
                display: 'inline-block',
                width: '100%',
                position: 'relative'
              }}
              text={`${prefixClaimCode}_${selectedLixi.claimCode}`}
              onCopy={handleOnCopyClaimCode}
            >
              <div style={{ position: 'relative', paddingTop: '20px' }} onClick={handleOnClickClaimCode}>
                <Copied style={{ display: claimCodeVisible ? undefined : 'none' }}>
                  Copied <br />
                  <span style={{ fontSize: '32px' }}>{`${prefixClaimCode}_${selectedLixi.claimCode}`}</span>
                </Copied>
                <SmartButton>
                  <CopyOutlined /> {intl.get('lixi.copyClaim')}
                </SmartButton>
              </div>
            </CopyToClipboard>
          ) : (
            <>
              <SmartButton
                disabled={selectedLixi.status == "pending"}
                onClick={() => handleExportLixi()}
              >
                <ExportOutlined /> {intl.get('lixi.exportLixi')}
              </SmartButton>
            </>
          )}

          <SmartButton onClick={() => handleRefeshLixi()}>
            <ReloadOutlined /> {intl.get('lixi.refreshLixi')}
          </SmartButton>

          <ClaimList claims={allClaimsCurrentLixi} />
        </>
      ) : (
        intl.get('lixi.noLixiSelected')
      )}
    </>
  );
};

export default Lixi;
