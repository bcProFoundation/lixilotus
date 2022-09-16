import { LikeOutlined } from '@ant-design/icons';
import InfoCardUser from '@components/Common/InfoCardUser';
import { Button, List, message, Space } from 'antd';
import { push } from 'connected-next-router';
import moment from 'moment';
import React from 'react';
import { useAppDispatch } from 'src/store/hooks';
import styled from 'styled-components';
import _ from 'lodash';

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
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

const PageListItem = ({ index, style, data }) => {
  const dispatch = useAppDispatch();

  if (_.isNil(index)) console.log('index is nil: ', index);
  if (_.isNil(index)) return;

  const item = data[index];
  if (!item) return null;

  const routerShopDetail = id => {
    dispatch(push(`/page/${id}`));
  };

  const onLixiClick = item => {
    // setIsShowQrCode(true);
    // showModal();
  };

  const upVoteShop = dataItem => {
    // if (selectedAccount && balanceAccount !== 0) {
    // data.forEach(item => {
    //   if (item.title === dataItem.title) item.upVote += 1;
    // });
    message.info(`Successful up vote shop`);
    // } else {
    message.info(`Please register account to up vote`);
    // }
  };

  const downVoteShop = dataItem => {
    // if (selectedAccount && balanceAccount !== 0) {
    // lists.forEach(item => {
    //   if (item.title === dataItem.title) item.downVote += 1;
    // });
    message.info(`Successful down vote shop`);
    // } else {
    message.info(`Please register account to up vote`);
    // }
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

  return (
    <div style={style}>
      <List.Item
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'fit-content !important',
          marginBottom: '1rem',
          borderRadius: '24px',
          boxShadow: '0px 2px 10px rgb(0 0 0 / 5%)',
          background: 'white',
          padding: '0',
          border: 'none'
        }}
        key={item.id}
      >
        <CardContainer>
          <CardHeader onClick={() => routerShopDetail(item.id)}>
            <InfoCardUser
              imgUrl={item.avatar}
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
              key={`list-vertical-upvote-o-${item.id}`}
              dataItem={item}
            />
            <IconText
              text={item.downVote}
              imgUrl="/images/down-ico.svg"
              key={`list-vertical-downvote-o-${item.id}`}
              dataItem={item}
            />
            <IconText
              imgUrl="/images/comment-ico.svg"
              text="0 Comments"
              key={`list-vertical-comment-o-${item.id}`}
              dataItem={item}
            />
            <IconText
              imgUrl="/images/share-ico.svg"
              text="Share"
              key={`list-vertical-share-o-${item.id}`}
              dataItem={item}
            />
          </GroupIconText>

          <Button type="primary" onClick={item => onLixiClick(item)}>
            Send tip
          </Button>
        </ActionBar>
      </List.Item>
    </div>
  );
};

export default React.memo(PageListItem);
