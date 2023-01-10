import { DislikeOutlined, FireOutlined, LikeOutlined } from '@ant-design/icons';
import CommentComponent, { CommentItem, Editor } from '@components/Common/Comment';
import InfoCardUser from '@components/Common/InfoCardUser';
import { GroupIconText } from '@components/Posts/PostListItem';
import useWindowDimensions from '@hooks/useWindowDimensions';
import { Avatar, Button, Comment, List, message, Space } from 'antd';
import { push } from 'connected-next-router';
import _ from 'lodash';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from 'src/store/hooks';
import styled from 'styled-components';

const URL_SERVER_IMAGE = 'https://s3.us-west-001.backblazeb2.com';

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
  padding: 1rem 1rem 0 1rem;
  width: 100%;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
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
    word-break: break-word;
    cursor: pointer;
    @media (max-width: 960px) {
      div {
        &[data-lexical-decorator='true'] > div > div {
          width: 100% !important;
        }
      }
    }
    iframe {
      width: 100% !important;
      // &#twitter-widget-0 {
      //   height: 750px !important;
      //   @media (min-width: 960px) {
      //     width: 550px !important;
      //     margin: auto !important;
      //   }
      //   @media (max-width: 960px) {
      //     height: 620px !important;
      //   }
      // }
      &#reddit-embed {
        height: 500px !important;
        @media (max-width: 960px) {
          height: 450px !important;
        }
      }
      &#facebook-embed {
        height: 700px !important;
        @media (max-width: 960px) {
          height: 580px !important;
        }
      }
    }
    p {
      margin: 0;
    }
    &.show-more {
      display: block !important;
      height: fit-content !important;
      overflow: none !important;
    }
    &.show-less {
      white-space: normal;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      line-clamp: 5;
      -webkit-line-clamp: 5;
      box-orient: vertical;
      -webkit-box-orient: vertical;
    }
  }
  .image-cover {
    width: 100%;
    max-height: 300px;
  }
  .images-post {
    cursor: pointer;
    width: 100%;
    padding: 1rem;
    margin-top: 1rem;
    box-sizing: border-box;
    box-shadow: 0 3px 12px rgb(0 0 0 / 4%);
    background: var(--bg-color-light-theme);
    grid-template-columns: auto auto;
    grid-template-rows: auto auto;
    grid-column-gap: 1rem;
    justify-items: center;
    transition: 0.5s ease;
    img {
      margin-bottom: 1rem;
      width: 80%;
    }
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  width: 100%;
  button {
    margin-right: 1rem;
    border-radius: 20px;
  }
`;

const CountBar = styled.div`
  display: grid;
  grid-template-columns: 70% 15% 15%;
  margin-top: 1rem;
  border-bottom: 1px solid var(--boder-item-light);
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
  const [showMore, setShowMore] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const { width } = useWindowDimensions();

  useEffect(() => {
    let isMobile = width < 768 ? true : false;
    setIsMobileScreen(isMobile);
  }, [width]);

  useEffect(() => {
    const descPost = ref?.current.querySelector('.description-post');
    if (descPost.clientHeight > 130 || item.uploads.length != 0) {
      descPost.classList.add('show-less');
      setShowMore(true);
    } else {
      setShowMore(false);
    }
  }, []);

  const showMoreHandle = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const descPostDom = ref?.current.querySelector('.description-post');
    descPostDom.classList.add('show-more');
    setShowMore(false);
  };

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
    <div ref={ref}>
      <List.Item
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'fit-content !important',
          marginBottom: '1rem',
          borderRadius: '24px',
          background: 'white',
          padding: '0',
          border: '1px solid rgba(128, 116, 124, 0.12)'
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
            {showMore && (
              <p
                style={{ textAlign: 'left', color: 'var(--color-primary)', marginBottom: '0', cursor: 'pointer' }}
                onClick={e => showMoreHandle(e)}
              >
                Show more...
              </p>
            )}
            {item.lotusBurnScore > 3 ||
              (!showMore && (
                <div style={{ display: item.uploads.length != 0 ? 'grid' : 'none' }} className="images-post">
                  {item.uploads.length != 0 &&
                    item.uploads.map((item, index) => {
                      while (index < 4) {
                        const imageUrl = URL_SERVER_IMAGE + '/' + item.upload.bucket + '/' + item.upload.sha;
                        return (
                          <>
                            <img loading="lazy" src={imageUrl} />
                          </>
                        );
                      }
                    })}
                </div>
              ))}
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
