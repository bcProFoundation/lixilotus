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
import { Avatar, Comment, Space, Tooltip } from 'antd';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useRef } from 'react';
import intl from 'react-intl-universal';
import { CommentOrderField, OrderDirection } from 'src/generated/types.generated';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import styled from 'styled-components';

type CommentItem = CommentQuery['comment'];
type PostItem = PostsQuery['allPosts']['edges'][0]['node'];

type CommentListItemProps = {
  index: number;
  item: CommentItem;
  post: PostItem;
};

const CommentListItem = ({ index, item, post }: CommentListItemProps) => {
  const dispatch = useAppDispatch();

  const history = useRouter();
  const ref = useRef<HTMLDivElement | null>(null);

  const Wallet = React.useContext(WalletContext);
  const { XPI, chronik } = Wallet;
  const { burnXpi } = useXPI();
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const selectedAccount = useAppSelector(getSelectedAccount);

  const upVoteComment = (dataItem: CommentItem) => {
    handleBurnForComment(true, dataItem);
  };

  const downVoteComment = (dataItem: CommentItem) => {
    handleBurnForComment(false, dataItem);
  };

  const handleBurnForComment = async (isUpVote: boolean, comment: CommentItem) => {
    try {
      if (slpBalancesAndUtxos.nonSlpUtxos.length == 0) {
        throw new Error('Insufficient funds');
      }
      const fundingFirstUtxo = slpBalancesAndUtxos.nonSlpUtxos[0];
      const currentWalletPath = walletPaths.filter(acc => acc.xAddress === fundingFirstUtxo.address).pop();
      const { hash160, xAddress } = currentWalletPath;
      const burnType = isUpVote ? BurnType.Up : BurnType.Down;
      const burnedBy = hash160;
      const burnForId = comment.id;
      const burnValue = '1';
      // const tipToAddress = comment?.commentAccount?.address ?? undefined;
      const tipToAddresses: { address: string; amount: string }[] = [];
      if (burnType && post?.postAccount?.address && post?.postAccount?.address !== selectedAccount.address) {
        tipToAddresses.push({
          address: comment?.commentAccount?.address,
          amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(0.04)) as unknown as string
        });
      }
      if (post?.page && post.pageAccount.address && post?.pageAccount?.address !== selectedAccount.address) {
        tipToAddresses.push({
          address: post.pageAccount.address,
          amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(0.04)) as unknown as string
        });
      }

      const txHex = await burnXpi(
        XPI,
        walletPaths,
        slpBalancesAndUtxos.nonSlpUtxos,
        currency.defaultFee,
        burnType,
        BurnForType.Comment,
        burnedBy,
        burnForId,
        burnValue,
        tipToAddresses
      );

      const burnCommand: BurnCommand = {
        txHex,
        burnType,
        burnForType: BurnForType.Comment,
        burnedBy,
        burnForId,
        burnValue,
        tipToAddresses: tipToAddresses,
        queryParams: {
          id: comment.commentToId,
          orderBy: {
            direction: OrderDirection.Asc,
            field: CommentOrderField.UpdatedAt
          }
        }
      };

      dispatch(burnForUpDownVote(burnCommand));
    } catch (e) {
      dispatch(
        showToast('error', {
          message: intl.get('post.unableToBurn'),
          duration: 3
        })
      );
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
          {item?.lotusBurnUp > 0 ? <LikeFilled /> : <LikeOutlined />}
          <Counter num={formatBalance(item?.lotusBurnUp ?? 0)} />
        </Space>
      </Tooltip>
    </span>,
    <span key={`comment-down-vote-${item.id}`}>
      <Tooltip title={intl.get('general.burnDown')}>
        <Space onClick={() => downVoteComment(item)}>
          {item?.lotusBurnDown > 0 ? <DislikeFilled /> : <DislikeOutlined />}
          <Counter num={formatBalance(item?.lotusBurnDown ?? 0)} />
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
