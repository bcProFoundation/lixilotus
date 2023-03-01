import { Select } from 'antd';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

export const FilterBurnt = () => {
  return (
    <div style={{display: 'flex', alignItems: 'baseline'}}>
      <p>Min XPI burnt &nbsp;</p>
      <Select
        defaultValue="0"
        style={{ width: 120 }}
        // onChange={handleChange}
        options={[
          { value: '0', label: '0' },
          { value: '1', label: '1' },
          { value: '10', label: '10' },
          { value: '100', label: '100' }
        ]}
      />
    </div>
  );
};
