import { Comment } from '@ant-design/compatible';
import { FireOutlined } from '@ant-design/icons';
import CommentComponent, { CommentItem, Editor } from '@components/Common/Comment';
import InfoCardUser from '@components/Common/InfoCardUser';
import useWindowDimensions from '@hooks/useWindowDimensions';
import { Avatar, List, message, Space, Button } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { push } from 'connected-next-router';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '@store/hooks';
import styled from 'styled-components';
import Gallery from 'react-photo-gallery';

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
    margin: 1rem 0;
    box-sizing: border-box;
    box-shadow: 0 3px 12px rgb(0 0 0 / 4%);
    background: var(--bg-color-light-theme);
    transition: 0.5s ease;
    img {
      max-width: 100%;
      max-height: 45vh;
      object-fit: cover;
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
    border-radius: var(--border-radius-primary);
  }
`;

const CountBar = styled.div`
  display: grid;
  grid-template-columns: 70% 15% 15%;
  margin-top: 1rem;
  border-bottom: 1px solid var(--border-item-light);
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
  const [showMoreImage, setShowMoreImage] = useState(false);
  const [imagesList, setImagesList] = useState([]);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mapImages = item.uploads.map(img => {
      const imgUrl = `${process.env.NEXT_PUBLIC_AWS_ENDPOINT}/${img.upload.bucket}/${img.upload.sha}`;
      let width = parseInt(img?.upload?.width) || 4;
      let height = parseInt(img?.upload?.height) || 3;
      let objImg = {
        src: imgUrl,
        width: width,
        height: height
      };
      return objImg;
    });
    setImagesList(mapImages);
  }, []);

  const { width } = useWindowDimensions();

  useEffect(() => {
    let isMobile = width < 768 ? true : false;
    setShowMoreImage(isMobile);
  }, [width]);

  useEffect(() => {
    const descPost = ref?.current.querySelector('.description-post');
    if (descPost.clientHeight > 130) {
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
        <CardContainer className="card-container-page">
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
            {item.uploads.length != 0 && !showMoreImage && (
              <div className="images-post">
                <Gallery photos={imagesList} />
              </div>
            )}
            {item.uploads.length != 0 && showMoreImage && (
              <div className="images-post">
                <Gallery photos={imagesList} />
                {item.uploads.length > 1 && (
                  <Button type="link" className="show-more-image no-border-btn">
                    {'More ' + (item.uploads.length - 1) + ' images'}
                    <PlusCircleOutlined />
                  </Button>
                )}
              </div>
            )}
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
              onClickIcon={() => { }}
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
