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
    flex-grow: 1;
    justify-content: space-between;
    padding: 8px 1rem !important;
    margin: 2px;
    background: #fff;
    border-radius: 20px;
    align-items: center;
    border: 1px solid var(--boder-item-light);
    .btn-search {
      .anticon {
        font-size: 18px;
        color: #4e444b;
      }
    }
    input {
      font-size: 14px;
      line-height: 24px;
      letter-spacing: 0.5px;
    }
    @media (max-width: 968px) {
      padding: 8px 1rem !important;
    }
  `;

  const onPressEnter = e => {
    const { value } = e.target;
    if (e.key === 'Enter' && value !== '') {
      props.search(value);
    }
  };

  const onDeleteText = () => {
    setValue('search', '');
    props.search(null);
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
              placeholder="Search..."
              onKeyDown={onPressEnter}
              disabled={props.loading}
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
