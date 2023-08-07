import { Comment } from '@ant-design/compatible';
import { DislikeFilled, DislikeOutlined, LikeFilled, LikeOutlined } from '@ant-design/icons';
import { BurnCommand, BurnForType, BurnType } from '@bcpros/lixi-models/lib/burn';
import { AvatarUser } from '@components/Common/AvatarUser';
import { Counter } from '@components/Common/Counter';
import { currency } from '@components/Common/Ticker';
import { WalletContext } from '@context/walletProvider';
import useXPI from '@hooks/useXPI';
import { getSelectedAccount } from '@store/account/selectors';
import { burnForUpDownVote } from '@store/burn/actions';
import { CommentQuery } from '@store/comment/comments.generated';
import { PostsQuery } from '@store/post/posts.generated';
import { showToast } from '@store/toast/actions';
import { getAllWalletPaths, getSlpBalancesAndUtxos } from '@store/wallet';
import { formatBalance, fromXpiToSatoshis } from '@utils/cashMethods';
import { Space, Tooltip } from 'antd';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useContext, useRef } from 'react';
import intl from 'react-intl-universal';
import { CommentOrderField, OrderDirection } from '@generated/types.generated';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { BurnData } from './PostDetail';
import { AuthorizationContext } from '@context/index';
import useAuthorization from '@components/Common/Authorization/use-authorization.hooks';

export type CommentItem = CommentQuery['comment'];
type PostItem = PostsQuery['allPosts']['edges'][0]['node'];

type CommentListItemProps = {
  index: number;
  item: CommentItem;
  post: PostItem;
  handleBurn: (isUpVote: boolean, burnData: BurnData) => Promise<void>;
};

const CommentListItem = ({ index, item, post, handleBurn }: CommentListItemProps) => {
  const dispatch = useAppDispatch();
  const history = useRouter();
  const ref = useRef<HTMLDivElement | null>(null);
  const Wallet = useContext(WalletContext);
  const { XPI, chronik } = Wallet;
  const { createBurnTransaction } = useXPI();
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const selectedAccount = useAppSelector(getSelectedAccount);
  const authorization = useContext(AuthorizationContext);
  const askAuthorization = useAuthorization();

  const upVoteComment = (dataItem: CommentItem) => {
    if (authorization.authorized) {
      handleBurn(true, { data: dataItem, burnForType: BurnForType.Comment });
    } else {
      askAuthorization();
    }
  };

  const downVoteComment = (dataItem: CommentItem) => {
    if (authorization.authorized) {
      handleBurn(true, { data: dataItem, burnForType: BurnForType.Comment });
    } else {
      askAuthorization();
    }
  };

  const showUsername = () => {
    if (_.isNil(item?.commentAccount)) {
      return 'Anonymous';
    }

    return item?.commentAccount?.name;
  };

  const actions = [
    <span key={`comment-up-vote-${item.id}`}>
      <Tooltip title={intl.get('general.burnUp')}>
        <Space onClick={() => upVoteComment(item)}>
          {item?.danaBurnUp > 0 ? <LikeFilled /> : <LikeOutlined />}
          <Counter num={formatBalance(item?.danaBurnUp ?? 0)} />
        </Space>
      </Tooltip>
    </span>,
    <span key={`comment-down-vote-${item.id}`}>
      <Tooltip title={intl.get('general.burnDown')}>
        <Space onClick={() => downVoteComment(item)}>
          {item?.danaBurnDown > 0 ? <DislikeFilled /> : <DislikeOutlined />}
          <Counter num={formatBalance(item?.danaBurnDown ?? 0)} />
        </Space>
      </Tooltip>
    </span>
  ];

  return (
    <Comment
      className="comment-item"
      actions={actions}
      author={<a href={`/profile/${item.commentAccount.address}`}>{showUsername()}</a>}
      avatar={
        <div onClick={() => history.push(`/profile/${item.commentAccount.address}`)}>
          <AvatarUser icon={item.commentAccount.avatar} name={item?.commentAccount?.name} isMarginRight={false} />
        </div>
      }
      content={item.commentText}
      datetime={
        <Tooltip title={moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss')}>
          <span>{moment(item.createdAt).fromNow()}</span>
        </Tooltip>
      }
    />
  );
};

export default React.memo(CommentListItem);
