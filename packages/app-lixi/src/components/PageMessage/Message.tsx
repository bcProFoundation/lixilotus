import React, { useState } from 'react';
import { MessageQuery } from '@store/message/message.generated';
import styled from 'styled-components';
import { transformCreatedAt } from '@containers/Sidebar/SideBarShortcut';
import reactStringReplace from 'react-string-replace';
import { Avatar, Spin } from 'antd';
import { transformShortName } from '@components/Common/AvatarUser';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { LoadingIcon } from '@components/Layout/MainLayout';

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
    padding: 8px 12px;
    border-radius: 12px;
    line-height: 18px;
    margin-bottom: 0;
    word-wrap: break-word;
    white-space-collapse: preserve;
    text-align: left;
    background: #f1f1f1;
    color: #000;
    word-break: break-all;
  }
  .avatar-user {
    width: 35px;
    height: 35px;
    img {
      width: 35px;
      height: 35px;
      border-radius: 50%;
    }
    margin-left: 0;
    margin-right: 8px;
  }
  .date-message {
    font-size: 10px;
    margin: 4px;
    background: #fff !important;
    color: gray !important;
    align-self: center;
  }
  .content-message {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    max-width: 80%;
    margin: 2px 0;
    .message-attachments {
      text-align: left;
      img {
        width: auto;
        height: auto;
        max-width: 90%;
        max-height: 30vh;
        border-radius: 8px;
        object-fit: cover;
      }
    }
  }
  &.author-address {
    flex-direction: row-reverse;
    .content-message {
      align-items: flex-end;
    }
    p {
      background: #615ef0 !important;
      color: #fff;
    }
    .avatar-user {
      margin-right: 0;
      margin-left: 8px;
    }
    .message-attachments {
      text-align: right;
    }
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
    return null;
  };

  const receiverHasAvatar = (receiverAvatar: string) => {
    if (receiverAvatar) return receiverAvatar;
    return null;
  };

  return (
    <React.Fragment>
      <StyledMessageContainer className={message.author.address === authorAddress ? 'author-address' : ''}>
        {!previousMessage && (
          <Avatar
            className="avatar-user"
            src={
              message.author.address === authorAddress
                ? senderHasAvatar(senderAvatar)
                : receiverHasAvatar(receiverAvatar)
            }
          >
            {transformShortName(message?.author?.name)}
          </Avatar>
        )}
        {previousMessage && <span className="avatar-user"></span>}
        <div className="content-message">
          {message.body && (
            <p className="message-txt" onClick={() => setIsShowDate(!isShowDate)}>
              {transformMessage(message.body)}
            </p>
          )}
          {isShowDate && <p className="date-message">{transformCreatedAt(message.createdAt)}</p>}
          {message.uploads.length > 0 && (
            <div className="message-attachments">
              <PhotoProvider loop={true} loadingElement={<Spin indicator={LoadingIcon} />}>
                {message.uploads.map((img, index) => (
                  <PhotoView
                    key={index}
                    src={`${process.env.NEXT_PUBLIC_CF_IMAGES_DELIVERY_URL}/${process.env.NEXT_PUBLIC_CF_ACCOUNT_HASH}/${img.upload.cfImageId}/public`}
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_CF_IMAGES_DELIVERY_URL}/${process.env.NEXT_PUBLIC_CF_ACCOUNT_HASH}/${img.upload.cfImageId}/public`}
                      alt=""
                    />
                  </PhotoView>
                ))}
              </PhotoProvider>
            </div>
          )}
        </div>
      </StyledMessageContainer>
    </React.Fragment>
  );
};

export default Message;
