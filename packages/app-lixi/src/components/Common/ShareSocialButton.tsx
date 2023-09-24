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
import { Button, Popover } from 'antd';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import { stripHtml } from 'string-strip-html';
import { useAppDispatch } from '@store/hooks';
import { showToast } from '@store/toast/actions';
import useDetectMobileView from '@local-hooks/useDetectMobileView';
import React from 'react';

type SocialSharePanelProps = {
  className?: string;
  shareUrl: string;
};

type ShareSocialProps = {
  slug: any;
  content?: string;
  postAccountName?: string;
};

const SocialSharePanel = ({ className, shareUrl }: SocialSharePanelProps): JSX.Element => {
  const dispatch = useAppDispatch();
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
            dispatch(
              showToast('success', {
                message: intl.get('toast.success'),
                description: intl.get('lixi.fileUploadError')
              })
            );
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
  padding: 8px;
  border-radius: 12px;
  &:hover {
    background: #faf1fa;
  }
  svg {
    width: 25px;
    height: 25px;
    margin-right: 4px;
    color: var(--color-primary);
  }
`;

const ShareSocialButton = (props: ShareSocialProps) => {
  const { slug, content, postAccountName } = props;
  const baseUrl = process.env.NEXT_PUBLIC_LIXI_URL;
  const shareUrl = `${baseUrl}post/${slug}`;
  const isMobile = useDetectMobileView();

  const ShareSocialDropdown = (
    <Popover content={() => popOverContent(shareUrl)}>
      <ShareButton>
        <ShareAltOutlined />
      </ShareButton>
    </Popover>
  );

  const ShareSocialButton = (
    <RWebShare
      data={{
        text: content ? `${postAccountName} at Lixi: "${stripHtml(content).result.substring(0, 50)}..."` : '',
        url: shareUrl,
        title: 'Lixi'
      }}
      onClick={() => {}}
    >
      <ShareButton className="share-social-btn">
        <ShareAltOutlined />
      </ShareButton>
    </RWebShare>
  );

  const popOverContent = shareUrl => {
    return <StyledSocialSharePanel shareUrl={shareUrl} />;
  };

  return <>{!isMobile ? ShareSocialButton : ShareSocialDropdown}</>;
};

export default React.memo(ShareSocialButton);
