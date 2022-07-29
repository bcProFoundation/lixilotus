import { Select } from 'antd';
import intl from 'react-intl-universal';

const { Option } = Select;

export interface CountrySelectDropdownProps {
  countries: { id: string; name: string }[];
  defaultValue: string;
  handleChangeCountry: Function;
}

const CountrySelectDropdown = (props: CountrySelectDropdownProps) => {
  const { countries, defaultValue, handleChangeCountry } = props;

  return (
    <Select
      className="select-after"
      style={{
        width: '100%',
        alignItems: 'center'
      }}
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
    </Select>
  );
};

export default CountrySelectDropdown;
