import { DislikeOutlined, FilterOutlined, LikeOutlined } from '@ant-design/icons';
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

const CardContainer = styled.div`
  display: flex;
`;

const Image = styled.div`
  width: fit-content;
  img {
    width: 80px;
    height: 80px;
  }
`;

const Content = styled.div`
  text-align: left;
  padding-left: 2rem;
  h3 {
    color: red;
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
`;

const GroupIconText = styled.div`
  .ant-space {
    margin-right: 1rem;
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

  let mapPagesList = (lists) => {
    if (lists.length != 0) {
      lists.forEach(item => {
        if (!item.hasOwnProperty('upVote') && !item.hasOwnProperty('downVote') ) {
          item.upVote = Math.floor(Math.random() * 101);
          item.downVote = Math.floor(Math.random() * 101);
        }
        item.avatar = 'https://joeschmoe.io/api/v1/random';
        item.cover = 'https://picsum.photos/500/300';
      });
    }
    return lists;
  }

  const IconText = ({ icon, text, dataItem }: { icon: React.FC; text: string; dataItem: any }) => (
    <Space onClick={e => (icon === LikeOutlined ? upVoteShop(dataItem) : downVoteShop(dataItem))}>
      {React.createElement(icon)}
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
      <Menu
        style={{ border: 'none', position: 'relative', marginBottom: '1rem' }}
        mode="horizontal"
        defaultSelectedKeys={['day']}
        onClick={onClickMenu}
      >
        <Menu.Item key="day">24h</Menu.Item>
        <Menu.Item key="week">Week</Menu.Item>
        <Menu.Item key="month">Month</Menu.Item>
        <Menu.Item key="year">Year</Menu.Item>
        <Menu.Item style={{ position: 'absolute', right: '0' }} key="filter" icon={<FilterOutlined />}>
          Filter
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
              border: '0',
              marginBottom: '1rem',
              borderRadius: '8px',
              boxShadow: '0px 1px 2px rgb(0 0 0 / 4%), 0px 2px 6px 2px rgb(0 0 0 / 8%)'
            }}
            key={item.title}
          >
            <CardContainer>
              <Image>
                <img src={item.avatar} alt="" />
              </Image>
              <Content>
                <h3 onClick={() => routerShopDetail(item.title)}>{item.title}</h3>
                <p>{item.address}</p>
                <p>{item.description}</p>
              </Content>
            </CardContainer>
            <ActionBar>
              <GroupIconText>
                <IconText icon={LikeOutlined} text={item.upVote} key="list-vertical-like-o" dataItem={item} />
                <IconText icon={DislikeOutlined} text={item.downVote} key="list-vertical-dis-like-o" dataItem={item} />
              </GroupIconText>
              <Button onClick={item => onLixiClick(item)}>lixi</Button>
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
