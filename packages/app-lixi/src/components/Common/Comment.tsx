import React, { createElement, useEffect, useState } from 'react';
import { Avatar, Button, Form, Input, Tooltip } from 'antd';
import { Comment } from '@ant-design/compatible';
import { DislikeFilled, DislikeOutlined, LikeFilled, LikeOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import moment from 'moment';
import { CommentList } from '@components/Pages/PageListItem';

const { TextArea } = Input;

export interface CommentItem {
  author: string;
  avatar: string;
  content: React.ReactNode;
  datetime: string;
}

export interface EditorProps {
  onSubmit: (value: any) => void;
  submitting: boolean;
}

export const Editor = ({ onSubmit, submitting }: EditorProps) => (
  <>
    <Form onFinish={onSubmit}>
      <Form.Item name="comment">
        <TextArea rows={1} />
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit" loading={submitting} type="primary">
          Add Comment
        </Button>
      </Form.Item>
    </Form>
  </>
);

export const StyledComment = styled(Comment)`
  .ant-comment-inner {
    padding-top: 0;
  }
  .ant-comment-content {
    text-align: left;
    background-color: rgba(246, 246, 246, 0.5);
    padding: 8px;
    border-radius: 5px;
    .ant-comment-content-author-name {
      text-transform: capitalize;
    }
  }
  .ant-comment-actions {
    li {
      &:last-child {
        display: block;
      }
    }
  }
  .ant-comment-avatar {
    .ant-avatar {
      width: 40px;
      height: 40px;
      img {
        width: 40px;
        height: 40px;
      }
    }
  }
  .d-none {
    display: none;
  }
`;
const CommentComponent: React.FC<{ children?: React.ReactNode; data: any }> = ({ children, data }) => {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [isReply, setIsReply] = useState(false);
  const [action, setAction] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [value, setValue] = useState('');
  const [comments, setComments] = useState<CommentItem[]>([]);

  const like = () => {
    setLikes(1);
    setDislikes(0);
    setAction('liked');
  };

  useEffect(() => {
    console.log(data);
  }, [data]);

  useEffect(() => {
    console.log(comments);
  }, [comments]);

  const dislike = () => {
    setLikes(0);
    setDislikes(1);
    setAction('disliked');
  };

  const reply = () => {
    setIsReply(true);
  };

  const handleSubmit = (values: any) => {
    console.log(values);
    if (!values.comment) return;
    setIsReply(false);

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

  const actions = [
    <Tooltip key="basic-like" title="Like">
      <span onClick={like}>
        {createElement(action === 'liked' ? LikeFilled : LikeOutlined)}
        <span className="comment-action">{likes}</span>
      </span>
    </Tooltip>,
    <Tooltip key="basic-dislike" title="Dislike">
      <span onClick={dislike}>
        {React.createElement(action === 'disliked' ? DislikeFilled : DislikeOutlined)}
        <span className="comment-action">{dislikes}</span>
      </span>
    </Tooltip>,
    <Tooltip key="comment-basic-reply-to" title="Reply">
      <span onClick={reply} className="comment-action">
        Reply
      </span>
    </Tooltip>,
    <Tooltip className={!isReply ? 'd-none' : ''} key="comment-basic-box" title="Comment box">
      {isReply && (
        <StyledComment
          author={<a>Han Solo</a>}
          avatar={<Avatar src="https://joeschmoe.io/api/v1/random" alt="Han Solo" />}
          content={<Editor onSubmit={handleSubmit} submitting={submitting} />}
        ></StyledComment>
      )}
    </Tooltip>
  ];

  return (
    <StyledComment
      actions={actions}
      author={<a>{data.author}</a>}
      avatar={<Avatar src={data.avatar} alt="Han Solo" />}
      content={data.content}
      datetime={
        <Tooltip title="2016-11-22 11:22:33">
          <span>{data.datetime}</span>
        </Tooltip>
      }
    >
      {comments.length > 0 && CommentList({ comments })}
    </StyledComment>
  );
};

export default CommentComponent;
