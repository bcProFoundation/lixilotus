import { SaveOutlined, ShareAltOutlined, LinkOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import BalanceHeader from '@bcpros/lixi-components/components/Common/BalanceHeader';
import WalletLabel from '@bcpros/lixi-components/components/Common/WalletLabel';
import { ViewClaimDto } from '@bcpros/lixi-models';
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

const imageBrowserDownload = imageUri => {
  const filename = 'claim' + Date.now() + '.png';
  saveAs(imageUri, filename);
};

const ClaimButton = styled.button`
  border: none;
  color: ${props => props.theme.buttons.primary.color};
  background-image: ${props => props.theme.buttons.primary.backgroundImage};
  transition: all 0.5s ease;
  width: 35%;
  font-size: 16px;
  background-size: 200% auto;
  padding: 10px 0;
  border-radius: 4px;
  margin-bottom: 20px;
  cursor: pointer;
  :hover {
    background-position: right center;
    -webkit-box-shadow: ${props => props.theme.buttons.primary.hoverShadow};
    -moz-box-shadow: ${props => props.theme.buttons.primary.hoverShadow};
    box-shadow: ${props => props.theme.buttons.primary.hoverShadow};
  }
  svg {
    fill: ${props => props.theme.buttons.primary.color};
  }
  @media (max-width: 768px) {
    font-size: 16px;
    padding: 10px 5px;
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

const popOverContent = shareUrl => {
  return <StyledSocialSharePanel shareUrl={shareUrl} />;
};

type LixiClaimProps = {
  className?: string;
  claim: ViewClaimDto;
  isMobile: boolean;
};

const LixiClaimed = ({ className, claim, isMobile }: LixiClaimProps) => {
  const baseApiUrl = process.env.NEXT_PUBLIC_LIXI_API;
  const baseUrl = process.env.NEXT_PUBLIC_LIXI_URL;

  const imageUrl = claim?.image ? claim?.image : baseApiUrl + 'api/' + 'images/default.png';

  const slug = numberToBase58(claim.id);

  const shareUrl = `${baseUrl}claimed/${slug}`;
  //
  const ShareSocialDropdown = (
    <Popover content={() => popOverContent(shareUrl)}>
      <ClaimButton>
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
      onClick={() => { }}
    >
      <ClaimButton>
        <ShareAltOutlined /> Share
      </ClaimButton>
    </RWebShare>
  );

  return (
    <div className={className}>
      {claim && claim.amount && (
        <>
          <WalletLabel name={intl.get('claim.youClaimedLixi')} />
          <BalanceHeader balance={fromSmallestDenomination(claim.amount)} ticker="XPI" />
          <Image src={imageUrl} alt="lixi" />
          <h3>{claim.message}</h3>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              paddingTop: '20px'
            }}
          >
            <ClaimButton onClick={() => imageBrowserDownload(imageUrl)}>
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
  .ant-modal,
  .ant-modal-content {
    height: 100vh !important;
    top: 0 !important;
  }
  .ant-modal-body {
    height: calc(100vh - 110px) !important;
  }
`;

export default Container;
