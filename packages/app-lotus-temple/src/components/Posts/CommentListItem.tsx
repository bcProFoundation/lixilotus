import { Comment } from '@ant-design/compatible';
import { DislikeFilled, DislikeOutlined, LikeFilled, LikeOutlined } from '@ant-design/icons';
import { BurnForType } from '@bcpros/lixi-models/lib/burn';
import { AvatarUser } from '@components/Common/AvatarUser';
import { Counter } from '@components/Common/Counter';
import { WalletContext } from '@context/walletProvider';
import useXPI from '@hooks/useXPI';
import { getSelectedAccount } from '@store/account/selectors';
import { CommentQuery } from '@store/comment/comments.generated';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { PostQuery } from '@store/post/posts.generated';
import { getAllWalletPaths, getSlpBalancesAndUtxos } from '@store/wallet';
import { formatBalance } from '@utils/cashMethods';
import { Space, Tooltip } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useRef } from 'react';
import intl from 'react-intl-universal';
import { BurnData } from './PostDetail';

export type CommentItem = CommentQuery['comment'];
type PostItem = PostQuery['post'];

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

  const Wallet = React.useContext(WalletContext);
  const { XPI, chronik } = Wallet;
  const { createBurnTransaction } = useXPI();
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const selectedAccount = useAppSelector(getSelectedAccount);

  const upVoteComment = (dataItem: CommentItem) => {
    handleBurn(true, { data: dataItem, burnForType: BurnForType.Comment });
  };

  const downVoteComment = (dataItem: CommentItem) => {
    handleBurn(false, { data: dataItem, burnForType: BurnForType.Comment });
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
          <AvatarUser name={item?.commentAccount?.name} isMarginRight={false} />
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
