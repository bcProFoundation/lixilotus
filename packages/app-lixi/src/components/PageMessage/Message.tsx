import React from 'react';
import { MessageQuery } from '@store/message/message.generated';
import styled from 'styled-components';

type MessageItem = {
  message: MessageQuery['message']; //MessageItem
  authorAddress: string; //Need address here to check own message
};

const StyledMessageContainer = styled.div`
  display: flex;
`;

const StyledChat = styled.p`
  width: fit-content;
  border: 1px solid black;
  margin-bottom: 10px;
  padding: 5px;
  border-radius: var(--border-radius-primary);
  max-width: 50%;
  word-wrap: break-word;
  white-space-collapse: preserve;
  text-align: left;
  min-width: 10%;
`;

const Message = ({ message, authorAddress }: MessageItem) => {
  return (
    <React.Fragment>
      <StyledMessageContainer
        style={{ flexDirection: message.author.address === authorAddress ? 'row-reverse' : 'row' }}
      >
        <StyledChat>{message.body}</StyledChat>
      </StyledMessageContainer>
    </React.Fragment>
  );
};

export default Message;
