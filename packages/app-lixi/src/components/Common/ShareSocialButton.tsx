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
import { LinkOutlined, ShareAltOutlined } from '@ant-design/icons';
import { RWebShare } from 'react-web-share';
import { Button, message, Popover } from 'antd';
import intl from 'react-intl-universal';
import styled from 'styled-components';

type SocialSharePanelProps = {
  className?: string;
  shareUrl: string;
};

type ShareSocialProps = {
  slug: any;
  isMobile?: boolean;
};

const SocialSharePanel = ({ className, shareUrl }: SocialSharePanelProps): JSX.Element => {
  const title = intl.get('post.titleShared');
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
            message.success(intl.get('post.copyToClipboard'));
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

const ShareButton = styled.span`
  cursor: pointer;
  display: flex;
  align-items: center;
  color: rgba(30, 26, 29, 0.6);
  svg {
    width: 25px;
    height: 25px;
    margin-right: 4px;
    color: #23aec8;
  }
`;

export const ShareSocialButton = (props: ShareSocialProps) => {
  const { slug, isMobile } = props;
  const baseUrl = process.env.NEXT_PUBLIC_LIXI_URL;
  const shareUrl = `${baseUrl}post/${slug}`;

  const ShareSocialDropdown = (
    <Popover content={() => popOverContent(shareUrl)}>
      <ShareButton>
        <ShareAltOutlined /> Share
      </ShareButton>
    </Popover>
  );

  const ShareSocialButton = (
    <RWebShare
      data={{
        text: intl.get('post.titleShared'),
        url: shareUrl,
        title: 'LixiLotus'
      }}
      onClick={() => {}}
    >
      <ShareButton>
        <ShareAltOutlined /> Share
      </ShareButton>
    </RWebShare>
  );

  const popOverContent = shareUrl => {
    return <StyledSocialSharePanel shareUrl={shareUrl} />;
  };

  return <>{!isMobile ? ShareSocialButton : ShareSocialDropdown}</>;
};
