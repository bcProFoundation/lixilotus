import React, { useState } from 'react';
import { MessageQuery } from '@store/message/message.generated';
import styled from 'styled-components';
import { transformCreatedAt } from '@containers/Sidebar/SideBarShortcut';
import reactStringReplace from 'react-string-replace';

type MessageItem = {
  previousMessage?: boolean; //MessageItem
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
    max-width: 80%;
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
    margin: 4px;
    background: #fff !important;
    color: gray !important;
    align-self: center;
  }
`;

const Message = ({ previousMessage, message, authorAddress, senderAvatar, receiverAvatar }: MessageItem) => {
  const [isShowDate, setIsShowDate] = useState(false);

  const transformMessage = (message: string) => {
    let replacedText;

    // match any url
    replacedText = reactStringReplace(message, /(https?:\/\/\S+)/g, (match, i) => (
      <a key={match + i} href={match} style={{ color: 'white', textDecoration: 'underline' }}>
        {match}
      </a>
    ));

    //match any /give command
    replacedText = reactStringReplace(replacedText, /\/give (\d+)/g, (match, i) => <u key={i}>/give {match}</u>);

    return replacedText;
  };

  const senderHasAvatar = (senderAvatar: string) => {
    if (senderAvatar) return senderAvatar;
    return '';
  };

  const receiverHasAvatar = (receiverAvatar: string) => {
    if (receiverAvatar) return receiverAvatar;
    return '';
  };

  return (
    <React.Fragment>
      <StyledMessageContainer className={message.author.address === authorAddress ? 'author-address' : ''}>
        {!previousMessage && (
          <picture>
            <img
              alt="avatar"
              src={
                message.author.address === authorAddress
                  ? senderHasAvatar(senderAvatar)
                  : receiverHasAvatar(receiverAvatar)
              }
              style={{ width: 20 }}
            />
          </picture>
        )}
        <p className="message-txt" onClick={() => setIsShowDate(!isShowDate)}>
          {transformMessage(message.body)}
        </p>
        {isShowDate && <p className="date-message">{transformCreatedAt(message.createdAt)}</p>}
      </StyledMessageContainer>
    </React.Fragment>
  );
};

export default Message;
