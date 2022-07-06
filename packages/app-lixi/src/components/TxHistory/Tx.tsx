import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { LinkOutlined } from '@ant-design/icons';
import { currency } from '@components/Common/Ticker';
import { formatBalance } from '@utils/cashMethods';
import { ThemedLockFilledGrey } from '@components/Common/CustomIcons';
import { Button } from 'antd';
import { FormattedTxAddress } from '@components/Common/FormattedWalletAddress';

import CSS from 'csstype';

const DateType = styled.div`
  color: ${props => props.theme.greyDark} !important;
  @media screen and (max-width: 500px) {
    font-size: 0.8em;
  }
`;
const OpReturnType = styled.div`
  overflow-wrap: break-word !important;
`;
const SentLabel = styled.span`
  font-weight: bold;
  color: ${props => props.theme.greyDark} !important;
`;
const ReceivedLabel = styled.span`
  font-weight: bold;
  color: ${props => props.theme.primary} !important;
`;
const LotusChatMessageLabel = styled.span`
  text-align: left;
  color: ${props => props.theme.greyLight} !important;
  white-space: nowrap;
`;
const EncryptionMessageLabel = styled.span`
  text-align: left;
  color: ${props => props.theme.greyLight} !important;
  white-space: nowrap;
`;
const MessageLabel = styled.span`
  text-align: left;
  color: ${props => props.theme.secondary} !important;
  white-space: nowrap;
`;
const TxInfo = styled.div<TxWrapperProps>`
  padding: 12px;
  font-size: 1rem;
  text-align: right;

  color: ${props => (props.outgoing ? props.theme.greyDark : props.theme.primary)};

  @media screen and (max-width: 500px) {
    font-size: 0.8rem;
  }
`;

type TxWrapperProps = {
  outgoing?: Boolean;
};

const TxWrapper = styled.div<TxWrapperProps>`
  display: grid;
  grid-template-columns: 50% 50%;
  grid-template-rows: auto;
  grid-gap: 10px;
  padding: 20px;

  grid-template-areas:
    'header-main header-side'
    'main main';

  border-radius: 3px;
  background: ${props => props.theme.tokenListItem.background};
  margin-bottom: 3px;
  box-shadow: ${props => props.theme.tokenListItem.boxShadow};
  border: 1px solid ${props => props.theme.tokenListItem.border};
  color: ${props => (props.outgoing ? props.theme.grey : props.theme.primary)} !important;
  text-align: left;

  :hover {
    border-color: ${props => props.theme.primary};
  }
  @media screen and (max-width: 500px) {
    // grid-template-columns: 24px 30% 50%;
    // padding: 12px 12px;
  }

  .label {
    grid-area: header-main;
  }
  .date {
    grid-area: header-main;
  }
  .amount {
    grid-area: header-side;
  }
  .msg {
    grid-area: main;
  }
`;

const ReplyButton = styled(Button)`
  color: ${props => props.theme.grey} !important;
`;

const Tx = ({ data }) => {
  const txDate =
    typeof data.blocktime === 'undefined'
      ? new Date().toLocaleDateString()
      : new Date(data.blocktime * 1000).toLocaleDateString();
  // if data only includes height and txid, then the tx could not be parsed by cashtab
  // render as such but keep link to block explorer
  let unparsedTx = false;
  if (!Object.keys(data).includes('outgoingTx')) {
    unparsedTx = true;
  }
  const divStyle: CSS.Properties = {
    position: 'relative'
  };
  return (
    <div
      css={`
        position: relative;
      `}
    >
      {/* Link to the Explorer */}
      <a
        href={`https://explorer.givelotus.org/tx/${data.txid}`}
        target="_blank"
        rel="noreferrer"
        css={`
          position: absolute;
          top: 5px;
          right: 5px;
        `}
      >
        <LinkOutlined
          css={`
            color: ${props => props.theme.greyLight} !important;
            :hover {
              color: ${props => props.theme.primary} !important;
            }
          `}
        />
      </a>
      {unparsedTx ? (
        <TxWrapper className="container">
          <DateType>
            <ReceivedLabel>Unparsed</ReceivedLabel>
            <br />
            {txDate}
          </DateType>
          <TxInfo>Open in Explorer</TxInfo>
        </TxWrapper>
      ) : (
        <TxWrapper outgoing={data.outgoingTx}>
          <div className="label">
            {data.outgoingTx ? (
              <SentLabel>
                Sent to: {data.destinationAddress && <FormattedTxAddress address={data.destinationAddress.slice(-8)} />}
              </SentLabel>
            ) : (
              <ReceivedLabel>
                From: {data.fromAddress && <FormattedTxAddress address={data.fromAddress.slice(-8)} />}
              </ReceivedLabel>
            )}
            <DateType>{txDate}</DateType>
          </div>
          <div className="amount">
            <TxInfo outgoing={data.outgoingTx} className="amount">
              {data.outgoingTx ? (
                <>
                  - {formatBalance(data.amountSent)}
                  &nbsp;
                  {currency.ticker}
                  <br />
                </>
              ) : (
                <>
                  + {formatBalance(data.amountReceived)}
                  &nbsp;
                  {currency.ticker}
                  <br />
                </>
              )}
            </TxInfo>
          </div>
          <div className="msg">
            <OpReturnType>
              <div>{data.opReturnMessage}</div>
              <div
                css={`
                  display: flex;
                  justify-content: space-between;
                `}
              >
                {data.isLotusChatMessage ? (
                  data.isEncryptedMessage ? (
                    <EncryptionMessageLabel>
                      <ThemedLockFilledGrey />
                    </EncryptionMessageLabel>
                  ) : (
                    <LotusChatMessageLabel></LotusChatMessageLabel>
                  )
                ) : data.opReturnMessage ? (
                  <MessageLabel>External Message</MessageLabel>
                ) : (
                  <div></div>
                )}
                {!data.outgoingTx && data.fromAddress ? (
                  <Link
                    to={{
                      pathname: `/send`,
                    }}
                  >
                    <ReplyButton size="small" type="text">
                      Reply
                    </ReplyButton>
                  </Link>
                ) : (
                  ''
                )}
              </div>
            </OpReturnType>
          </div>
        </TxWrapper>
      )}
    </div>
  );
};

export default Tx;
