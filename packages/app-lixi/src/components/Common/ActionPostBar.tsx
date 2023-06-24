import React, { useEffect, useState } from 'react';
import { PostItem } from '@components/Posts/PostDetail';
import { GroupIconText, IconNoneHover, SpaceIconNoneHover } from '@components/Posts/PostListItem';
import styled from 'styled-components';
import Reaction from './Reaction';
import { formatBalance } from 'src/utils/cashMethods';
import { ShareSocialButton } from './ShareSocialButton';
import { RetweetOutlined } from '@ant-design/icons';
import { Space, Tooltip } from 'antd';
import { currency } from '@bcpros/lixi-components/components/Common/Ticker';
import intl from 'react-intl-universal';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getSelectedAccount } from '@store/account';
import { getAllWalletPaths, getSlpBalancesAndUtxos } from '@store/wallet';
import { getUtxoWif } from '@utils/cashMethods';
import { WalletContext } from '@context/walletProvider';
import useXPI from '@hooks/useXPI';
import { RepostInput } from '@generated/types.generated';
import { useRepostMutation } from '@store/post/posts.api';
import { showToast } from '@store/toast/actions';
import { useRouter } from 'next/router';

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  border-top: 1px solid var(--border-color-base);
  padding: 0.5rem;
  &.border-bottom {
    border-bottom: 1px solid var(--border-color-base);
  }
  .ant-space {
    gap: 4px !important;
  }
  .reaction-func {
    color: rgba(30, 26, 29, 0.6);
    cursor: pointer;
    display: flex;
    gap: 1rem;
    img {
      width: 28px;
      height: 28px;
      margin-right: 4px;
    }
  }
`;

type ActionPostBarProps = {
  post: PostItem;
  handleBurnForPost?: (isUpVote: boolean, post: any, optionBurn?: string) => Promise<void>;
  onClickIconComment?: (e) => void;
};

const ActionPostBar = ({ post, handleBurnForPost, onClickIconComment }: ActionPostBarProps) => {
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const Wallet = React.useContext(WalletContext);
  const router = useRouter();
  const selectedKey = router.pathname ?? '';
  const [borderBottom, setBorderBottom] = useState<Boolean>(false);
  const { XPI, chronik } = Wallet;
  const { sendXpi } = useXPI();

  useEffect(() => {
    selectedKey.includes('post') ? setBorderBottom(true) : setBorderBottom(false);
  }, [selectedKey]);

  const [repostTrigger, { isLoading: isLoadingRepost, isSuccess: isSuccessRepost, isError: isErrorRepost }] =
    useRepostMutation();

  const handleRepost = async (post: PostItem) => {
    try {
      let txHex;

      try {
        if (selectedAccount.id != Number(post.page.pageAccount.id) && parseFloat(post.page.createPostFee) != 0) {
          const fundingWif = getUtxoWif(slpBalancesAndUtxos.nonSlpUtxos[0], walletPaths);
          txHex = await sendXpi(
            XPI,
            chronik,
            walletPaths,
            slpBalancesAndUtxos.nonSlpUtxos,
            currency.defaultFee,
            '',
            false, // indicate send mode is one to one
            null,
            post.page.pageAccount.address,
            post.page.createPostFee,
            true,
            fundingWif,
            true
          );
        }
      } catch (error) {
        throw new Error(intl.get('post.insufficientFeeCreatePost'));
      }

      const repostInput: RepostInput = {
        accountId: selectedAccount.id,
        postId: post.id,
        txHex: txHex
      };

      await repostTrigger({ input: repostInput });
      isSuccessRepost &&
        dispatch(
          showToast('success', {
            message: 'Success',
            description: intl.get('post.repostSuccessful'),
            duration: 5
          })
        );
    } catch (e) {
      let message = e.message || e.error || JSON.stringify(e);
      if (isErrorRepost) {
        message = intl.get('post.repostFailure');
      }
      if (e.message === intl.get('post.insufficientFeeCreatePost')) {
        message = e.message;
      }
      dispatch(
        showToast('error', {
          message: 'Error',
          description: message,
          duration: 5
        })
      );
    }
  };

  return (
    <ActionBar className={borderBottom ? 'border-bottom' : ''}>
      <GroupIconText>
        <Reaction post={post} handleBurnForPost={handleBurnForPost} />
        <IconNoneHover
          value={formatBalance(post?.totalComments ?? 0)}
          imgUrl="/images/ico-comments.svg"
          key={`list-vertical-comment-o-${post.id}`}
          classStyle="custom-comment"
          onClickIcon={e => onClickIconComment(e)}
        />

        {/* Currently only apply repost to posts in the page */}
        {post.page && (
          <Tooltip title={`${intl.get('page.repostFee')}: ${post.page.createPostFee} ${currency.ticker}`}>
            <Space className="repost" size={5} onClick={() => handleRepost(post)}>
              <RetweetOutlined />
            </Space>
          </Tooltip>
        )}
      </GroupIconText>

      <ShareSocialButton slug={post.id} content={post.content} postAccountName={post.postAccount.name} />
    </ActionBar>
  );
};

export default ActionPostBar;
