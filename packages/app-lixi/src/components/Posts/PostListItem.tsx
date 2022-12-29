import { BurnCommand, BurnForType, BurnType } from '@bcpros/lixi-models/lib/burn';
import CommentComponent, { CommentItem, Editor } from '@components/Common/Comment';
import { Counter } from '@components/Common/Counter';
import InfoCardUser from '@components/Common/InfoCardUser';
import { currency } from '@components/Common/Ticker';
import { WalletContext } from '@context/walletProvider';
import useXPI from '@hooks/useXPI';
import { burnForUpDownVote } from '@store/burn/actions';
import { PostsQuery } from '@store/post/posts.generated';
import { showToast } from '@store/toast/actions';
import { getAllWalletPaths, getSlpBalancesAndUtxos } from '@store/wallet';
import { formatBalance } from '@utils/cashMethods';
import { Avatar, Comment, List, Space } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import ReactHtmlParser from 'react-html-parser';
import intl from 'react-intl-universal';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import styled from 'styled-components';
import { PostsQueryTag } from '@bcpros/lixi-models/constants';
import { useRouter } from 'next/router';

const URL_SERVER_IMAGE = 'https://s3.us-west-001.backblazeb2.com';

const IconBurn = ({
  icon,
  burnValue,
  dataItem,
  imgUrl,
  onClickIcon
}: {
  icon?: React.FC;
  burnValue?: number;
  dataItem: any;
  imgUrl?: string;
  onClickIcon: (e) => void;
}) => (
  <Space onClick={onClickIcon}>
    {icon && React.createElement(icon)}
    {imgUrl && React.createElement('img', { src: imgUrl, width: '32' }, null)}
    <Counter num={burnValue ?? 0} />
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
    word-break: break-word;
    iframe {
      width: 100% !important;
      &#twitter-widget-0 {
        height: 750px !important;
        @media (min-width: 960px) {
          width: 550px !important;
          margin: auto !important;
        }
        @media (max-width: 960px) {
          height: 620px !important;
        }
      }
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
    align-items: end;
    gap: 0 !important;
  }
  @media (max-width: 960px) {
    width: 210px;
  }
  @media (min-width: 960px) {
    width: 380px;
  }
  img {
    width: 32px;
    height: 32px;
  }
`;

const PostListItemContainer = styled(List.Item)`
  display: flex;
  flex-direction: column;
  height: fit-content !important;
  margin: 2px 2px 1rem 2px;
  border-radius: 24px;
  background: white;
  padding: 0;
  border: none;
  &:hover {
    // background: #f7f7f7;
  }
`;

type PostItem = PostsQuery['allPosts']['edges'][0]['node'];

type PostListItemProps = {
  index: number;
  item: PostItem;
};

const PostListItem = ({ index, item }: PostListItemProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const post: PostItem = item;
  const [isCollapseComment, setIsCollapseComment] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [value, setValue] = useState('');
  const [showMore, setShowMore] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const Wallet = React.useContext(WalletContext);
  const { XPI, chronik } = Wallet;
  const { burnXpi } = useXPI();
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletPaths = useAppSelector(getAllWalletPaths);

  if (!post) return null;

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

  const handlePostClick = () => {
    router.push(`/post/${post.id}`);
  };

  const upVotePost = (e: React.MouseEvent<HTMLElement>, dataItem: PostItem) => {
    e.preventDefault();
    e.stopPropagation();
    handleBurnForPost(true, dataItem);
  };

  const downVotePost = (e: React.MouseEvent<HTMLElement>, dataItem: PostItem) => {
    e.preventDefault();
    e.stopPropagation();
    handleBurnForPost(false, dataItem);
  };

  const handleBurnForPost = async (isUpVote: boolean, post: PostItem) => {
    try {
      if (slpBalancesAndUtxos.nonSlpUtxos.length == 0) {
        throw new Error('Insufficient funds');
      }
      const fundingFirstUtxo = slpBalancesAndUtxos.nonSlpUtxos[0];
      const currentWalletPath = walletPaths.filter(acc => acc.xAddress === fundingFirstUtxo.address).pop();
      const { hash160, xAddress } = currentWalletPath;
      const burnType = isUpVote ? BurnType.Up : BurnType.Down;
      const burnedBy = hash160;
      const burnForId = post.id;
      const burnValue = '1';
      const tipToAddress = post?.postAccount?.address ?? undefined;
      let tag: string;

      if (_.isNil(post.page) && _.isNil(post.token)) {
        tag = PostsQueryTag.Posts;
      } else if (post.page) {
        tag = PostsQueryTag.PostsByPageId;
      } else if (post.token) {
        tag = PostsQueryTag.PostsByTokenId;
      }

      const txHex = await burnXpi(
        XPI,
        walletPaths,
        slpBalancesAndUtxos.nonSlpUtxos,
        currency.defaultFee,
        burnType,
        BurnForType.Post,
        burnedBy,
        burnForId,
        burnValue,
        tipToAddress
      );

      const burnCommand: BurnCommand = {
        txHex,
        burnType,
        burnForType: BurnForType.Post,
        burnedBy,
        burnForId,
        burnValue,
        tipToAddress: xAddress,
        postQueryTag: tag,
        pageId: post.page?.id,
        tokenId: post.token?.id
      };

      dispatch(burnForUpDownVote(burnCommand));
    } catch (e) {
      dispatch(
        showToast('error', {
          message: intl.get('post.unableToBurn'),
          duration: 5
        })
      );
    }
  };

  const showUsername = () => {
    if (_.isNil(post.postAccount)) {
      return 'Anonymous';
    }

    if (post.page) {
      if (post?.postAccount?.id == post.pageAccount?.id) {
        return post?.page?.name;
      } else {
        return post?.postAccount?.name;
      }
    }

    return post?.postAccount?.name;
  };

  return (
    <PostListItemContainer key={post.id} ref={ref} onClick={handlePostClick}>
      <CardContainer>
        <CardHeader>
          <InfoCardUser
            imgUrl={post.page ? post.page.avatar : ''}
            name={showUsername()}
            title={moment(post.createdAt).fromNow().toString()}
            address={post.postAccount ? post.postAccount.address : undefined}
            page={post.page ? post.page : undefined}
            token={post.token ? post.token : undefined}
            activatePostLocation={true}
          ></InfoCardUser>
        </CardHeader>
        <Content>
          <div className="description-post">{ReactHtmlParser(post?.content)}</div>
          {showMore && (
            <p
              style={{ textAlign: 'left', color: 'var(--color-primary)', marginBottom: '0' }}
              onClick={e => showMoreHandle(e)}
            >
              Show more...
            </p>
          )}
          {post.lotusBurnScore > 3 ||
            (!showMore && (
              <div style={{ display: item.uploads.length != 0 ? 'grid' : 'none' }} className="images-post">
                {item.uploads.length != 0 &&
                  item.uploads.map((item, index) => {
                    while (index < 4) {
                      const imageUrl = URL_SERVER_IMAGE + '/' + item.upload.bucket + '/' + item.upload.sha;
                      return (
                        <>
                          <img src={imageUrl} />
                        </>
                      );
                    }
                  })}
              </div>
            ))}
        </Content>
      </CardContainer>
      <ActionBar>
        <GroupIconText>
          <IconBurn
            burnValue={formatBalance(post?.lotusBurnUp ?? 0)}
            imgUrl="/images/ico-burn-up.svg"
            key={`list-vertical-upvote-o-${item.id}`}
            dataItem={item}
            onClickIcon={e => upVotePost(e, item)}
          />
          <IconBurn
            burnValue={formatBalance(post?.lotusBurnDown ?? 0)}
            imgUrl="/images/ico-burn-down.svg"
            key={`list-vertical-downvote-o-${item.id}`}
            dataItem={item}
            onClickIcon={e => downVotePost(e, item)}
          />
          {/* TODO: complete next Release */}
          {/* <IconText
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
            /> */}
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
    </PostListItemContainer>
  );
};

export default React.memo(PostListItem);
