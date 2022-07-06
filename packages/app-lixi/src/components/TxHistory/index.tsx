import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Tx from './Tx';

const TxHistoryHeading = styled.h4`
    font-size: 20px;
    margin: 0;
    padding: 15px 0;
    color: ${props => props.theme.footer.navIconInactive};
    @media (max-width: 400px) {
        font-size: 16px;
    }
`;

const TxHistory = ({ txs}) => {
    return (
        <div>
            <TxHistoryHeading>
                Recent Transactions
            </TxHistoryHeading>
            {txs.map(tx => (
                <Tx
                    key={tx.txid}
                    data={tx}
                />
            ))}
        </div>
    );
};

export default TxHistory;
