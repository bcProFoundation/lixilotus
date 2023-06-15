import { SearchOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Input, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import intl from 'react-intl-universal';

export type SearchType = {
  value: string | null;
  hashtags?: string[];
};

type SearchProps = {
  searchValue?: any;
  searchPost: (value: any, hashtags?: string[]) => void;
  hashtags?: string[];
  onDeleteHashtag: (hashtags?: string[]) => void;
  onDeleteQuery?: () => void;
  suggestedHashtag?: string[];
};

const Container = styled.div`
  display: flex;
  margin-bottom: 5px;
  flex-direction: column;
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

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
    display: flex;
    margin-right: 5px;
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

const TagContainer = styled.div`
  display: flex;
  @media (max-width: 576px) {
    display: none;
  }
`;

const SuggestedTagContainer = styled.div`
  display: flex;
  gap: 5px;
`;

const MobileTagContainer = styled.div`
  @media (min-width: 576px) {
    display: none;
  }

  @media (max-width: 576px) {
    display: flex;
    flex-wrap: wrap;
  }
`;

const StyledTag = styled(Tag)`
  font-weight: bold;
  font-style: italic;
  font-size: 15px;
  height: 24px;
  margin-bottom: 5px;
  margin-right: 5px;
`;

const SearchBox = (props: SearchProps) => {
  const [tags, setTags] = useState([]);
  const [suggestedTags, setSuggestedTags] = useState(props.suggestedHashtag);

  const numberOfTags = 3;

  const { control, getValues, setValue } = useForm({
    defaultValues: {
      search: props.searchValue ? props.searchValue : null
    }
  });

  const handleTagClose = removedTag => {
    const updatedTags = tags.filter(tag => tag !== removedTag);
    setTags([...updatedTags]);
    props.onDeleteHashtag(updatedTags);
  };

  useEffect(() => {
    if (props.hashtags.length > 0) {
      setTags([...props.hashtags]);
    }
  }, [props.hashtags]);

  useEffect(() => {
    if (props.suggestedHashtag && props.suggestedHashtag.length > 0) {
      setSuggestedTags([...props.suggestedHashtag]);
    }
  }, [props.suggestedHashtag]);

  const onPressKeydown = e => {
    const { value } = e.target;
    //Automatic remove the last tag when press backspace
    if (e.key === 'Backspace' && value === '' && tags.length > 0) {
      setTags(tags.slice(0, tags.length - 1));
      props.onDeleteHashtag(tags.slice(0, tags.length - 1));
    }

    //Automatic return to default when press backspace
    if (e.key === 'Backspace' && value === '' && tags.length === 0) {
      setValue('search', '');
      setTags([]);
      props.searchPost(null, []);
    }
  };

  const onPressEnter = e => {
    const { value } = e.target;
    if (value !== '') {
      const regex = /#(\w+)/g;
      const parts = value.split(regex);

      //Split string into hashtags
      const newTags = parts
        .filter((part, index) => index % 2 === 1)
        .filter(tag => tag.trim() !== '' && !tags.includes(tag))
        .map(tag => `#${tag}`);

      //And normal text
      const normalTexts = parts.filter((part, index) => index % 2 === 0 && part.trim() !== '').join('');

      if (newTags.length > 0) {
        setTags([...tags, ...newTags]);
      }

      props.searchPost(normalTexts, [...tags, ...newTags]);
      setValue('search', normalTexts);
    }
  };

  const onClickSuggestedTag = (e: React.MouseEvent<HTMLElement>) => {
    const newTag: string = e.currentTarget.innerText;
    setTags(prevTag => {
      return [...prevTag, newTag];
    });
    props.searchPost('', [...tags, newTag]);
  };

  const onDeleteQuery = () => {
    setValue('search', '');
    setTags([]);
    props.onDeleteQuery();
  };

  return (
    <Container>
      {suggestedTags && suggestedTags.length > 0 && (
        <SuggestedTagContainer>
          <div style={{ fontSize: '15px', marginBottom: '0px' }}>{intl.get('general.suggested')}</div>
          {suggestedTags.map(tag => (
            <StyledTag
              onClose={() => handleTagClose(tag)}
              key={tag}
              color="geekblue"
              onClick={onClickSuggestedTag}
              style={{ cursor: 'pointer' }}
            >
              {`#${tag}`}
            </StyledTag>
          ))}
        </SuggestedTagContainer>
      )}
      <SearchBoxContainer>
        <div className="btn-search">
          <SearchOutlined />
        </div>
        <TagContainer>
          {tags.slice(0, numberOfTags).map(tag => (
            <StyledTag closable onClose={() => handleTagClose(tag)} key={tag} color="green">
              {tag}
            </StyledTag>
          ))}
          {tags.length > numberOfTags && <StyledTag color="magenta">{`+${tags.length - numberOfTags}`}</StyledTag>}
        </TagContainer>
        <Controller
          name="search"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              style={{ paddingLeft: '0px' }}
              bordered={false}
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Now supported #hashtag"
              onKeyDown={onPressKeydown}
              onPressEnter={onPressEnter}
            />
          )}
        />
        {(getValues('search') || tags.length > 0) && (
          <CloseCircleOutlined style={{ fontSize: '18px', color: '#7342cc' }} onClick={() => onDeleteQuery()} />
        )}
      </SearchBoxContainer>
      <MobileTagContainer style={{ margin: tags.length > 0 ? '10px' : '0px' }}>
        {tags.map(tag => (
          <StyledTag closable onClose={() => handleTagClose(tag)} key={tag} color="magenta">
            {tag}
          </StyledTag>
        ))}
      </MobileTagContainer>
    </Container>
  );
};

export default SearchBox;
