import { PostItem } from '@components/Posts/PostDetail';
import { GroupIconText, IconNoneHover, SpaceIconNoneHover } from '@components/Posts/PostListItem';
import styled from 'styled-components';
import Reaction from './Reaction';
import { formatBalance } from 'src/utils/cashMethods';
import { ShareSocialButton } from './ShareSocialButton';
import { RetweetOutlined } from '@ant-design/icons';
import { Space } from 'antd';

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #c5c5c5;
  padding: 0px 0.5rem;
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
  handleRepost?: (post: any) => Promise<void>;
  onClickIconComment?: (e) => void;
};

const ActionPostBar = ({ post, handleBurnForPost, handleRepost, onClickIconComment }: ActionPostBarProps) => {
  return (
    <ActionBar>
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
          <Space className="repost" size={5} onClick={() => handleRepost(post)}>
            <RetweetOutlined />
          </Space>
        )}
      </GroupIconText>

      <ShareSocialButton slug={post.id} content={post.content} postAccountName={post.postAccount.name} />
    </ActionBar>
  );
};

export default ActionPostBar;
