import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const AddressHighlightTrim = styled.span`
    font-size: 14px;
    font-weight: bold;

    @media (max-width: 768px) {
        font-size: 12px;
    }
    @media (max-width: 340px) {
        font-size: 10px;
    }
`;

const FormattedWalletAddress = ({address}) => {
    const prefixLength = 11;
    const trimLength = 8;

    return (
        <>
            {address.slice(0,prefixLength)}
            <AddressHighlightTrim>
                {address.slice(prefixLength, prefixLength + trimLength)}
            </AddressHighlightTrim>
            {address.slice(prefixLength+trimLength, -trimLength)}
            <AddressHighlightTrim>
                {address.slice(-trimLength)}
            </AddressHighlightTrim>
        </>
    );
};

FormattedWalletAddress.propTypes = {
    address: PropTypes.string
};

export const FormattedTxAddress = ({address}) => {
    return (
        <>
            <span style={{ fontWeight: 'normal' }}>
                {address.slice(0,-4)}
            </span>
            <span style={{ fontWeight: 'bold'}}>
                {address.slice(-4)}
            </span>
        </>
    )
}

FormattedTxAddress.propTypes = {
    address: PropTypes.string
}

export default FormattedWalletAddress;
