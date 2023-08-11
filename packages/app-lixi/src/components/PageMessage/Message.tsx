import React, { useState } from 'react';
import { MessageQuery } from '@store/message/message.generated';
import styled from 'styled-components';
import { transformCreatedAt } from '@containers/Sidebar/SideBarShortcut';

type MessageItem = {
  message: MessageQuery['message']; //MessageItem
  authorAddress: string; //Need address here to check own message
  senderAvatar?: string;
  receiverAvatar?: string;
};

const StyledMessageContainer = styled.div`
  display: flex;
  flex-direction: row;
  .message-txt {
    cursor: default;
    width: fit-content;
    min-width: 10%;
    max-width: 50%;
    padding: 8px 12px;
    border-radius: 12px;
    margin-bottom: 0.5rem;
    word-wrap: break-word;
    white-space-collapse: preserve;
    text-align: left;
    background: #f1f1f1;
    color: #000;
  }
  &.author-address {
    flex-direction: row-reverse;
    p {
      background: #615ef0 !important;
      color: #fff;
    }
  }
  .date-message {
    font-size: 10px;
    background: #fff !important;
    color: gray !important;
    align-self: center;
    margin: 0;
  }
`;

const Message = ({ message, authorAddress, senderAvatar, receiverAvatar }: MessageItem) => {
  const [isShowDate, setIsShowDate] = useState(false);

  return (
    <React.Fragment>
      <StyledMessageContainer className={message.author.address === authorAddress ? 'author-address' : ''}>
        <p className="message-txt" onClick={() => setIsShowDate(!isShowDate)}>
          {message.body}
        </p>
        {isShowDate && <p className="date-message">{transformCreatedAt(message.createdAt)}</p>}
      </StyledMessageContainer>
    </React.Fragment>
  );
};

export default Message;
