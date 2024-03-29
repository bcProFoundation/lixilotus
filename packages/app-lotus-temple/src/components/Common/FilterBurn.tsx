import { Select } from 'antd';
import { useEffect, useState } from 'react';
import { FilterType } from '@bcpros/lixi-models/lib/filter';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { saveBurnFilter } from '@store/settings/actions';
import styled from 'styled-components';
import intl from 'react-intl-universal';
import { getFilterPostsHome, getFilterPostsPage, getFilterPostsToken } from '@store/settings/selectors';

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
  }
`;

const SelectStyle = styled(Select)`
  width: 74px;
  border-radius: 12px;
  cursor: pointer;
  :hover {
    border: 2px #9e2a9c;
    padding: 0;
  }
`;

const { Option } = Select;
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

  const filterValueArr = [0, 1, 10, 100];
  const handleChange = value => {
    const filteredData = {
      filterForType: filterForType,
      filterValue: value
    };
    dispatch(saveBurnFilter(filteredData));
  };

  return (
    <FilterStyle>
      <p>{intl.get('general.minBurnt')} &nbsp;</p>
      <SelectStyle defaultValue={valueForType ?? filterValueArr[1].toString()} onChange={handleChange}>
        {filterValueArr.map(item => (
          <Option value={item}>{item}</Option>
        ))}
      </SelectStyle>
    </FilterStyle>
  );
};
