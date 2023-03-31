import { Button, Input } from 'antd';
import { useEffect, useState } from 'react';
import { FilterType } from '@bcpros/lixi-models/lib/filter';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { saveBurnFilter } from '@store/settings/actions';
import styled from 'styled-components';
import intl from 'react-intl-universal';
import { getFilterPostsHome, getFilterPostsPage, getFilterPostsToken } from '@store/settings/selectors';
import { DownOutlined, UpOutlined } from '@ant-design/icons';

const FilterStyle = styled.div`
  display: flex;
  align-items: baseline;
  align-self: center;
  p {
    margin: 0;
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.5px;
    color: rgba(30, 26, 29, 0.6);
    flex: none;
  }

  .ant-input-group {
    display: flex;

    Button {
      &.down-value {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    
      &.up-value {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }

      svg {
        color: #767576;
      }

      &:hover {
        svg{
          color: #9E2A9C;
        }
      }
    }
  
    .ant-input-disabled {
      width: 60px;
      background: #fff;
      color: #000;
      cursor: pointer;
      border-radius: 0;
      border-right: 0px;
      border-left: 0px;
    }

    border: 1px solid #767576;
    border-radius: 8px;
    &:hover {
      border: 2px solid #9E2A9C;
      filter: drop-shadow(0px 0px 4px rgba(148, 31, 147, 0.5));
      border-radius: 8px;
    }
  }
`;

type FilterBurntProps = {
  filterForType: FilterType;
};

export const FilterBurnt = (props: FilterBurntProps) => {
  const dispatch = useAppDispatch();
  const { filterForType } = props;

  let valueForType;
  if (filterForType == FilterType.PostsHome) {
    valueForType = useAppSelector(getFilterPostsHome);
  } else if (filterForType == FilterType.PostsPage) {
    valueForType = useAppSelector(getFilterPostsPage);
  } else {
    valueForType = useAppSelector(getFilterPostsToken);
  }

  const handleUpDownBtn = (isUp: boolean) => {
    if (isUp) {
      valueForType === 0 ? valueForType = 1 : valueForType *= 10;
    } else {
      if (valueForType < 10) {
        valueForType = 0;
      } else {
        valueForType /= 10;
      }
    }

    const filteredData = {
      filterForType: filterForType,
      filterValue: valueForType,
    };
    dispatch(saveBurnFilter(filteredData));
  };

  return (
    <FilterStyle>
      <p>{intl.get('general.minBurnt')} &nbsp;</p>
      <Input.Group>
        <Button
          className='down-value'
          icon={<DownOutlined />}
          onClick={() => handleUpDownBtn(false)}
          disabled={valueForType === 0}
        />
        <Input disabled value={valueForType} />
        <Button
          className='up-value'
          icon={<UpOutlined />}
          onClick={() => handleUpDownBtn(true)} />
      </Input.Group>
    </FilterStyle>
  );
};