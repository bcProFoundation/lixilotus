import _ from 'lodash';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { saveLevelFilter } from '@store/settings/actions';
import { getLevelFilter } from '@store/settings/selectors';
import 'animate.css';
import { Button, Input, Radio, RadioChangeEvent, Space } from 'antd';
import { useEffect, useState } from 'react';
import intl from 'react-intl-universal';
import styled from 'styled-components';

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

export const FilterLevel = () => {
  const dispatch = useAppDispatch();
  const level = useAppSelector(getLevelFilter);

  useEffect(() => {
    if (_.isNil(level) || level <= 0 || level > 5) {
      dispatch(saveLevelFilter(3));
    }
  }, [level]);

  const [value, setValue] = useState(level);

  const onChange = (e: RadioChangeEvent) => {
    dispatch(saveLevelFilter(e.target.value));
  };

  return (
    <>
      <FilterContainer>
        <FilterStyle>
          <Radio.Group onChange={onChange} defaultValue={level}>
            <Space direction="vertical">
              <Radio value={5}>Mostly Following</Radio>
              <Radio value={4}>More Following</Radio>
              <Radio value={3}>Balanced</Radio>
              <Radio value={2}>Less Following</Radio>
              <Radio value={1}>Only top posts</Radio>
            </Space>
          </Radio.Group>
        </FilterStyle>
      </FilterContainer >
    </>
  );
};
