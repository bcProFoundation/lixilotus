import { DashOutlined, DislikeOutlined, LikeOutlined, SmallDashOutlined, UpOutlined } from '@ant-design/icons';
import { Avatar, Input, List } from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import moment from 'moment';

const { Search } = Input;

const PageDetail = ({ page, isMobile }) => {
  const baseApiUrl = process.env.NEXT_PUBLIC_LIXI_API;
  const baseUrl = process.env.NEXT_PUBLIC_LIXI_URL;
  const [listComment, setListComment] = useState([]);
  const [pageDetailData, setPageDetailData] = useState<any>(page);

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

  const PageCardDetail = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 0 1rem;
    .info-page {
      display: flex;
      img {
        width: 35px;
        height: 35px;
        border-radius: 50%;
      }
    }
  `;

  const PageContentDetail = styled.div``;

  const StyledContainerPageDetail = styled.div`
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

  const onUpVotePage = () => {
    let tempPage = pageDetailData;
    tempPage.upVote ? (tempPage.upVote += 1) : null;
    setPageDetailData({ ...tempPage });
  };

  const onDownVotePage = () => {
    let tempPage = pageDetailData;
    tempPage.upVote ? (tempPage.downVote += 1) : null;
    setPageDetailData({ ...tempPage });
  };

  const onComment = (value: string) => {
    let objTemp = {
      name: 'Vince',
      comment: value
    };
    listComment.push(objTemp);
    setListComment([...listComment]);
  };

  return (
    <>
      <StyledContainerPageDetail>
        <PageCardDetail>
          <div className="info-page">
            <img style={{ marginRight: '1rem' }} src={pageDetailData?.avatar?.upload?.url} alt="" />
            <div>
              <h4 style={{ margin: '0' }}>{pageDetailData.name}</h4>
              <p>{pageDetailData.title}</p>
            </div>
          </div>
          <div className="func-page">
            <span>{moment(pageDetailData.createdAt).fromNow()}</span>
          </div>
        </PageCardDetail>
        <PageContentDetail>
          <img style={{ marginRight: '5px', width: '100%' }} src={pageDetailData?.cover?.upload?.url} alt="" />
          <p style={{ padding: '0 1rem', margin: '1rem 0' }}>{pageDetailData.description}</p>
          <div className="reaction-container">
            <div className="reaction-ico">
              <LikeOutlined onClick={onUpVotePage} />
              <span style={{ marginLeft: '5px', marginRight: '10px' }}>{Math.floor(Math.random() * 100)}</span>
              <DislikeOutlined onClick={onDownVotePage} />
              <span style={{ marginLeft: '5px' }}>{Math.floor(Math.random() * 100)}</span>
            </div>
            <div className="reaction-func">
              <span>{listComment.length}</span>&nbsp;
              <span>Comments</span>&nbsp;
              <UpOutlined />
              <span style={{ marginLeft: '10px' }}>Share</span>
            </div>
          </div>
        </PageContentDetail>

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
      </StyledContainerPageDetail>
    </>
  );
};

const Container = styled(PageDetail)`
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
