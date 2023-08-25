import _ from 'lodash';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { saveLevelFilter } from '@store/settings/actions';
import { getLevelFilter } from '@store/settings/selectors';
import 'animate.css';
import { Button, Input } from 'antd';
import { useEffect } from 'react';
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

  const handleUpDownBtn = (isUp: boolean) => {
    let newLevel = level;
    if (isUp) {
      if (level >= 5) {
        newLevel = 5;
      } else {
        newLevel += 1;
      }
    } else {
      if (newLevel <= 1) {
        newLevel = 1;
      } else {
        newLevel -= 1;
      }
    }

    dispatch(saveLevelFilter(newLevel));
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
              disabled={level === 1}
            />
            <Input disabled value={level} />
            <Button
              className="up-value"
              icon={<PlusOutlined />}
              onClick={() => handleUpDownBtn(true)}
              disabled={level === 5}
            />
          </Input.Group>
        </FilterStyle>
      </FilterContainer>
    </>
  );
};
