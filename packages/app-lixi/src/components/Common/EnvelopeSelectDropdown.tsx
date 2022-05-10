import { Select } from 'antd';
import intl from 'react-intl-universal';

import { Envelope } from '@bcpros/lixi-models';

const { Option } = Select;

export interface EnvelopeSelectDropdownProps {
  envelopes: Envelope[];
  handleChangeEnvelope: Function;
}

const EnvelopeSelectDropdown = (props: EnvelopeSelectDropdownProps) => {
  const { envelopes, handleChangeEnvelope } = props;

  return (
    <Select
      className="select-after"
      style={{
        width: '100%',
        alignItems: 'center'
      }}
      placeholder={intl.get('claim.pleaseSelectEnvelope')}
      onSelect={(value, event) => handleChangeEnvelope(value, event)}
    >
      {envelopes.map(envelope => {
        return (
          <Option
            key={envelope.id}
            value={envelope.id}
            style={{
              alignItems: 'center'
            }}
          >
            {envelope.name}
          </Option>
        );
      })}
    </Select>
  );
};

export default EnvelopeSelectDropdown;
