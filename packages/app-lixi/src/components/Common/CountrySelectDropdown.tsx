import { Country } from "@bcpros/lixi-models/src/lib/country";
import { Select } from "antd";

const { Option } = Select;

export interface CountrySelectDropdownProps {
  countries: Country[];
  defaultValue: string;
  handleChangeCountry: Function;
}

const CountrySelectDropdown = (props: CountrySelectDropdownProps) => {

  const {countries, defaultValue, handleChangeCountry} = props;
  
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
            {country.name}
          </Option>
        );
          
      })}
          
      </Select>
    );
  }

  export default CountrySelectDropdown;