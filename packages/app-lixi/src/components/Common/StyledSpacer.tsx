import styled from 'styled-components';

export const StyledSpacer = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${props => props.theme.wallet.borders.color};
  margin: 60px 0 50px;
`;
