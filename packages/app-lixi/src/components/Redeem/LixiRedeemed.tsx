import { SaveOutlined, ShareAltOutlined } from '@ant-design/icons';
import BalanceHeader from '@bcpros/lixi-components/components/Common/BalanceHeader';
import WalletLabel from '@bcpros/lixi-components/components/Common/WalletLabel';
import { ViewRedeemDto } from '@bcpros/lixi-models';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { Image } from 'antd';
import { saveAs } from 'file-saver';
import React from 'react';
import {
  FacebookIcon, FacebookMessengerIcon, FacebookMessengerShareButton, FacebookShareButton, TelegramIcon, TelegramShareButton, TwitterIcon, TwitterShareButton, WhatsappIcon, WhatsappShareButton
} from 'react-share';
import { RWebShare } from "react-web-share";
import styled from 'styled-components';



const imageBrowserDownload = (imageUri) => {
  const filename = 'redeem' + Date.now() + '.png';
  saveAs(imageUri, filename);
};

const RedeemButton = styled.button`
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

const SocialSharePanel = ({ className, shareUrl }) => {
  const title = 'Lixi Program sent you a small gift!';
  return (
    <div className={className}>
      <div className="socialshare-network">
        <FacebookShareButton
          url={shareUrl}
          quote={title}
          className="socialshare-button"
        >
          <FacebookIcon size={32} round />
        </FacebookShareButton>
      </div>

      <div className="socialshare-network">
        <FacebookMessengerShareButton
          url={shareUrl}
          appId="521270401588372"
          className="socialshare-button"
        >
          <FacebookMessengerIcon size={32} round />
        </FacebookMessengerShareButton>
      </div>

      <div className="socialshare-network">
        <TwitterShareButton
          url={shareUrl}
          title={title}
          className="socialshare"
        >
          <TwitterIcon size={32} round />
        </TwitterShareButton>
      </div>

      <div className="socialshare-network">
        <TelegramShareButton
          url={shareUrl}
          title={title}
          className="socialshare-button"
        >
          <TelegramIcon size={32} round />
        </TelegramShareButton>

      </div>

      <div className="socialshare-network">
        <WhatsappShareButton
          url={shareUrl}
          title={title}
          separator=":: "
          className="socialshare-button"
        >
          <WhatsappIcon size={32} round />
        </WhatsappShareButton>
      </div>
    </div>
  );
}

const StyledSocialSharePanel = styled(SocialSharePanel)`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  .socialshare-network {
    padding: 10px 4px;
  }
`;

type LixiRedeemProps = {
  className?: string;
  redeem: ViewRedeemDto
}

const LixiRedeemed = ({
  className,
  redeem
}: LixiRedeemProps) => {

  const imageUrl = redeem?.image
    ? process.env.NEXT_PUBLIC_LIXI_API + redeem?.image
    : process.env.NEXT_PUBLIC_LIXI_API + 'images/default.png';

  const ShareSocialButton = (
    <RWebShare
      data={{
        text: "Lixi Program sent you a small gift!",
        url: '',
        title: "Flamingos",
      }}
      onClick={() => console.log("shared successfully!")}
    >
      <RedeemButton>
        <ShareAltOutlined /> Share
      </RedeemButton>
    </RWebShare>
  );

  return (
    <div className={className}>
      {redeem && redeem.amount && (
        <>
          <WalletLabel name='You have redeemed lixi' />
          <BalanceHeader
            balance={fromSmallestDenomination(redeem.amount)}
            ticker='XPI' />
          <Image src={imageUrl} alt='lixi' />
          <h3>{redeem.message}</h3>

          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            paddingTop: '20px'

          }}>
            <RedeemButton onClick={() => imageBrowserDownload(imageUrl)}>
              <SaveOutlined /> Save
            </RedeemButton>
            {ShareSocialButton}
          </div>
        </>
      )}
    </div>
  );
};

const Container = styled(LixiRedeemed)`

  .ant-modal, .ant-modal-content {
      height: 100vh !important;
      top: 0 !important;
  }
  .ant-modal-body {
      height: calc(100vh - 110px) !important;
  }

`;

export default Container;
