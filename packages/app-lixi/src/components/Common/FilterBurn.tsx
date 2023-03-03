import { Select } from 'antd';
import { useEffect, useState } from 'react';
import { FilterType } from '@bcpros/lixi-models/lib/filter';
import { useAppDispatch } from '@store/hooks';
import { saveFilterBurn } from '@store/settings/actions';

const { Option } = Select;
type FilterBurntProps = {
  filterForType: FilterType;
};

export const FilterBurnt = (props: FilterBurntProps) => {
  const { filterForType } = props;

  const dispatch = useAppDispatch()
  const [filterValue, setFilterValue] = useState<number>(0);

  const filterValueArr = [0, 1, 10, 100];
  const handleChange = (value) => {
    setFilterValue(value);
    const filterData = {
      filterForType: filterForType,
      filterValue: value
    }
    dispatch(saveFilterBurn(filterData))
  }

  return (
    <div style={{ display: 'flex', alignItems: 'baseline', alignSelf: 'center' }}>
      <p>Min XPI burnt &nbsp;</p>
      <Select
        defaultValue="0"
        onChange={handleChange}
      >
        {
          filterValueArr.map(item => <Option value={item}>{item}</Option>)
        }
      </Select>
    </div>
  );
};
