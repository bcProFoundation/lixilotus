import {
  DashOutlined,
  DislikeOutlined,
  LikeOutlined,
  LinkOutlined,
  ShareAltOutlined,
  SmallDashOutlined,
  UpOutlined
} from '@ant-design/icons';
import { Avatar, Button, Input, List, message, Popover } from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import moment from 'moment';

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
import intl from 'react-intl-universal';

const { Search } = Input;

type SocialSharePanelProps = {
  className?: string;
  shareUrl: string;
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

const popOverContent = shareUrl => {
  return <StyledSocialSharePanel shareUrl={shareUrl} />;
};

type PostDetailProps = {
  post: any;
  isMobile: boolean;
};

const PostDetail = ({ post, isMobile }: PostDetailProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_LIXI_URL;
  const [listComment, setListComment] = useState([]);
  const [postDetailData, setPostDetailData] = useState<any>(post);

  const CommentContainer = styled.div`
    padding: 0 1rem;
    .comment-item {
      text-align: left;
      border: 0 !important;
    }
  `;

  const ActionComment = styled.div`
    margin-left: 12%;
    font-size: 13px;
  `;

  const PostCardDetail = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 0 1rem;
    .info-post {
      display: flex;
      img {
        width: 35px;
        height: 35px;
        border-radius: 50%;
      }
    }
  `;

  const PostContentDetail = styled.div``;

  const StyledContainerPostDetail = styled.div`
    padding: 1rem 0;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.04), 0px 2px 6px 2px rgba(0, 0, 0, 0.08);
    border-radius: 5px;
    .reaction-container {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem;
      margin: 0 1rem;
      border: 1px solid #c5c5c5;
      border-left: 0;
      border-right: 0;
    }

    .comment-item-meta {
      margin-bottom: 0.5rem;
      .ant-list-item-meta-avatar {
        margin-top: 3%;
      }
      .ant-list-item-meta-title {
        margin-bottom: 0.5rem;
      }
    }

    .input-comment {
      padding: 1rem 1rem 0 1rem;
    }
  `;

  const ShareButton = styled.span`
    margin-left: 10px;
  `;

  useEffect(() => {
    const dataListComment = [
      {
        name: 'Kensaurus',
        comment: `I'm so glad I ordered this pizza - it tastes great`
      },
      {
        name: 'Eric Son',
        comment: 'Wow, this pasta salad is amazing!'
      }
    ];

    setListComment([...dataListComment]);
  }, []);

  const onUpVotePost = () => {
    let tempPost = postDetailData;
    tempPost.upVote ? (tempPost.upVote += 1) : null;
    setPostDetailData({ ...tempPost });
  };

  const onDownVotePost = () => {
    let tempPost = postDetailData;
    tempPost.upVote ? (tempPost.downVote += 1) : null;
    setPostDetailData({ ...tempPost });
  };

  const onComment = (value: string) => {
    let objTemp = {
      name: 'Vince',
      comment: value
    };
    listComment.push(objTemp);
    setListComment([...listComment]);
  };

  const slug = post.id;

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

  return (
    <>
      <StyledContainerPostDetail>
        <PostCardDetail>
          <div className="info-post">
            <img style={{ marginRight: '1rem' }} src={postDetailData?.avatar?.upload?.url} alt="" />
            <div>
              <h4 style={{ margin: '0' }}>{postDetailData.name}</h4>
              <p>{postDetailData.title}</p>
            </div>
          </div>
          <div className="func-post">
            <span>{moment(postDetailData.createdAt).fromNow()}</span>
          </div>
        </PostCardDetail>
        <PostContentDetail>
          <img style={{ marginRight: '5px', width: '100%' }} src={postDetailData?.cover?.upload?.url} alt="" />
          <p style={{ padding: '0 1rem', margin: '1rem 0' }}>{postDetailData.description}</p>
          <div className="reaction-container">
            <div className="reaction-ico">
              <LikeOutlined onClick={onUpVotePost} />
              <span style={{ marginLeft: '5px', marginRight: '10px' }}>{Math.floor(Math.random() * 100)}</span>
              <DislikeOutlined onClick={onDownVotePost} />
              <span style={{ marginLeft: '5px' }}>{Math.floor(Math.random() * 100)}</span>
            </div>
            <div className="reaction-func">
              <span>{listComment.length}</span>&nbsp;
              <span>Comments</span>&nbsp;
              <UpOutlined />
              {isMobile ? ShareSocialButton : ShareSocialDropdown}
            </div>
          </div>
        </PostContentDetail>

        <CommentContainer>
          <List
            itemLayout="vertical"
            dataSource={listComment}
            renderItem={item => (
              <List.Item className="comment-item">
                <List.Item.Meta
                  className="comment-item-meta"
                  avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
                  title={<a href="https://ant.design">{item.name}</a>}
                  description={item.comment}
                />
                <ActionComment className="action-comment">
                  <span>Like</span>
                  <span style={{ margin: '0 1rem' }}>Reply</span>
                  <span>5mins</span>
                </ActionComment>
              </List.Item>
            )}
          />
        </CommentContainer>
        <Search
          className="input-comment"
          placeholder="Input your comment..."
          enterButton="Comment"
          size="large"
          suffix={<DashOutlined />}
          onSearch={onComment}
        />
      </StyledContainerPostDetail>
    </>
  );
};

const Container = styled(PostDetail)`
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