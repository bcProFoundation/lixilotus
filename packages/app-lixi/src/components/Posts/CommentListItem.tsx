import { BurnCommand, BurnForType, BurnType } from '@bcpros/lixi-models/lib/burn';
import { Counter } from '@components/Common/Counter';
import { currency } from '@components/Common/Ticker';
import { WalletContext } from '@context/walletProvider';
import useXPI from '@hooks/useXPI';
import { burnForUpDownVote } from '@store/burn/actions';
import { showToast } from '@store/toast/actions';
import { getAllWalletPaths, getSlpBalancesAndUtxos } from '@store/wallet';
import { formatBalance } from '@utils/cashMethods';
import { Avatar, List, Space } from 'antd';
import React, { useRef } from 'react';
import intl from 'react-intl-universal';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import styled from 'styled-components';
import _ from 'lodash';
import { CommentQuery } from '@store/comment/comments.generated';
import { useRouter } from 'next/router';

const ActionComment = styled.div`
  margin-left: 12%;
  font-size: 13px;
`;

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

type CommentItem = CommentQuery['comment'];

type CommentListItemProps = {
  index: number;
  item: CommentItem;
};

const CommentListItem = ({ index, item }: CommentListItemProps) => {
  const dispatch = useAppDispatch();

  const history = useRouter();
  const ref = useRef<HTMLDivElement | null>(null);

  const Wallet = React.useContext(WalletContext);
  const { XPI, chronik } = Wallet;
  const { burnXpi } = useXPI();
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletPaths = useAppSelector(getAllWalletPaths);

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
      const tipToAddress = comment?.commentAccount?.address ?? undefined;

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
        tipToAddress
      );

      const burnCommand: BurnCommand = {
        txHex,
        burnType,
        burnForType: BurnForType.Comment,
        burnedBy,
        burnForId,
        burnValue,
        tipToAddress: xAddress
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

  return (
    <div>
      <List.Item key={item.id} ref={ref}>
        <List.Item.Meta
          className="comment-item-meta"
          avatar={
            <Avatar src="/images/xpi.svg" onClick={() => history.push(`/profile/${item.commentAccount.address}`)} />
          }
          title={<a href={`/profile/${item.commentAccount.address}`}>{showUsername()}</a>}
          description={item.commentText}
        />
        <ActionComment className="action-comment">
          <IconBurn
            burnValue={formatBalance(item?.lotusBurnUp ?? 0)}
            imgUrl="/images/up-ico.svg"
            key={`list-vertical-upvote-o-${item.id}`}
            dataItem={item}
            onClickIcon={() => upVoteComment(item)}
          />
          <IconBurn
            burnValue={formatBalance(item?.lotusBurnDown ?? 0)}
            imgUrl="/images/down-ico.svg"
            key={`list-vertical-downvote-o-${item.id}`}
            dataItem={item}
            onClickIcon={() => downVoteComment(item)}
          />
        </ActionComment>
      </List.Item>
    </div>
  );
};

export default React.memo(CommentListItem);
