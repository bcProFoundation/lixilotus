import { Select } from 'antd';
import intl from 'react-intl-universal';
import styled from 'styled-components';

const { Option } = Select;

const CountrySelect = styled(Select)`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px 12px;
  gap: 16px;
  width: 100%
  height: 56px;
  background: #FFFFFF;
  border: 1px solid #80747C;
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
    font-size: 16px;
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

export interface CountrySelectDropdownProps {
  countries: { id: string; name: string }[];
  defaultValue: string;
  handleChangeCountry: Function;
}

const CountrySelectDropdown = (props: CountrySelectDropdownProps) => {
  const { countries, defaultValue, handleChangeCountry } = props;

  return (
    <CountrySelect
      className="select-after"
      defaultValue={defaultValue}
      onSelect={(value, event) => handleChangeCountry(value, event)}
    >
      {countries.map(country => {
        return (
          <Option
            key={country.id}
            value={country.id}
            style={{
              alignItems: 'center'
            }}
          >
            {intl.formatMessage({
              id: `country.${country.id}`
            })}
          </Option>
        );
      })}
    </CountrySelect>
  );
};

export default CountrySelectDropdown;
