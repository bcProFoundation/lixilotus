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
  onClickIcon: () => void;
}) => (
  <Space onClick={onClickIcon}>
    {icon && React.createElement(icon)}
    {imgUrl && React.createElement('img', { src: imgUrl }, null)}
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
    img {
      max-height: 250px;
      width: 100%;
    }
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
      height: 130px;
      overflow: hidden;
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

type PostItem = PostsQuery['allPosts']['edges'][0]['node'];

type PostListItemProps = {
  index: number;
  item: PostItem;
};

const PostListItem = ({ index, item }: PostListItemProps) => {
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
    if (descPost.clientHeight > 130) {
      descPost.classList.add('show-less');
      setShowMore(true);
    } else {
      setShowMore(false);
    }
  }, []);

  const showMoreHandle = () => {
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

  const upVotePost = (dataItem: PostItem) => {
    handleBurnForPost(true, dataItem);
  };

  const downVotePost = (dataItem: PostItem) => {
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
        key={post.id}
        ref={ref}
      >
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
              <p style={{ textAlign: 'left', color: 'var(--color-primary)' }} onClick={() => showMoreHandle()}>
                Show more...
              </p>
            )}
            {/* <img className="image-cover" src={post.uploadCovers} alt="" /> */}
          </Content>
        </CardContainer>
        <ActionBar>
          <GroupIconText>
            <IconBurn
              burnValue={formatBalance(post?.lotusBurnUp ?? 0)}
              imgUrl="/images/up-ico.svg"
              key={`list-vertical-upvote-o-${item.id}`}
              dataItem={item}
              onClickIcon={() => upVotePost(item)}
            />
            <IconBurn
              burnValue={formatBalance(post?.lotusBurnDown ?? 0)}
              imgUrl="/images/down-ico.svg"
              key={`list-vertical-downvote-o-${item.id}`}
              dataItem={item}
              onClickIcon={() => downVotePost(item)}
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
      </List.Item>
    </div>
  );
};

export default React.memo(PostListItem);
