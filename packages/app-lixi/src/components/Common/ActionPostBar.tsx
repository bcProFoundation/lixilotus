import React, { useEffect, useState } from 'react';
import { PostItem } from '@components/Posts/PostDetail';
import styled from 'styled-components';
import BaseReaction from './Reaction';
import { formatBalance } from 'src/utils/cashMethods';
import ShareSocialButton from './ShareSocialButton';
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
import { Counter } from './Counter';
import { WithAuthorizeAction } from './Authorization/WithAuthorizeAction';

export const GroupIconText = styled.div`
  align-items: center;
  display: flex;
  .ant-space {
    cursor: pointer;
    margin-right: 1rem;
    align-items: end;
    border-radius: 12px;
    cursor: pointer;
    @media (max-width: 960px) {
      margin-right: 0;
    }

    &.repost {
      svg {
        color: var(--color-primary);
        width: 28px;
        height: 28px;
      }
    }
  }
  img {
    width: 28px;
    height: 28px;
  }
  .count {
    color: rgba(30, 26, 29, 0.6);
    font-size: 12px;
  }
`;

export const SpaceIconNoneHover = styled(Space)`
  min-height: 38px;
  padding: 8px;
  img {
    transition: all 0.2s ease-in-out;
    width: 28px;
    height: 28px;
  }

  &:hover {
    background: #faf1fa;
  }
`;

export const IconNoneHover = ({
  value,
  imgUrl,
  classStyle,
  onClick
}: {
  value?: number;
  imgUrl?: string;
  classStyle?: string;
  onClick: (...args: any) => void;
}) => (
  <SpaceIconNoneHover onClick={onClick} size={5}>
    {imgUrl && (
      <picture>
        <img className={classStyle} alt="burnIcon" src={imgUrl} />
      </picture>
    )}
    {value && <Counter num={value ?? 0} />}
  </SpaceIconNoneHover>
);

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
  @media (max-width: 520px) {
    padding: 4px;
  }
`;

type ActionPostBarProps = {
  post: PostItem;
  handleBurnForPost?: (isUpVote: boolean, post: any, optionBurn?: string) => Promise<void>;
  onClickIconComment?: (e) => void;
  isSetBorderBottom?: boolean;
};

const AuthorizeIconNoneHover = WithAuthorizeAction(IconNoneHover);
const AuthorizeReaction = WithAuthorizeAction(BaseReaction);

const ActionPostBar = ({ post, handleBurnForPost, onClickIconComment, isSetBorderBottom }: ActionPostBarProps) => {
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
    selectedKey.includes('post') || isSetBorderBottom ? setBorderBottom(true) : setBorderBottom(false);
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
    <ActionBar className={`action-post-bar ${borderBottom ? 'border-bottom' : ''}`}>
      <GroupIconText>
        <AuthorizeReaction post={post} handleBurnForPost={handleBurnForPost} />
        <AuthorizeIconNoneHover
          value={formatBalance(post?.totalComments ?? 0)}
          imgUrl="/images/ico-comments.svg"
          key={`list-vertical-comment-o-${post.id}`}
          classStyle="custom-comment"
          onClick={e => onClickIconComment(e)}
        />

        {/* Currently only apply repost to posts in the page */}
        {post.page && (
          <Tooltip title={`${intl.get('page.repostFee')}: ${post.page.createPostFee} ${currency.ticker}`}>
            <Space style={{ padding: '8px' }} className="repost" size={5} onClick={() => handleRepost(post)}>
              <RetweetOutlined />
              <Counter isShowXPI={false} num={post.reposts?.length ?? 0} />
            </Space>
          </Tooltip>
        )}
      </GroupIconText>

      <ShareSocialButton slug={post.id} content={post.content} postAccountName={post.postAccount.name} />
    </ActionBar>
  );
};

export default React.memo(ActionPostBar);
