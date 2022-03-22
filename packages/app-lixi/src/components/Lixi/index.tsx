import { Collapse, Descriptions } from 'antd';
import { saveAs } from 'file-saver';
import { toPng } from 'html-to-image';
import * as _ from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { getAllClaims } from 'src/store/claim/selectors';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getLixi, refreshLixi, setLixiBalance } from 'src/store/lixi/actions';
import { getSelectedLixi, getSelectedLixiId } from 'src/store/lixi/selectors';
import { AppContext } from 'src/store/store';
import { showToast } from 'src/store/toast/actions';
import styled from 'styled-components';

import { CopyOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
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
import { getLixiesBySelectedLixiParent } from '@store/lixi/selectors';
import { fromSmallestDenomination, toSmallestDenomination } from '@utils/cashMethods';

import { ClaimType } from '../../../../lixi-models/src/lib/lixi';
import lixiLogo from '../../assets/images/lixi_logo.svg';

type CopiedProps = {
  style?: React.CSSProperties
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
  const selectedLixiId = useAppSelector(getSelectedLixiId);
  const selectedLixi = useAppSelector(getSelectedLixi);
  const allReddemsCurrentLixi = useAppSelector(getAllClaims);
  const [claimCodeVisible, setClaimCodeVisible] = useState(false);
  const qrPanelRef = React.useRef(null);
  const [isLoadBalanceError, setIsLoadBalanceError] = useState(false);
  const subLixies = useAppSelector(getLixiesBySelectedLixiParent);

  useEffect(() => {
    if (selectedLixi) {
      dispatch(getLixi(selectedLixi.id))
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      XPI.Electrumx.balance(selectedLixi?.address).then((result => {
        if (result && result.balance) {
          const balance = result.balance.confirmed + result.balance.unconfirmed;
          dispatch(setLixiBalance(balance ?? 0));
        }
      })).catch(e => {
        setIsLoadBalanceError(true);
      })
    }, 10000);
    return () => {
      return clearInterval(id);
    }
  }, []);

  const handleRefeshLixi = () => {
    if (!(selectedLixi && selectedLixiId)) {
      // Ignore if no lixi is selected
      return;
    }
    const lixiId = selectedLixiId;
    dispatch(refreshLixi(lixiId));
  }

  const handleOnClickClaimCode = evt => {
    setClaimCodeVisible(true);
    setTimeout(() => {
      setClaimCodeVisible(false);
    }, 1500);
  }

  const handleOnCopyClaimCode = () => {
    setClaimCodeVisible(true);
  };

  const handleDownloadQRClaimCode = () => {
    if (qrPanelRef.current) {
      toPng(qrPanelRef.current, { cacheBust: true }).then(url => {
        saveAs(url);
      }).catch((err) => {
        dispatch(showToast('error', {
          message: 'Unable to download claim code.',
          description: 'Please copy the code manually',
          duration: 5
        }));
      });
    }
  }

  const typeLixi = () => {
    switch (selectedLixi?.lixiType) {
      case LixiType.Fixed:
        return (
          <>Fixed {selectedLixi.fixedValue} {currency.ticker}</>
        );
      case LixiType.Divided:
        return (
          <>Divided by {selectedLixi.dividedValue} </>
        );
      case LixiType.Equal:
        return (
          <>Equal {selectedLixi.amount / selectedLixi.numberOfSubLixi} {currency.ticker}</>
        );
      default:
        return (
          <>Random {selectedLixi?.minValue}-{selectedLixi?.maxValue} {currency.ticker}</>
        );
    }
  }

  const showRedemption = () => {
    if (selectedLixi?.maxClaim != 0) {
      return <>{selectedLixi?.claimedNum} / {selectedLixi?.maxClaim}</>
    }
    else {
      return <>{selectedLixi?.claimedNum}</>
    }
  }

  const showMinStaking = () => {
    return (selectedLixi?.minStaking) ? (
      <Descriptions.Item label="Min Staking">
        {selectedLixi.minStaking} {currency.ticker}
      </Descriptions.Item>) : "";
  }

  const formatDate = () => {
    if (selectedLixi?.expiryAt != null) {
      return (
        <Descriptions.Item label="Expiry at">
          {moment(selectedLixi?.expiryAt).format("YYYY-MM-DD HH:mm")}
        </Descriptions.Item>
      );
    }
    else {
      return;
    }
  }

  const showCountry = () => {
    return (selectedLixi?.country != null) ? (
      <Descriptions.Item label="Country">
        {countries.find(country => country.id === selectedLixi?.country)?.name}
      </Descriptions.Item>) : "";
  }

  const showIsFamilyFriendly = () => {
    return (selectedLixi?.isFamilyFriendly) ? (
      <Descriptions.Item label="Optional">
        Family Friendly
      </Descriptions.Item>) : "";
  }

  const parentBalance = () => {
    let sum=0;
    subLixies.map(item => sum += item.amount-0.000455);
    // dispatch(setLixiBalance(sum ?? 0));
    return sum.toFixed(6);
  }

  return (
    <>
      <WalletLabel
        name={selectedLixi?.name ?? ''}
      />
      <BalanceHeader
        balance={selectedLixi.claimType==ClaimType.Single ? (fromSmallestDenomination(selectedLixi?.balance) ?? 0) : parentBalance() }
        ticker={currency.ticker} />
      {selectedLixi && selectedLixi.address ? (
        <>
          {selectedLixi.claimType == ClaimType.Single ? 
            <QRCode
              address={selectedLixi.address}
            /> : 
            <></>
          }
          

          <Descriptions
            column={1}
            bordered
            title={`Lixi info for "${selectedLixi.name}"`}
            style={{
              padding: '0 0 20px 0',
              color: 'rgb(23,23,31)',
            }}
          >
            <Descriptions.Item label="Claim Type">
              {selectedLixi.claimType == ClaimType.Single ? "Single" : "One-Time Codes"}
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              {typeLixi()}
            </Descriptions.Item>
            <Descriptions.Item label="Total Claimed">
              {fromSmallestDenomination(selectedLixi?.totalClaim) ?? 0}
            </Descriptions.Item>
            <Descriptions.Item label="Claim">
              {showRedemption()}
            </Descriptions.Item>
            {showCountry()}
            {showMinStaking()}
            {formatDate()}
            {showIsFamilyFriendly()}
          </Descriptions>

          {/* Lixi details */}
          <StyledCollapse style={{ marginBottom: '20px' }}>
            <Panel header="Click to reveal lixi detail" key="panel-1">
              {selectedLixi.claimType == ClaimType.Single ? 
                <>
                  <div ref={qrPanelRef}>
                    {selectedLixi && selectedLixi.claimCode && <QRClaimCode
                      logoImage={lixiLogo}
                      code={selectedLixi?.claimCode}
                    />}
                  </div>
                  <SmartButton
                    onClick={() => handleDownloadQRClaimCode()}
                  >
                    <DownloadOutlined />  Download Code
                  </SmartButton>
                </> :
                <Descriptions
                  column={1}
                  bordered
                  style={{
                    padding: '0 0 20px 0',
                    color: 'rgb(23,23,31)',
                  }}
                >
                  {subLixies.map(item =>  
                    <Descriptions.Item label={
                      <CopyToClipboard
                        text={item.claimCode}
                        onCopy={handleOnCopyClaimCode}
                      >
                        <div>
                          <CopyOutlined />  {item.claimCode}
                        </div>
                      </CopyToClipboard>
                    }>
                      {item.amount - 0.000455}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              }
            </Panel>
          </StyledCollapse>

          {/* Copy ClaimCode */}
          {selectedLixi.claimType == ClaimType.Single ? 
            <CopyToClipboard
              style={{
                display: 'inline-block',
                width: '100%',
                position: 'relative',
              }}
              text={selectedLixi.claimCode}
              onCopy={handleOnCopyClaimCode}
            >
              <div style={{ position: 'relative', paddingTop: '20px' }} onClick={handleOnClickClaimCode}>
                <Copied
                  style={{ display: claimCodeVisible ? undefined : 'none' }}
                >
                  Copied <br />
                  <span style={{ fontSize: '32px' }}>{selectedLixi.claimCode}</span>
                </Copied>
                <SmartButton>
                  <CopyOutlined />  Copy Claim Code
                </SmartButton>
              </div>
            </CopyToClipboard> : 
            <></>
          }

          <SmartButton
            onClick={() => handleRefeshLixi()}
          >
            <ReloadOutlined />  Refresh Lixi
          </SmartButton>

          <ClaimList claims={allReddemsCurrentLixi} />
        </>
      )
        : `No lixi is selected`
      }
    </>
  )
};

export default Lixi;