import { DislikeOutlined, FireOutlined, LikeOutlined } from '@ant-design/icons';
import CommentComponent, { CommentItem, Editor } from '@components/Common/Comment';
import InfoCardUser from '@components/Common/InfoCardUser';
import useWindowDimensions from '@hooks/useWindowDimensions';
import { Avatar, Button, Comment, List, message, Space } from 'antd';
import { push } from 'connected-next-router';
import _ from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useAppDispatch } from 'src/store/hooks';
import styled from 'styled-components';

const IconText = ({
  icon,
  text,
  dataItem,
  imgUrl,
  onClickIcon
}: {
  icon?: React.FC;
  text?: string;
  dataItem: any;
  imgUrl?: string;
  onClickIcon: () => void;
}) => (
  <Space onClick={onClickIcon}>
    {icon && React.createElement(icon)}
    {imgUrl && React.createElement('img', { src: imgUrl }, null)}
    {text}
  </Space>
);

export const CommentList = ({ comments }: { comments: CommentItem[] }) => (
  <List
    style={{ width: '100%' }}
    dataSource={comments}
    itemLayout="horizontal"
    renderItem={item => <CommentComponent data={item}></CommentComponent>}
  />
);

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  width: 100%;
  @media (max-width: 768px) {
    padding: 1rem 1rem 0 1rem;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  .info-user {
    .name-title {
      margin-left: 0.5rem;
      font-size: 12px;
    }
  }
  .time-created {
    font-size: 12px;
  }
  img {
    width: 24px;
  }
`;

const Content = styled.div`
  .description-post {
    text-align: left;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .image-cover {
    width: 100%;
    max-height: 300px;
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-bottom: 1rem;
  button {
    margin-right: 1rem;
    border-radius: 20px;
  }
  @media (max-width: 768px) {
    padding: 0.5rem 0;
  }
`;

const GroupIconText = styled.div`
  display: flex;
  border: none;
  width: 100%;
  padding-left: 1rem;
  display: grid;
  width: 100%;
  grid-template-columns: auto auto auto auto;
  &.num-react {
    padding: 1rem 0;
    border: none;
    text-align: left;
  }
  .ant-space {
    margin-right: 1rem;
  }
  img {
    width: 18px;
  }
`;

const CountBar = styled.div`
  display: grid;
  grid-template-columns: 70% 15% 15%;
  margin-top: 1rem;
  border-bottom: 1px solid rgba(128, 116, 124, 0.12);
  padding-bottom: 1rem;
  .ant-space-item {
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: rgba(30, 26, 29, 0.6);
    img {
      width: 15px;
      height: 15px;
    }
  }
`;

const PageListItem = ({ index, item }) => {
  const dispatch = useAppDispatch();

  const [isCollapseComment, setIsCollapseComment] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [value, setValue] = useState('');
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  const { width } = useWindowDimensions();

  useEffect(() => {
    let isMobile = width < 768 ? true : false;
    setIsMobileScreen(isMobile);
  }, [width]);

  if (!item) return null;

  const routerShopDetail = id => {
    dispatch(push(`/page/${id}`));
  };

  const handleSubmit = (values: any) => {
    console.log(values);
    if (!values.comment) return;

    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setValue('');
      setComments([
        ...comments,
        {
          author: 'Han Solo',
          avatar: 'https://joeschmoe.io/api/v1/random',
          content: <p>{values.comment}</p>,
          datetime: moment('2016-11-22').fromNow()
        }
      ]);
    }, 1000);
  };

  const upVotePage = dataItem => {
    // if (selectedAccount && balanceAccount !== 0) {
    // data.forEach(item => {
    //   if (item.title === dataItem.title) item.upVote += 1;
    // });
    message.info(`Successful up vote shop`);
    // } else {
    message.info(`Please register account to up vote`);
    // }
  };

  const downVotePage = dataItem => {
    // if (selectedAccount && balanceAccount !== 0) {
    // lists.forEach(item => {
    //   if (item.title === dataItem.title) item.downVote += 1;
    // });
    message.info(`Successful down vote shop`);
    // } else {
    message.info(`Please register account to up vote`);
    // }
  };

  return (
    <div>
      <List.Item
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'fit-content !important',
          margin: '2px 2px 1rem 2px',
          borderRadius: '24px',
          boxShadow: '0px 2px 10px rgb(0 0 0 / 5%)',
          background: 'white',
          padding: '0',
          border: 'none'
        }}
        key={item.id}
      >
        <CardContainer>
          <CardHeader onClick={() => routerShopDetail(item.id)}>
            <InfoCardUser
              imgUrl={item.avatar || '/images/default-avatar.jpg'}
              name={item.name}
              title={moment(item.createdAt).fromNow().toString()}
            ></InfoCardUser>
          </CardHeader>
          <Content>
            <p className="description-post">{item.description}</p>
            <img className="image-cover" src={item.cover || '/images/default-cover.jpg'} alt="" />
          </Content>
          <CountBar>
            <IconText
              text={Math.floor(Math.random() * 100).toString() + ' XPI'}
              icon={FireOutlined}
              key={`burn-lotus-${item.id}`}
              dataItem={item}
              onClickIcon={() => upVotePage(item)}
            />
            <IconText
              imgUrl="/images/comment-ico.svg"
              text={Math.floor(Math.random() * 10).toString()}
              key={`list-vertical-comment-o-${item.id}`}
              dataItem={item}
              onClickIcon={() => {
                setIsCollapseComment(!isCollapseComment);
              }}
            />
            <IconText
              imgUrl="/images/share-ico.svg"
              text={Math.floor(Math.random() * 10).toString()}
              key={`list-vertical-share-o-${item.id}`}
              dataItem={item}
              onClickIcon={() => {}}
            />
          </CountBar>
          <div className="line"></div>
        </CardContainer>
        <ActionBar>
          <GroupIconText>
            <IconText
              text={!isMobileScreen ? 'Vote up' : ''}
              icon={LikeOutlined}
              key={`list-vertical-upvote-o-${item.id}`}
              dataItem={item}
              onClickIcon={() => upVotePage(item)}
            />
            <IconText
              text={!isMobileScreen ? 'Vote down' : ''}
              icon={DislikeOutlined}
              key={`list-vertical-downvote-o-${item.id}`}
              dataItem={item}
              onClickIcon={() => downVotePage(item)}
            />
            <IconText
              imgUrl="/images/comment-ico.svg"
              text="Comments"
              key={`list-vertical-comment-o-${item.id}`}
              dataItem={item}
              onClickIcon={() => {
                setIsCollapseComment(!isCollapseComment);
              }}
            />
            <IconText
              imgUrl="/images/share-ico.svg"
              text="Share"
              key={`list-vertical-share-o-${item.id}`}
              dataItem={item}
              onClickIcon={() => {}}
            />
          </GroupIconText>
        </ActionBar>
        {isCollapseComment && (
          <Comment
            style={{ width: '100%', textAlign: 'left' }}
            avatar={<Avatar src="https://joeschmoe.io/api/v1/random" alt="Han Solo" />}
            content={<Editor onSubmit={handleSubmit} submitting={submitting} />}
          />
        )}

        {isCollapseComment && comments.length > 0 && <CommentList comments={comments} />}
      </List.Item>
    </div>
  );
};

export default React.memo(PageListItem);
