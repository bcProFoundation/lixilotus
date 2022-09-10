import { CommentOutlined, DislikeOutlined, FilterOutlined, LikeOutlined } from '@ant-design/icons';
import { Button, List, Menu, MenuProps, message, Modal, Space } from 'antd';
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
import moment from 'moment';
import CreatePostCard from '@components/Common/CreatePostCard';
import SearchBox from '@components/Common/SearchBox';
import InfoCardUser from '@components/Common/InfoCardUser';

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
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

  const IconText = ({
    icon,
    text,
    dataItem,
    imgUrl
  }: {
    icon?: React.FC;
    text?: string;
    dataItem: any;
    imgUrl?: string;
  }) => (
    <Space onClick={e => (icon === LikeOutlined ? upVoteShop(dataItem) : downVoteShop(dataItem))}>
      {icon && React.createElement(icon)}
      {imgUrl && React.createElement('img', { src: imgUrl }, null)}
      {text}
    </Space>
  );

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
        defaultSelectedKeys={['day']}
        onClick={onClickMenu}
      >
        <Menu.Item key="day">All</Menu.Item>
        <Menu.Item key="week">Friend</Menu.Item>
        <Menu.Item key="month">Trending</Menu.Item>
        <Menu.Item key="year">Experience</Menu.Item>
        <Menu.Item
          style={{ position: 'absolute', right: '0', fontWeight: '600' }}
          key="filter"
          icon={<FilterOutlined />}
        >
          Latest
        </Menu.Item>
      </Menu>
      <List
        itemLayout="vertical"
        size="large"
        pagination={{
          onChange: page => {
            console.log(page);
          },
          pageSize: 3
        }}
        dataSource={lists}
        renderItem={item => (
          <List.Item
            style={{
              marginBottom: '1rem',
              borderRadius: '24px',
              boxShadow: '0px 2px 10px rgb(0 0 0 / 5%)',
              background: 'white',
              padding: '0',
              border: 'none'
            }}
            key={item.title}
          >
            <CardContainer>
              <CardHeader onClick={() => routerShopDetail(item.id)}>
                {/* <div className="info-user">
                  <img style={{ borderRadius: '50%' }} src={item.avatar} width="24px" height="24px" alt="" />
                  <span className="name-title">{item.title}</span>
                </div>
                <span className="time-created">{moment(item.createdAt).fromNow()}</span> */}
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
                {/* <GroupIconText className="num-react">
                  <IconText icon={LikeOutlined} text={item.upVote} key="list-vertical-like-o" dataItem={item} />
                  <IconText
                    icon={DislikeOutlined}
                    text={item.downVote}
                    key="list-vertical-dis-like-o"
                    dataItem={item}
                  />
                </GroupIconText> */}
              </Content>
            </CardContainer>
            <ActionBar>
              <GroupIconText>
                <IconText text={item.upVote} imgUrl="/images/up-ico.svg" key="list-vertical-like-o" dataItem={item} />
                <IconText
                  text={item.downVote}
                  imgUrl="/images/down-ico.svg"
                  key="list-vertical-like-o"
                  dataItem={item}
                />
                <IconText
                  imgUrl="/images/comment-ico.svg"
                  text="0 Comments"
                  key="list-vertical-like-o"
                  dataItem={item}
                />
                <IconText imgUrl="/images/share-ico.svg" text="Share" key="list-vertical-like-o" dataItem={item} />
              </GroupIconText>

              <Button type="primary" onClick={item => onLixiClick(item)}>
                Send tip
              </Button>
            </ActionBar>
          </List.Item>
        )}
      />

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
