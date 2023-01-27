import { Select } from 'antd';
import intl from 'react-intl-universal';
import styled from 'styled-components';

const { Option } = Select;

const CategorySelect = styled(Select)`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px 12px;
  gap: 16px;
  width: 100%
  height: 46px;
  background: #FFFFFF;
  border: 1px solid var(--border-color-base);
  border-radius: 8px;
  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 0;

  .ant-select-selector {
    border: none !important;
    padding: 0px !important;
  }

  .ant-select-selection-item {
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 24px;
    display: flex;
    align-items: center;
    letter-spacing: 0.5px;
    color: #1E1A1D;
    flex: none;
    order: 2;
    flex-grow: 1;
  }
`;

export interface CategorySelectDropdownProps {
  categories: { id: string }[];
  defaultValue: string;
  handleChangeCategory: Function;
}

const CategorySelectDropdown = (props: CategorySelectDropdownProps) => {
  const { categories, defaultValue, handleChangeCategory } = props;

  return (
    <CategorySelect
      className="select-after edit-page"
      defaultValue={defaultValue}
      onSelect={(value, event) => handleChangeCategory(value, event)}
    >
      {categories.map(category => {
        return (
          <Option
            key={category.id}
            value={category.id}
            style={{
              alignItems: 'center'
            }}
          >
            {intl.formatMessage({
              id: `category.${category.id}`
            })}
          </Option>
        );
      })}
    </CategorySelect>
  );
};

export default CategorySelectDropdown;
