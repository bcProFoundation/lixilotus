import { Button, Input } from 'antd';
import { useEffect, useState } from 'react';
import { FilterType } from '@bcpros/lixi-models/lib/filter';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { saveBurnFilter } from '@store/settings/actions';
import styled from 'styled-components';
import intl from 'react-intl-universal';
import {
  getFilterPostsHome,
  getFilterPostsPage,
  getFilterPostsProfile,
  getFilterPostsToken
} from '@store/settings/selectors';
import { DownOutlined, MinusOutlined, PlusOutlined, UpOutlined } from '@ant-design/icons';

const FilterStyle = styled.div`
  display: flex;
  align-items: baseline;
  align-self: center;
  p {
    margin: 0px;
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
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 10px;

    Button {
      &.down-value {
        border: 0.1px solid;
        border-radius: 50%;
        color: rgba(30, 26, 29, 0.6);
      }
      &.down-value:hover {
        border: 1.3px solid #9e2a9c;
      }
      &.up-value {
        border: 0.1px solid;
        border-radius: 50%;
        color: rgba(30, 26, 29, 0.6);
      }
      &.up-value:hover {
        border: 1.3px solid #9e2a9c;
      }
    }
    .ant-input-disabled {
      width: 54px;
      color: #000;
      cursor: pointer;
      border: 0px;
      background: rgba(0, 0, 0, 0);
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
  } else if (filterForType == FilterType.PostsToken) {
    valueForType = useAppSelector(getFilterPostsToken);
  } else {
    valueForType = useAppSelector(getFilterPostsProfile);
  }

  const handleUpDownBtn = (isUp: boolean) => {
    if (isUp) {
      valueForType === 0 ? (valueForType = 1) : (valueForType *= 10);
    } else {
      if (valueForType < 10) {
        valueForType = 0;
      } else {
        valueForType /= 10;
      }
    }

    const filteredData = {
      filterForType: filterForType,
      filterValue: valueForType
    };
    dispatch(saveBurnFilter(filteredData));
  };

  return (
    <FilterStyle>
      <p>{intl.get('general.minBurnt')} &nbsp;</p>
      <Input.Group>
        <Button
          className="down-value"
          icon={<MinusOutlined />}
          onClick={() => handleUpDownBtn(false)}
          disabled={valueForType === 0}
        />
        <Input disabled value={valueForType} />
        <Button className="up-value" icon={<PlusOutlined />} onClick={() => handleUpDownBtn(true)} />
      </Input.Group>
    </FilterStyle>
  );
};
