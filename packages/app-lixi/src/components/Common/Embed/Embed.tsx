import React from 'react';

import { RedditEmbed } from './Reddit/RedditEmbed';
import { TweetEmbed } from './Twitter/TweetEmbed';

import { Spin } from 'antd';
import styled from 'styled-components';
import { FacebookEmbed } from './Facebook/FacebookEmbed';

export enum SocialsEnum {
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  REDDIT = 'reddit',
  INSTAGRAM = 'instagram',
  WECHAT = 'wechat',
  FOURCHAN = '4chan',
  TELEGRAM = 'telegram',
  VK = 'vk',
  WEIBO = 'weibo'
}

type EmbedProps = {
  social: SocialsEnum;
  url: string;
  postId: string;
  showError?: boolean;
  onError?: () => void;
  onLoad?: (e, social?) => void;
  onClick?: () => void;
};

const CointainerEmbed = styled.div`
  .root {
    text-align: center;
    width: 100%;
    height: 100%;
  }

  input {
    marginbottom: 30px;
  }

  .embed {
    margin: 0 auto;
    width: auto;
    height: auto;

    @media (max-width: 768px) {
      width: 100%;
    }
  }

  .reddit {
    width: 560px;
    height: 460px;
    border: none;
    @media (max-width: 768px) {
      width: 310px;
      height: 460px;
    }
  }

  .loading {
    display: flex;
    justify-content: center;
  }
`;

export const Embed: React.FC<EmbedProps> = props => {
  const { social, url, postId, onClick, onError, onLoad } = props;
  const handleClick = (): void => {
    onClick && onClick();
  };

  return (
    <CointainerEmbed>
      <div className="root" onClick={handleClick}>
        {social === SocialsEnum.TWITTER && (
          <div className="embed">
            <TweetEmbed
              tweetId={postId}
              options={{ height: 560 }}
              placeholder={<Spin />}
              onLoad={e => onLoad(e, social)}
              onError={onError}
            />
          </div>
        )}

        {social === SocialsEnum.REDDIT && (
          <RedditEmbed url={url} placeholder={<Spin />} onLoad={e => onLoad(e, social)} onError={onError} />
        )}

        {social === SocialsEnum.FACEBOOK && (
          <FacebookEmbed url={url} placeholder={<Spin />} onLoad={e => onLoad(e, social)} onError={onError} />
        )}
      </div>
    </CointainerEmbed>
  );
};
