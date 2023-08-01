import { Button, Input } from 'antd';
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
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import 'animate.css';
import { SliderMarks } from 'antd/es/slider';

const FilterStyle = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
  p {
    margin: 0;
    font-weight: 500;
  }

  .ant-input-group {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;

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
      width: 70px;
      color: #000;
      cursor: pointer;
      border: 0px;
      background: rgba(0, 0, 0, 0);
      padding: 0;
      text-align: center;
    }
  }
`;

const FilterContainer = styled.div``;

type FilterBurntProps = {
  filterForType: FilterType;
};

export const FilterBurnt = (props: FilterBurntProps) => {
  const dispatch = useAppDispatch();
  const { filterForType } = props;

  let valueForType;
  if (filterForType == FilterType.PostsHome) {
    valueForType = useAppSelector(getFilterPostsHome) ?? 10;
  } else if (filterForType == FilterType.PostsPage) {
    valueForType = useAppSelector(getFilterPostsPage) ?? 0;
  } else if (filterForType == FilterType.PostsToken) {
    valueForType = useAppSelector(getFilterPostsToken) ?? 1;
  } else {
    valueForType = useAppSelector(getFilterPostsProfile) ?? 1;
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
    <>
      <FilterContainer>
        <FilterStyle>
          <p>{intl.get('general.level')}: </p>
          <Input.Group>
            <Button
              className="down-value"
              icon={<MinusOutlined />}
              onClick={() => handleUpDownBtn(false)}
              disabled={valueForType === 0}
            />
            <Input disabled value={valueForType + intl.get('general.dana')} />
            <Button
              className="up-value"
              icon={<PlusOutlined />}
              onClick={() => handleUpDownBtn(true)}
              disabled={valueForType === 1000}
            />
          </Input.Group>
        </FilterStyle>
      </FilterContainer>
    </>
  );
};
