import { SaveOutlined, ShareAltOutlined, LinkOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import BalanceHeader from '@bcpros/lixi-components/components/Common/BalanceHeader';
import WalletLabel from '@bcpros/lixi-components/components/Common/WalletLabel';
import { ViewClaimDto, LixiDto } from '@bcpros/lixi-models';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { numberToBase58 } from '@utils/encryptionMethods';
import { Image, Popover, Button, message } from 'antd';
import { saveAs } from 'file-saver';
import React from 'react';
import {
  FacebookIcon,
  FacebookMessengerIcon,
  FacebookMessengerShareButton,
  FacebookShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton
} from 'react-share';
import { RWebShare } from 'react-web-share';
import styled from 'styled-components';
import moment from 'moment';

const imageBrowserDownload = imageUri => {
  const filename = 'claim' + Date.now() + '.png';
  saveAs(imageUri, filename);
};

const ClaimButton = styled(Button)`
  color: #4e444b !important;
  .anticon {
    color: #4e444b;
    font-size: 17px;
  }
`;

type SocialSharePanelProps = {
  className?: string;
  shareUrl: string;
};

const SocialSharePanel = ({ className, shareUrl }: SocialSharePanelProps): JSX.Element => {
  const title = intl.get('claim.titleShared');
  return (
    <div className={className}>
      <div className="socialshare-network">
        <FacebookShareButton url={shareUrl} quote={title} className="socialshare-button">
          <FacebookIcon size={32} round />
        </FacebookShareButton>
      </div>

      <div className="socialshare-network">
        <FacebookMessengerShareButton url={shareUrl} appId="521270401588372" className="socialshare-button">
          <FacebookMessengerIcon size={32} round />
        </FacebookMessengerShareButton>
      </div>

      <div className="socialshare-network">
        <TwitterShareButton url={shareUrl} title={title} className="socialshare">
          <TwitterIcon size={32} round />
        </TwitterShareButton>
      </div>

      <div className="socialshare-network">
        <TelegramShareButton url={shareUrl} title={title} className="socialshare-button">
          <TelegramIcon size={32} round />
        </TelegramShareButton>
      </div>

      <div className="socialshare-network">
        <WhatsappShareButton url={shareUrl} title={title} separator=":: " className="socialshare-button">
          <WhatsappIcon size={32} round />
        </WhatsappShareButton>
      </div>

      <div className="socialshare-network">
        <Button
          type="primary"
          shape="circle"
          icon={<LinkOutlined style={{ color: 'white', fontSize: '20px' }} />}
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            message.success(intl.get('claim.copyToClipboard'));
          }}
        />
      </div>
    </div>
  );
};

const StyledSocialSharePanel = styled(SocialSharePanel)`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  .socialshare-network {
    padding: 10px 4px;
  }
`;

const InfoLixi = styled.div`
  .label {
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: rgba(30, 26, 29, 0.6);
    margin-bottom: 4px;
  }
  .claim-name,
  .time-claim {
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: #1e1a1d;
  }
`;

const StyledWalletLabel = styled(WalletLabel)`
  font-size: 22px;
  line-height: 28px;
  color: #4e444b;
  margin-bottom: 0.5rem;
`;

const popOverContent = shareUrl => {
  return <StyledSocialSharePanel shareUrl={shareUrl} />;
};

type LixiClaimProps = {
  className?: string;
  claim: ViewClaimDto;
  isMobile: boolean;
  lixi: LixiDto;
};

const LixiClaimed = ({ className, claim, isMobile, lixi }: LixiClaimProps) => {
  const baseApiUrl = process.env.NEXT_PUBLIC_LIXI_API;
  const baseUrl = process.env.NEXT_PUBLIC_LIXI_URL;

  const imageUrl = claim?.image ? claim?.image : baseApiUrl + 'api/' + 'images/default.png';

  const slug = numberToBase58(claim.id);

  const shareUrl = `${baseUrl}claimed/${slug}`;
  //
  const ShareSocialDropdown = (
    <Popover content={() => popOverContent(shareUrl)}>
      <ClaimButton type="primary" className="no-border-btn">
        <ShareAltOutlined /> Share
      </ClaimButton>
    </Popover>
  );

  const ShareSocialButton = (
    <RWebShare
      data={{
        text: intl.get('claim.titleShared'),
        url: shareUrl,
        title: 'LixiLotus'
      }}
      onClick={() => {}}
    >
      <ClaimButton type="primary" className="no-border-btn">
        <ShareAltOutlined /> Share
      </ClaimButton>
    </RWebShare>
  );

  return (
    <div className={className}>
      {claim && claim.amount && (
        <>
          <StyledWalletLabel name={intl.get('claim.youClaimedLixi')} />
          <BalanceHeader balance={fromSmallestDenomination(claim.amount)} ticker="XPI" />
          <InfoLixi>
            <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
              <p className="label">Lixi name</p>
              <p className="claim-name">{lixi?.name}</p>
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <p className="label">Claimed time:</p>
              <p className="time-claim">{moment(claim?.createDate).format('DD/MM/YYYY, HH:mm:ss') || 'Invalid time'}</p>
            </div>
          </InfoLixi>
          <Image src={imageUrl} alt="lixi" />
          <div
            style={{
              paddingTop: '2rem'
            }}
          >
            <ClaimButton type="primary" className="no-border-btn" onClick={() => imageBrowserDownload(imageUrl)}>
              <SaveOutlined /> Save
            </ClaimButton>
            {isMobile ? ShareSocialButton : ShareSocialDropdown}
          </div>
        </>
      )}
    </div>
  );
};

const Container = styled(LixiClaimed)`
  background: #ffffff;
  border-radius: var(--border-radius-primary);
  padding: 2rem;
  margin-bottom: 2rem;
  .ant-modal,
  .ant-modal-content {
    height: 100vh !important;
    top: 0 !important;
  }
  .ant-modal-body {
    height: calc(100vh - 110px) !important;
  }
  @media (max-width: 768px) {
    padding: 0;
    box-shadow: none;
  }
`;

export default Container;
