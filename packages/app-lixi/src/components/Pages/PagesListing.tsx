import { CommentOutlined, DislikeOutlined, FilterOutlined, LikeOutlined } from '@ant-design/icons';
import { Avatar, Button, Comment, Input, List, Menu, MenuProps, message, Modal, Space } from 'antd';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import React from 'react';
import { AppContext } from '@store/store';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getSelectedAccount } from '@store/account/selectors';
import { getAllPages, getSelectedPageId } from '@store/page/selectors';
import { fetchAllPages, setSelectedPage } from '@store/page/action';
import QRCode from '@bcpros/lixi-components/components/Common/QRCode';
import { push } from 'connected-next-router';
import _ from 'lodash';
import { FixedSizeList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import moment from 'moment';
import CreatePostCard from '@components/Common/CreatePostCard';
import SearchBox from '@components/Common/SearchBox';
import InfoCardUser from '@components/Common/InfoCardUser';
import CommentComponent, { CommentItem, Editor } from '@components/Common/Comment';

const IconText = ({
  icon,
  text,
  dataItem,
  imgUrl,
  onClickIcon
}: {
  icon?: React.FC;
  text?: string;
  dataItem?: any;
  imgUrl?: string;
  onClickIcon?: () => void;
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
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    white-space: break-spaces;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .image-cover {
    width: 100%;
    max-height: 300px;
  }
`;

const ActionBar = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  button {
    margin-right: 1rem;
    border-radius: 20px;
  }
`;

const GroupIconText = styled.div`
  display: flex;
  border: none;
  width: 100%;
  padding: 1rem 0 1rem 0;
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

const PagesListing: React.FC = () => {
  const ContextValue = React.useContext(AppContext);
  const dispatch = useAppDispatch();
  const { XPI, Wallet } = ContextValue;
  const selectedAccount = useAppSelector(getSelectedAccount);
  const selectedPageId = useAppSelector(getSelectedPageId);
  const pageLists = useAppSelector(getAllPages);
  const [isShowQrCode, setIsShowQrCode] = useState(false);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [balanceAccount, setBalanceAccount] = useState(0);
  const [isCollapseComment, setIsCollapseComment] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [value, setValue] = useState('');

  const menuItems = [
    { label: 'All', key: 'all' },
    { label: 'Friend', key: 'friend' },
    {
      label: 'Trending',
      key: 'trending'
    },
    {
      label: 'Experiance',
      key: 'experiance'
    }
  ];

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

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    console.log(comments);
  }, [comments]);

  useEffect(() => {
    dispatch(fetchAllPages());
    const tempList = mapPagesList(_.cloneDeep(pageLists));
    setLists([...tempList]);
    // check balance account
    XPI.Electrumx.balance(selectedAccount?.address)
      .then(result => {
        if (result && result.balance) {
          const balance = result.balance.confirmed + result.balance.unconfirmed;
          setBalanceAccount(balance);
        }
      })
      .catch(e => {
        setBalanceAccount(0);
      });
  }, []);

  let mapPagesList = lists => {
    if (lists.length != 0) {
      lists.forEach(item => {
        if (!item.hasOwnProperty('upVote') && !item.hasOwnProperty('downVote')) {
          item.upVote = Math.floor(Math.random() * 101);
          item.downVote = Math.floor(Math.random() * 101);
        }

        const avatarThumbnail = item.avatar
          ? item.avatar.upload.url.replace(/(\.[\w\d_-]+)$/i, '-200$1')
          : '/images/lotus_logo.png';
        const coverThumbnail = item.cover
          ? item.cover.upload.url.replace(/(\.[\w\d_-]+)$/i, '-200$1')
          : '/images/lotus_logo.png';

        item.avatar = avatarThumbnail;
        item.cover = coverThumbnail;
      });
    }
    return lists;
  };

  const upVoteShop = dataItem => {
    if (selectedAccount && balanceAccount !== 0) {
      lists.forEach(item => {
        if (item.title === dataItem.title) item.upVote += 1;
      });
      setLists([...lists]);
      message.info(`Successful up vote shop`);
    } else {
      message.info(`Please register account to up vote`);
    }
  };

  const downVoteShop = dataItem => {
    if (selectedAccount && balanceAccount !== 0) {
      lists.forEach(item => {
        if (item.title === dataItem.title) item.downVote += 1;
      });
      setLists([...lists]);
      message.info(`Successful down vote shop`);
    } else {
      message.info(`Please register account to up vote`);
    }
  };

  const onChange = (checked: boolean) => {
    setLoading(!checked);
  };

  const onClickMenu: MenuProps['onClick'] = e => {
    if (e.key === 'filter') {
      let tempLists = lists.sort((firstItem, secondItem) => firstItem.upVote - secondItem.upVote);
      setLists([...tempLists]);
    }
    if (e.key === 'week') {
      dispatch(setSelectedPage('testPage'));
    }
  };

  const onLixiClick = item => {
    setIsShowQrCode(true);
    showModal();
  };

  const routerShopDetail = id => {
    dispatch(push(`/page/${id}`));
  };

  const isItemLoaded = (index: number) => {
    return index < lists.length && !_.isNil(lists[index]);
  };

  const PageListItem = ({ index, style, data }) => {
    const item = data[index];
    return (
      <List.Item
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '1rem',
          borderRadius: '24px',
          boxShadow: '0px 2px 10px rgb(0 0 0 / 5%)',
          background: 'white',
          padding: '1rem',
          border: 'none',
          ...style,
          height: 'fit-content'
        }}
        key={item.title}
      >
        <CardContainer>
          <CardHeader onClick={() => routerShopDetail(item.id)}>
            <InfoCardUser
              imgUrl={null}
              name={'Nguyen Tanh'}
              title={moment(item.createdAt).fromNow().toString()}
            ></InfoCardUser>
            <img src="/images/three-dot-ico.svg" alt="" />
          </CardHeader>
          <Content>
            <p className="description-post">{item.description}</p>
            <img className="image-cover" src={item.cover} alt="" />
          </Content>
        </CardContainer>
        <ActionBar>
          <GroupIconText>
            <IconText
              text={item.upVote}
              imgUrl="/images/up-ico.svg"
              key="up-vote"
              dataItem={item}
              onClickIcon={() => upVoteShop(item)}
            />
            <IconText
              text={item.downVote}
              imgUrl="/images/down-ico.svg"
              key="down-vote"
              dataItem={item}
              onClickIcon={() => downVoteShop(item)}
            />
            <IconText
              imgUrl="/images/comment-ico.svg"
              text="0 Comments"
              key="comment"
              dataItem={item}
              onClickIcon={() => {
                setIsCollapseComment(!isCollapseComment);
              }}
            />
            <IconText imgUrl="/images/share-ico.svg" text="Share" key="share" dataItem={item} />
          </GroupIconText>

          <Button type="primary" onClick={item => onLixiClick(item)}>
            Send tip
          </Button>
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
    );
  };

  return (
    <>
      <SearchBox></SearchBox>
      <CreatePostCard></CreatePostCard>
      <Menu
        style={{
          border: 'none',
          position: 'relative',
          marginBottom: '1rem',
          background: 'var(--bg-color-light-theme)'
        }}
        mode="horizontal"
        defaultSelectedKeys={['all']}
        onClick={onClickMenu}
        items={menuItems}
      ></Menu>
      <div className={'listing'} style={{ height: '100vh' }}>
        <AutoSizer>
          {({ height, width }) => (
            <InfiniteLoader isItemLoaded={isItemLoaded} itemCount={lists.length}>
              {({ onItemsRendered, ref }) => (
                <FixedSizeList
                  className="List"
                  height={height}
                  width={width}
                  itemSize={width}
                  itemCount={lists.length}
                  itemData={lists}
                  onItemsRendered={onItemsRendered}
                  ref={ref}
                >
                  {PageListItem}
                </FixedSizeList>
              )}
            </InfiniteLoader>
          )}
        </AutoSizer>
      </div>

      <Modal title="Are you sure to down vote shop?" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <p>Some contents...</p>
      </Modal>

      <Modal title="Qr code to claim lotus" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        {isShowQrCode && selectedAccount?.address && <QRCode address={selectedAccount?.address} />}
      </Modal>
    </>
  );
};

export default PagesListing;
