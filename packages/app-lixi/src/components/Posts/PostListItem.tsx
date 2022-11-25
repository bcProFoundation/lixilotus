import CommentComponent, { CommentItem, Editor } from '@components/Common/Comment';
import InfoCardUser from '@components/Common/InfoCardUser';
import { Avatar, Button, Comment, List, message, Space } from 'antd';
import { push } from 'connected-next-router';
import _ from 'lodash';
import moment from 'moment';
import React, { useState } from 'react';
import ReactHtmlParser from 'react-html-parser';
import { useAppDispatch } from 'src/store/hooks';
import styled from 'styled-components';
import { Post } from '@bcpros/lixi-models';

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
    renderItem={postComment => <CommentComponent data={postComment} />}
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
  cursor: pointer;
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
    -webkit-line-clamp: 6;
    -webkit-box-orient: vertical;
    white-space: break-spaces;
    text-overflow: ellipsis;
    overflow: hidden;
    img {
      max-height: 250px;
      width: 100%;
    }
    p {
      margin: 0;
    }
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
  button {
    margin-right: 1rem;
    border-radius: 20px;
  }
`;

const GroupIconText = styled.div`
  display: flex;
  border: none;
  width: 100%;
  padding: 1rem 0 1rem 1rem;
  width: 424px;
  &.num-react {
    padding: 1rem 0;
    border: none;
    text-align: left;
  }
  .ant-space {
    margin-right: 1rem;
  }
  @media (max-width: 960px) {
    width: 210px;
  }
  @media (min-width: 960px) {
    width: 380px;
  }
  img {
    width: 18px;
  }
`;

const PostListItem = ({ index, item }) => {
  const dispatch = useAppDispatch();
  const post: Post = item;
  const [isCollapseComment, setIsCollapseComment] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [value, setValue] = useState('');

  if (!post) return null;

  const routerPostDetail = id => {
    dispatch(push(`/post/${id}`));
  };

  const onLixiClick = item => {
    // setIsShowQrCode(true);
    // showModal();
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

  const upVotePost = dataItem => {
    // if (selectedAccount && balanceAccount !== 0) {
    // data.forEach(item => {
    //   if (item.title === dataItem.title) item.upVote += 1;
    // });
    message.info(`Successful up vote shop`);
    // } else {
    message.info(`Please register account to up vote`);
    // }
  };

  const downVotePost = dataItem => {
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
          marginBottom: '1rem',
          borderRadius: '24px',
          boxShadow: '0px 2px 10px rgb(0 0 0 / 5%)',
          background: 'white',
          padding: '0',
          border: 'none'
        }}
        key={post.id}
      >
        <CardContainer onClick={() => routerPostDetail(post.id)}>
          <CardHeader>
            <InfoCardUser
              imgUrl={item.avatar}
              name={(post?.pageAccount ? post?.pageAccount?.name : post?.postAccount?.name) || 'Anonymous'}
              title={moment(post.createdAt).fromNow().toString()}
            ></InfoCardUser>
          </CardHeader>
          <Content>
            <div className="description-post">{ReactHtmlParser(post?.content)}</div>
            {/* <img className="image-cover" src={post.uploadCovers} alt="" /> */}
          </Content>
        </CardContainer>
        <ActionBar>
          <GroupIconText>
            <IconText
              text={item.upVote}
              imgUrl="/images/up-ico.svg"
              key={`list-vertical-upvote-o-${item.id}`}
              dataItem={item}
              onClickIcon={() => upVotePost(item)}
            />
            <IconText
              text={item.downVote}
              imgUrl="/images/down-ico.svg"
              key={`list-vertical-downvote-o-${item.id}`}
              dataItem={item}
              onClickIcon={() => downVotePost(item)}
            />
            <IconText
              imgUrl="/images/comment-ico.svg"
              text="0 Comments"
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

          <Button type="primary" onClick={item => onLixiClick(item)}>
            Send tip
          </Button>
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

export default React.memo(PostListItem);
