import { SearchOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';

const SearchBox = props => {
  const { control, getValues, setValue } = useForm({
    defaultValues: {
      search: props.value ? props.value : null
    }
  });
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

  const onPressEnter = e => {
    const { value } = e.target;
    if (e.key === 'Enter' && value !== '') {
      props.searchPost(value);
    }
  };

  const onDeleteText = () => {
    setValue('search', '');
    props.searchPost(null);
  };

  return (
    <>
      <SearchBoxContainer>
        <div className="btn-search">
          <SearchOutlined />
        </div>
        <Controller
          name="search"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              bordered={false}
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Search for posts"
              onKeyDown={onPressEnter}
              autoFocus={value}
            />
          )}
        />
        {getValues('search') && (
          <CloseCircleOutlined style={{ fontSize: '18px', color: '#7342cc' }} onClick={() => onDeleteText()} />
        )}
      </SearchBoxContainer>
    </>
  );
};

export default SearchBox;
