import { SearchOutlined, CloseCircleOutlined, CloseOutlined, HistoryOutlined } from '@ant-design/icons';
import { Input, Popover, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import styled from 'styled-components';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import intl from 'react-intl-universal';
import { useRouter } from 'next/router';
import {
  addRecentHashtagAtHome,
  addRecentHashtagAtPages,
  addRecentHashtagAtToken,
  clearRecentHashtagAtHome,
  clearRecentHashtagAtPages,
  clearRecentHashtagAtToken,
  getRecentHashtagAtHome,
  getRecentHashtagAtPages,
  getRecentHashtagAtToken,
  removeRecentHashtagAtHome,
  removeRecentHashtagAtPages,
  removeRecentHashtagAtToken
} from '@store/account';
import { getCurrentThemes } from '@store/settings';

const Container = styled.div`
  display: flex;
  margin-bottom: 5px;
  flex: 1;
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const SearchBoxContainer = styled.div`
  display: flex;
  flex-grow: 1;
  border: 1px solid var(--border-color-base);
  height: 40px;
  background: var(--bg-color-light-theme);
  justify-content: space-between;
  padding: 0 8px !important;
  margin: 2px;
  border-radius: var(--border-radius-primary);
  align-items: center;
  border: 1px solid var(--border-color-base);
  .btn-search {
    display: flex;
    margin-right: 5px;
    .anticon {
      font-size: 16px;
      color: var(--color-primary);
    }
  }
  input {
    font-size: 11px;
    letter-spacing: 0.5px;
  }
  @media (max-width: 960px) {
    background: #fff;
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

const RecentContainer = styled.div`
  &.empty-recent {
    padding: 1rem;
    .message {
      font-size: 12px;
      color: rgba(30, 26, 29, 0.38);
    }
  }
  .header-recent {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    .title {
      font-size: 17px;
      font-weight: 500;
    }
    .btn-clear {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-primary);
      cursor: pointer;
    }
  }
  .content-recent {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    cursor: pointer;
    .item-recent {
      display: flex;
    }
    &:hover {
      background: var(--bg-color-light-theme);
      border-bottom-right-radius: 8px;
      border-bottom-left-radius: 8px;
    }
    .recent-ico {
      font-size: 18px;
    }
    .close-ico {
      font-size: 11px;
    }
    .text {
      margin-left: 1rem;
      font-size: 12px;
    }
  }
`;

const SearchBox = () => {
  const [tags, setTags] = useState([]);
  const [recentTags, setRecentTags] = useState<string[]>();
  const recentTagAtHome = useAppSelector(getRecentHashtagAtHome);
  const recentTagAtPages = useAppSelector(getRecentHashtagAtPages);
  const recentTagAtToken = useAppSelector(getRecentHashtagAtToken);
  const [query, setQuery] = useState<any>('');
  const router = useRouter();
  const numberOfTags = 3;
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(getCurrentThemes);

  const { control, getValues, setValue } = useForm({
    defaultValues: {
      search: query ? query : null
    }
  });

  useEffect(() => {
    if (router.query.q) {
      setQuery(router.query.q);
      setValue('search', router.query.q);
    }

    if (router.query.hashtags) {
      setTags((router.query.hashtags as string).split(' '));
    } else {
      setTags([]);
    }
  }, [router.query]);

  useEffect(() => {
    //code is so ugly but work for now!
    if (router.pathname.includes('/page')) {
      const pageRecentHashtag = recentTagAtPages.find((page: any) => page.id === router.query.slug);
      const recentHashtags: string[] = pageRecentHashtag?.hashtags.map(hashtag => hashtag.toLowerCase()) || [];

      setRecentTags(recentHashtags);
    } else if (router.pathname.includes('/token')) {
      const tokenRecentHashtag = recentTagAtToken.find((token: any) => token.id === router.query.slug);
      const recentHashtags: string[] = tokenRecentHashtag?.hashtags.map(hashtag => hashtag.toLowerCase()) || [];

      setRecentTags(recentHashtags);
    } else {
      setRecentTags(recentTagAtHome.map(hashtag => hashtag.toLowerCase()));
    }
  }, [recentTagAtPages, recentTagAtToken, recentTagAtHome]);

  const saveTagsToStore = (tags: string[]) => {
    if (router.pathname.includes('/page')) {
      tags.map(tag => {
        dispatch(addRecentHashtagAtPages({ id: router.query.slug as string, hashtag: tag.substring(1) }));
      });
    } else if (router.pathname.includes('/token')) {
      tags.map(tag => {
        dispatch(addRecentHashtagAtToken({ id: router.query.slug as string, hashtag: tag.substring(1) }));
      });
    } else {
      tags.map(tag => {
        dispatch(addRecentHashtagAtHome(tag.substring(1)));
      });
    }
  };

  const handleTagClose = removedTag => {
    const updatedTags = tags.filter(tag => tag !== removedTag);
    setTags([...updatedTags]);
    if (updatedTags.length === 0) {
      const { pathname, query } = router;
      delete query.hashtags; // Replace 'paramName' with the actual query parameter name you want to remove

      router.push({
        pathname,
        query
      });
    } else {
      router.replace({
        query: {
          ...router.query,
          hashtags: updatedTags.join(' ')
        }
      });
    }
  };

  const onPressKeydown = e => {
    const { value } = e.target;
    //Automatic remove the last tag when press backspace
    if (e.key === 'Backspace' && value === '' && tags.length > 0) {
      setTags(tags.slice(0, tags.length - 1));
    }

    //Automatic return to default when press backspace
    if (e.key === 'Backspace' && value === '' && tags.length === 0) {
      setValue('search', '');
      setTags([]);
      resetQuery();
    }
  };

  const resetQuery = () => {
    if (router.query.slug) {
      router.push(
        {
          query: {
            slug: router.query.slug
          }
        },
        undefined,
        { shallow: true }
      );
    } else {
      router.push('/', undefined, { shallow: true });
    }
  };

  function findHashtagDifferences(currentTags, newTags): string[] {
    // Convert all strings to lowercase
    const lowercasedCurrentTags = currentTags.map(str => str.toLowerCase());
    const lowercasedNewTags = newTags.map(str => str.toLowerCase());

    //find the differences between new tags and old tags
    const uniqueStrings = lowercasedNewTags.filter(str => !lowercasedCurrentTags.includes(str));

    //return the original newTags that we pass to this func for comfort
    const originalStrings: string[] = uniqueStrings.map(str => newTags[lowercasedNewTags.indexOf(str)]);

    return originalStrings;
  }

  const onPressEnter = e => {
    const { value } = e.target;
    if (value !== '' || tags.length > 0) {
      const regex = /#(\w+)/g;
      const parts = value.split(regex);

      //Split string into hashtags
      const newTags = parts
        .filter((part, index) => index % 2 === 1)
        .filter(tag => tag.trim() !== '' && !tags.includes(tag))
        .map(tag => `#${tag}`);

      const addTag: string[] = findHashtagDifferences(tags, newTags);

      //And normal text
      const normalTexts = parts
        .filter((part, index) => index % 2 === 0 && part.trim() !== '')
        .join('')
        .trimStart();

      const combinedTags = [...tags, ...addTag];

      if (addTag.length > 0) {
        setTags(combinedTags);
        saveTagsToStore(addTag);
      }

      setValue('search', normalTexts);
      router.replace({
        query: {
          ...router.query,
          q: normalTexts,
          hashtags: combinedTags.join(' ')
        }
      });
    }
  };

  const onClickRecentTag = (e: React.MouseEvent<HTMLElement>) => {
    const hashtag: string = e.currentTarget.innerText;
    setTags(prevTag => {
      return [...prevTag, hashtag];
    });

    if (router.query.hashtags) {
      //Check dup before adding to query
      const queryHashtags = (router.query.hashtags as string).split(' ');
      const hashtagExistedIndex = queryHashtags.findIndex(h => h.toLowerCase() === hashtag.toLowerCase());

      if (hashtagExistedIndex === -1) {
        router.replace({
          query: {
            ...router.query,
            hashtags: router.query.hashtags + ' ' + `#${hashtag.toLowerCase()}`
          }
        });
      }
    } else {
      router.replace({
        query: {
          ...router.query,
          q: '',
          hashtags: `#${hashtag.toLowerCase()}`
        }
      });
    }
  };

  const onDeleteQuery = () => {
    setValue('search', '');
    setTags([]);
    resetQuery();
  };

  const clearRecent = (recent: string, clearAll: boolean) => {
    if (router.pathname.includes('/page')) {
      if (clearAll) {
        dispatch(clearRecentHashtagAtPages({ id: router.query.slug as string }));
      } else {
        if (recentTags.includes(recent)) {
          dispatch(removeRecentHashtagAtPages({ id: router.query.slug as string, hashtag: recent }));
        }
      }
    } else if (router.pathname.includes('/token')) {
      if (clearAll) {
        dispatch(clearRecentHashtagAtToken({ id: router.query.slug as string }));
      } else {
        if (recentTags.includes(recent)) {
          dispatch(removeRecentHashtagAtToken({ id: router.query.slug as string, hashtag: recent }));
        }
      }
    } else {
      if (clearAll) {
        dispatch(clearRecentHashtagAtHome());
      } else {
        if (recentTags.includes(recent)) {
          dispatch(removeRecentHashtagAtHome(recent));
        }
      }
    }
  };

  const recentComponent = () => {
    return (
      <>
        {recentTags.length > 0 && (
          <RecentContainer>
            <div className="header-recent">
              <span className="title">Recent</span>
              <span className="btn-clear" onClick={() => clearRecent(null, true)}>
                Clear all
              </span>
            </div>
            {recentTags.map(item => {
              return (
                <div className="content-recent" onClick={e => onClickRecentTag(e)} key={item}>
                  <div className="item-recent">
                    <HistoryOutlined className="recent-ico" />
                    <span className="text">{item}</span>
                  </div>
                  <CloseOutlined className="close-ico" onClick={() => clearRecent(item, false)} />
                </div>
              );
            })}
          </RecentContainer>
        )}
        {recentTags.length === 0 && (
          <RecentContainer className="empty-recent">
            <span className="message">Try searching some hashtag...</span>
          </RecentContainer>
        )}
      </>
    );
  };

  const recentContent = recentComponent;

  return (
    <Container className="search-container">
      <Popover
        overlayClassName={`${currentTheme === 'dark' ? 'popover-dark' : ''} popover-recent-search`}
        trigger="click"
        arrow={false}
        content={recentContent}
        placement="bottomLeft"
      >
        <SearchBoxContainer className="searchbox-container">
          <div className="btn-search">
            <SearchOutlined />
          </div>
          <TagContainer>
            {tags.slice(0, numberOfTags).map(tag => (
              <StyledTag closable onClose={() => handleTagClose(tag)} key={tag} color="magenta">
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
                placeholder="Search Lixi"
                onKeyDown={onPressKeydown}
                onPressEnter={onPressEnter}
              />
            )}
          />
          {(getValues('search') || tags.length > 0) && (
            <CloseCircleOutlined style={{ fontSize: '18px', color: '#7342cc' }} onClick={() => onDeleteQuery()} />
          )}
        </SearchBoxContainer>
      </Popover>
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
