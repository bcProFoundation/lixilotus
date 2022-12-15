import { SearchOutlined } from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';
import React from 'react';
import styled from 'styled-components';
import { Input } from 'antd';

const SearchBox = () => {
  const SearchBoxContainer = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    margin: 2px;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0px 2px 10px rgb(0 0 0 / 5%);
    align-items: center;
    .btn-search {
      .anticon {
        font-size: 24px;
      }
    }
  `;

  return (
    <>
      <SearchBoxContainer>
        <div className="btn-search">
          <SearchOutlined />
        </div>
        <Input bordered={false} placeholder="Search for people, topics, or experiences" />
      </SearchBoxContainer>
    </>
  );
};

export default SearchBox;
