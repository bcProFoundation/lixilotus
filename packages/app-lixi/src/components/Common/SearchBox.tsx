import { SearchOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Input, Tag } from 'antd';
import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import TagInputField from './TagInputField';

export type SearchType = {
  value: string | null;
  hashtags?: string[];
};

type SearchProps = {
  searchValue?: any;
  searchPost: (value: any, hashtags?: string[]) => void;
  hashtags?: string[];
};

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

const SearchBox = (props: SearchProps) => {
  const [tags, setTags] = useState([]);

  const { control, getValues, setValue } = useForm({
    defaultValues: {
      search: props.searchValue ? props.searchValue : null
    }
  });

  const handleTagClose = removedTag => {
    const updatedTags = tags.filter(tag => tag !== removedTag);
    setTags(updatedTags);
  };

  const onPressEnter = e => {
    const { value } = e.target;
    if (e.key === 'Enter' && value !== '') {
      const regex = /#(\w+)/g;
      const parts = value.split(regex);

      const newTags = parts
        .filter((part, index) => index % 2 === 1)
        .filter(tag => tag.trim() !== '' && !tags.includes(tag));
      const normalTexts = parts.filter((part, index) => index % 2 === 0 && part.trim() !== '').join('');

      if (normalTexts.length > 0) {
        // Handle normal texts here, if needed
        console.log('Normal Texts:', normalTexts);
      }

      if (newTags.length > 0) {
        setTags([...tags, ...newTags]);
      }

      props.searchPost(normalTexts, [...tags, ...newTags]);
      setValue('search', normalTexts);
    }
  };

  const onDeleteText = () => {
    setValue('search', '');
    props.searchPost(null, []);
  };

  return (
    <React.Fragment>
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
            />
          )}
        />
        {getValues('search') && (
          <CloseCircleOutlined style={{ fontSize: '18px', color: '#7342cc' }} onClick={() => onDeleteText()} />
        )}
      </SearchBoxContainer>
      <div>
        {tags.map(tag => (
          <Tag closable onClose={() => handleTagClose(tag)} key={tag}>
            {tag}
          </Tag>
        ))}
      </div>
    </React.Fragment>
  );
};

export default SearchBox;
