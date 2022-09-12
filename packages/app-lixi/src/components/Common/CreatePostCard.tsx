import { PlusCircleOutlined } from '@ant-design/icons';
import { fetchInitialSubLixies } from '@store/lixi/actions';
import { Avatar } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import React from 'react';
import styled from 'styled-components';

const CreatePostCard = () => {
  const CreateCardContainer = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 20px 30px;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0px 2px 10px rgb(0 0 0 / 5%);
    align-items: center;
    margin: 1rem 0;
    .avatar {
      flex: 2 auto;
      display: flex;
      align-items: center;
      .ant-avatar {
        min-width: 50px;
      }
    }
    .btn-create {
      .anticon {
        font-size: 22px;
        color: #7342cc;
      }
    }
  `;

  return (
    <>
      <CreateCardContainer>
        <div className="avatar">
          <Avatar size={50} style={{ color: '#fff', backgroundColor: '#bdbdbd' }}>
            ER
          </Avatar>
          <TextArea bordered={false} placeholder="What's on your mind?" autoSize={{ minRows: 1, maxRows: 2 }} />
        </div>
        <div className="btn-create">
          <PlusCircleOutlined />
        </div>
      </CreateCardContainer>
    </>
  );
};

export default CreatePostCard;
