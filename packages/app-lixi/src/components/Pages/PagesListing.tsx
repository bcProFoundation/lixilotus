import { CommentOutlined, DislikeOutlined, FilterOutlined, LikeOutlined } from '@ant-design/icons';
import { List, Menu, MenuProps, message, Modal, Space } from 'antd';
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
import { useInfinitePagesQuery } from '@store/page/useInfinitePagesQuery';

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem 4rem 0 4rem;
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
  display: flex;
  justify-content: space-between;
`;

const GroupIconText = styled.div`
  width: 100%;
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  &.num-react {
    padding: 1rem 0;
    border: none;
    text-align: left;
  }
  .ant-space {
    margin-right: 2rem;
  }
  @media (max-width: 768px) {
    .ant-space {
      margin-right: 1rem;
    }
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
  // const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [balanceAccount, setBalanceAccount] = useState(0);

  const { data, totalCount } = useInfinitePagesQuery({
    first: 1,
    last: undefined
  }, false);

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
    // dispatch(fetchAllPages());
    // const tempList = mapPagesList(_.cloneDeep(pageLists));
    // setLists([...tempList]);
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

  const IconText = ({ icon, text, dataItem }: { icon: React.FC; text: string; dataItem: any }) => (
    <Space onClick={e => (icon === LikeOutlined ? upVoteShop(dataItem) : downVoteShop(dataItem))}>
      {React.createElement(icon)}
      {text}
    </Space>
  );

  const upVoteShop = dataItem => {
    if (selectedAccount && balanceAccount !== 0) {
      // data.forEach(item => {
      //   if (item.title === dataItem.title) item.upVote += 1;
      // });
      message.info(`Successful up vote shop`);
    } else {
      message.info(`Please register account to up vote`);
    }
  };

  const downVoteShop = dataItem => {
    if (selectedAccount && balanceAccount !== 0) {
      // lists.forEach(item => {
      //   if (item.title === dataItem.title) item.downVote += 1;
      // });
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
    return index < data.length && !_.isNil(data[index]);
  };

  const PageListItem = ({ index, style, data }) => {
    const item = data[index];
    if (!item) return null;
    return (
      <List.Item
        style={{
          marginBottom: '1rem',
          borderRadius: '24px',
          boxShadow: '0px 1px 2px rgb(0 0 0 / 4%), 0px 2px 6px 2px rgb(0 0 0 / 8%)',
          background: 'white',
          padding: '0',
          border: '1px solid #e0e0e0',
          flexDirection: 'column',
          ...style
        }}
        key={item.title}
      >
        <CardContainer>
          <CardHeader onClick={() => routerShopDetail(item.id)}>
            <div className="info-user">
              <img style={{ borderRadius: '50%' }} src={item?.avatar} width="24px" height="24px" alt="" />
              <span className="name-title">{item.title}</span>
            </div>
            <span className="time-created">{moment(item.createdAt).fromNow()}</span>
          </CardHeader>
          <Content>
            <p className="description-post">{item.description}</p>
            <img className="image-cover" src={item?.cover} alt="" />
            <GroupIconText className="num-react">
              <IconText icon={LikeOutlined} text={item?.upVote} key="list-vertical-like-o" dataItem={item} />
              <IconText icon={DislikeOutlined} text={item?.downVote} key="list-vertical-dis-like-o" dataItem={item} />
            </GroupIconText>
          </Content>
        </CardContainer>
        <ActionBar>
          <GroupIconText>
            <IconText icon={LikeOutlined} text={'Vote Up'} key="list-vertical-like-o" dataItem={item} />
            <IconText icon={DislikeOutlined} text={'Vote Down'} key="list-vertical-dis-like-o" dataItem={item} />
            <IconText icon={CommentOutlined} text={'Comment'} key="list-vertical-comment-o" dataItem={item} />
          </GroupIconText>
          {/* <Button type="primary" onClick={item => onLixiClick(item)}>
                lixi
              </Button> */}
        </ActionBar>
      </List.Item>
    );
  };

  return (
    <>
      <div className={'listing'} style={{ height: '100vh' }}>
        <AutoSizer>
          {({ height, width }) => (
            <InfiniteLoader
              isItemLoaded={isItemLoaded}
              loadMoreItems={() => { }}
              itemCount={totalCount} >
              {({ onItemsRendered, ref }) => (
                <FixedSizeList
                  className="List"
                  height={height}
                  width={width}
                  itemSize={width}
                  itemCount={totalCount}
                  itemData={data}
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
