import { Avatar, Button, Dropdown, Input, MenuProps, Popover, Skeleton } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getAllAccounts, getSelectedAccount } from '@store/account';
import { Account, ClosePageMessageSessionInput, CreateClaimDto } from '@bcpros/lixi-models';
import _ from 'lodash';
import { usePagesByUserIdQuery } from '@store/page/pages.api';
import PageMessageForUser from './PageMessageForUser';
import {
  startChannel,
  stopChannel,
  userSubcribeToAddressChannel,
  userSubcribeToPageMessageSession
} from '@store/message/actions';
import { useInfinitePageMessageSessionByAccountId } from '@store/message/useInfinitePageMessageSessionByAccountId';
import InfiniteScroll from 'react-infinite-scroll-component';
import { getCurrentPageMessageSession } from '@store/page/selectors';
import { setPageMessageSession } from '@store/page/action';
import {
  PageMessageSessionQuery,
  useClosePageMessageSessionMutation,
  useOpenPageMessageSessionMutation
} from '@store/message/pageMessageSession.generated';
import { DownOutlined, LeftOutlined, RightOutlined, SendOutlined, SettingOutlined } from '@ant-design/icons';
import Message from './Message';
import {
  CreateMessageInput,
  MessageOrderField,
  OpenPageMessageSessionInput,
  OrderDirection,
  PageMessageSessionStatus
} from '@generated/types.generated';
import { useInfiniteMessageByPageMessageSessionId } from '@store/message/useInfiniteMessageByPageMessageSessionId';
import { useForm, Controller } from 'react-hook-form';
import { useCreateMessageMutation } from '@store/message/message.generated';
import { postClaim } from '@store/claim/actions';
import { WalletContext } from '@context/walletProvider';
import { useSocket } from '@context/index';
import { SpaceShorcutItem, transformCreatedAt } from '@containers/Sidebar/SideBarShortcut';
import { transformShortName } from '@components/Common/AvatarUser';
import { ReactSVG } from 'react-svg';

type PageMessageSessionItem = PageMessageSessionQuery['pageMessageSession'];
const SITE_KEY = '6Lc1rGwdAAAAABrD2AxMVIj4p_7ZlFKdE5xCFOrb';

const { TextArea } = Input;

const StyledContainer = styled.div`
  display: flex;
  width: 100%;
  margin-top: 1rem;
  background: #fff;
  height: 88vh;
`;

const StyledSideContainer = styled.div`
  width: 25%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color-base);
  .title-chat {
    padding: 1rem 1rem 0 1rem;
    text-align: left;
    margin-bottom: 1rem;
  }
  .groups-page-message {
    .page-info {
      .ant-space {
        border: 0;
        padding: 0.5rem 1rem;
        margin-bottom: 1rem;
        box-shadow: none;
        .avatar-account-page {
          border-radius: 8px;
          img {
            border-radius: 8px;
          }
        }
        .ant-avatar-string {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) !important;
        }
        .collapse-action {
          button {
            padding: 8px 0 8px 8px;
            width: fit-content;
            &:hover {
              background: transparent;
            }
          }
        }
        .content-score {
          padding: 4px;
          &.pending {
            background: var(--dark-error-background);
          }
          &.open {
            background: var(--dark-sucess-background);
          }
          &.close {
            background: var(--color-danger-dark);
          }
        }
        &.ant-space-child {
          margin-bottom: 0;
          padding: 0.5rem 1rem;
          .avatar-account-child {
            border-radius: 50%;
            .user-avatar {
              width: 42px;
              height: 42px;
            }
          }
          &.is-active {
            background: #f1f3f9;
            .page-name {
              color: var(--color-primary);
            }
            .user-avatar {
              border: 1px solid var(--color-primary);
            }
          }
          &:last-child {
            margin-bottom: 0.5rem;
          }
        }
      }
    }
  }
`;

const StyledChatContainer = styled.div`
  width: 75%;
  display: grid;
  grid-template-rows: 10% 80% 10%;
`;

const StyledChatbox = styled.div`
  width: 100%;
  padding: 1rem;
  overflow: auto;
  display: flex;
  flex-direction: column-reverse;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  background: #fff;
  margin: 1rem;
  .ant-input {
    height: 100%;
    &[disabled] {
      background: transparent;
    }
  }
`;

const IconContainer = styled.div`
  width: 5%;
  display: flex;
  justify-content: center;
`;

const StyledInfiniteScroll = styled(InfiniteScroll)`
  display: flex;
  flex-direction: column-reverse;
`;

const LixiContainer = styled.div`
  display: flex;
  justify-content: center;

  .sender-avatar {
    font-size: 40px;
    width: 150px;
    height: 150px;
    margin-bottom: 1rem;
    border: 1px solid var(--color-primary);
    .ant-avatar-string {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%) !important;
    }
  }

  .sender-name {
    font-size: 20px;
    margin-bottom: 4px;
  }

  .sender-created-at {
    font-size: 10px;
    color: gray;
  }

  .sender-message-amount {
    margin-top: 1rem;
  }

  .group-action-session {
    display: flex;
    justify-content: center;
    gap: 8px;
  }
`;

const StyledChatHeader = styled.p`
  width: 100%;
  margin: 0;
  padding: 1rem;
  padding-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color-base);
  .custom-user-info {
    display: flex;
    gap: 8px;
    align-items: center;
    .user-avatar {
      font-size: 16px;
      width: 40px;
      height: 40px;
      border: 1px solid var(--color-primary);
      .ant-avatar-string {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%) !important;
      }
    }
    .user-name {
      margin-bottom: 4px;
      text-align: left;
      font-size: 16px;
      font-weight: 500;
    }
    .user-address {
      text-align: left;
      margin: 0;
      font-size: 10px;
      color: gray;
    }
    button {
      width: fit-content;
      &:hover {
        background: transparent;
      }
    }
  }
  .chat-header-action {
    display: flex;
    align-items: center;
    gap: 8px;
    .status-current-session {
      font-size: 10px;
      font-weight: 600;
      padding: 8px;
      border-radius: 8px;
      background: var(--color-primary);
      color: #fff;
      &.pending {
        background: var(--dark-error-background);
      }
      &.open {
        background: var(--dark-sucess-background);
      }
      &.close {
        background: var(--color-danger-dark);
      }
    }
    .more-action-header {
      cursor: pointer;
      span {
        display: flex;
        align-items: center;
      }
    }
  }
`;

export const PageGroupItem = ({
  messages,
  classStyle,
  currentSessionId,
  isPageOwner,
  onClickIcon
}: {
  messages?: any;
  classStyle?: string;
  isPageOwner?: boolean;
  currentSessionId?: string;
  onClickIcon?: (e: any) => void;
}) => {
  const [collapse, setCollapse] = useState(true);

  return (
    <>
      {messages &&
        messages.map((item, index) => {
          if (index == 0) {
            return (
              <SpaceShorcutItem style={{ marginBottom: collapse ? '0' : '1rem' }} className="card" size={5}>
                {isPageOwner ? (
                  <>
                    <div className="avatar-account avatar-account-page" onClick={() => onClickIcon(item)}>
                      {item?.page && <img src={item?.page?.avatar || '/images/default-avatar.jpg'} />}
                    </div>
                    <div className="content-account">
                      <div className="info-account" onClick={() => onClickIcon(item)}>
                        {item?.page?.name && <p className="page-name">{item?.page?.name}</p>}
                        <p className="account-name">{item?.account?.name}</p>
                        {item?.latestMessage ? (
                          <p className="content">{item?.latestMessage}</p>
                        ) : (
                          <p className="content">Give you {Math.round(item?.lixi?.amount)} XPI for messaging</p>
                        )}
                      </div>
                      <div className="time-score" onClick={() => onClickIcon(item)}>
                        <p className="create-date">Total: {messages.length}</p>
                        <div className="content-score">
                          <p className="lotus-burn-score">{transformCreatedAt(item?.updatedAt)}</p>
                        </div>
                      </div>
                      <div className="collapse-action" onClick={() => setCollapse(!collapse)}>
                        <Button
                          type="primary"
                          className="no-border-btn"
                          icon={!collapse ? <RightOutlined /> : <DownOutlined />}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="avatar-account" onClick={() => onClickIcon(item)}>
                      {item?.page && <img src={item?.page?.avatar || '/images/default-avatar.jpg'} />}
                    </div>
                    <div className="content-account">
                      <div className="info-account" onClick={() => onClickIcon(item)}>
                        {item?.page?.name && <p className="page-name">{item?.page?.name}</p>}
                        {item?.latestMessage ? (
                          <p className="content">{item?.latestMessage}</p>
                        ) : (
                          <p className="content">Give {Math.round(item?.lixi?.amount)} XPI for messaging</p>
                        )}
                      </div>
                      <div className="time-score" onClick={() => onClickIcon(item)}>
                        <p className="create-date">{transformCreatedAt(item?.updatedAt)}</p>
                        <div className={`${item?.status.toLowerCase()} content-score`}>
                          <p className="lotus-burn-score"></p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </SpaceShorcutItem>
            );
          }
        })}
      {collapse &&
        isPageOwner &&
        messages &&
        messages.map(item => {
          return (
            <SpaceShorcutItem
              className={`${currentSessionId === item.id ? 'is-active' : ''} ant-space-child card`}
              onClick={() => onClickIcon(item)}
              size={5}
            >
              <div className="avatar-account-child">
                <Avatar className="user-avatar" src={item?.account?.avatar}>
                  {transformShortName(item?.account?.name)}
                </Avatar>
              </div>
              <div className="content-account">
                <div className="info-account">
                  {item?.page?.name && <p className="page-name">{item?.account?.name}</p>}
                  {item?.latestMessage ? (
                    <p className="content">{item?.latestMessage}</p>
                  ) : (
                    <p className="content">Give you {Math.round(item?.lixi?.amount)} XPI for messaging</p>
                  )}
                </div>
                <div className="time-score">
                  <p className="create-date">{transformCreatedAt(item?.updatedAt)}</p>
                  <div className={`${item?.status.toLowerCase()} content-score`}>
                    <p className="lotus-burn-score"></p>
                  </div>
                </div>
              </div>
            </SpaceShorcutItem>
          );
        })}
    </>
  );
};

const PageMessage = () => {
  const selectedAccount = useAppSelector(getSelectedAccount);
  const dispatch = useAppDispatch();
  const [currentPageMessageSessionId, setCurrentPageMessageSessionId] = useState<string | null>(null);
  const [isPageOwner, setIsPageOwner] = useState<boolean>(false);
  const currentPageMessageSession = useAppSelector(getCurrentPageMessageSession);
  const { control, getValues, resetField, setFocus } = useForm();
  const [open, setOpen] = useState(false);
  const Wallet = React.useContext(WalletContext);
  const { XPI } = Wallet;
  const socket = useSocket();

  const [
    createMessageTrigger,
    { isLoading: isLoadingCreateMessage, isSuccess: isSuccessCreateMessage, isError: isErrorCreateMessage }
  ] = useCreateMessageMutation();

  const [
    closePageMessageSessionTrigger,
    {
      isLoading: isLoadingClosePageMessageSession,
      isSuccess: isSuccessClosePageMessageSession,
      isError: isErrorClosePageMessageSession
    }
  ] = useClosePageMessageSessionMutation();

  const [
    openPageMessageSessionTrigger,
    {
      isLoading: isLoadingOpenPageMessageSession,
      isSuccess: isSuccessOpenPageMessageSession,
      isError: isErrorOpenPageMessageSession
    }
  ] = useOpenPageMessageSessionMutation();

  useEffect(() => {
    const loadScriptByURL = (id: string, url: string, callback: { (): void; (): void }) => {
      const isScriptExist = document.getElementById(id);

      if (!isScriptExist) {
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.id = id;
        script.onload = function () {
          if (callback) callback();
        };
        document.body.appendChild(script);
      }

      if (isScriptExist && callback) callback();
    };

    // load the script by passing the URL
    loadScriptByURL('recaptcha-key', `https://www.google.com/recaptcha/enterprise.js?render=${SITE_KEY}`, function () {
      console.info('Script loaded!');
    });
  }, []);

  const items: MenuProps['items'] = [
    currentPageMessageSession?.status === PageMessageSessionStatus.Pending && {
      key: 'openSession',
      label: (
        <p style={{ margin: '0px' }} onClick={() => openSession()}>
          Open session
        </p>
      )
    },
    (currentPageMessageSession?.status === PageMessageSessionStatus.Pending ||
      currentPageMessageSession?.status === PageMessageSessionStatus.Open) && {
      key: 'closeSession',
      label: (
        <p style={{ margin: '0px' }} onClick={() => closeSession()}>
          Close session
        </p>
      )
    }
  ];

  useEffect(() => {
    if (currentPageMessageSession && currentPageMessageSession.page.pageAccount.address === selectedAccount.address) {
      setIsPageOwner(true);
    }
  }, [currentPageMessageSession]);

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext, refetch } =
    useInfinitePageMessageSessionByAccountId(
      {
        first: 10,
        id: selectedAccount.id
      },
      false
    );

  const loadMoreItems = () => {
    if (hasNext && !isFetching) {
      fetchNext();
    } else if (hasNext) {
      fetchNext();
    }
  };

  // useEffect(() => {
  //   dispatch(startChannel());

  //   return () => {
  //     stopChannel();
  //   };
  // }, []);

  const onClickMessage = (pageMessageSession: PageMessageSessionItem, pageMessageSessionId: string) => {
    dispatch(setPageMessageSession(pageMessageSession));
    setCurrentPageMessageSessionId(pageMessageSessionId);
  };

  const groupPageChat = useMemo(() => {
    let cloneChats = _.cloneDeep(data);
    cloneChats = _.orderBy(cloneChats, ['updatedAt'], ['desc']);
    let groupPageChats = _.values(_.groupBy(cloneChats, 'page.id'));
    if (data.length > 0) {
      dispatch(setPageMessageSession(data[data.length - 1]));
      setCurrentPageMessageSessionId(data[data.length - 1]?.id);
    }
    return groupPageChats;
  }, [data]);

  const {
    data: messageData,
    fetchNext: messageFetchNext,
    hasNext: messageHasNext,
    isFetching: messageIsFetching,
    isFetchingNext: messageIsFetchingNext
  } = useInfiniteMessageByPageMessageSessionId({
    id: currentPageMessageSessionId,
    orderBy: {
      direction: OrderDirection.Desc,
      field: MessageOrderField.UpdatedAt
    }
  });

  const loadMoreMessages = () => {
    if (messageHasNext && !messageIsFetching) {
      messageFetchNext();
    } else if (messageHasNext) {
      messageFetchNext();
    }
  };

  const sendMessage = async () => {
    if (_.isNil(getValues('message')) || getValues('message') === '') {
      return;
    }
    const trimValue = getValues('message').trim();
    const input: CreateMessageInput = {
      authorId: selectedAccount.id,
      body: trimValue,
      pageMessageSessionId: currentPageMessageSessionId,
      isPageOwner: false
    };

    await createMessageTrigger({ input }).unwrap();
    resetField('message');
    setFocus('message');
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent the default behavior of adding a new line
      await sendMessage(); // Call your function to post the comment
    }
  };

  const openSession = async () => {
    let captcha = (window as any).grecaptcha.enterprise;
    // Get the param-free address
    let cleanAddress = selectedAccount.address.split('?')[0];

    const isValidAddress = XPI.Address.isXAddress(cleanAddress);

    if (!isValidAddress) {
      alert('Not valid address');
    }
    if (captcha) {
      await captcha.ready(() => {
        captcha.execute(SITE_KEY, { action: 'submit' }).then(async (token: any) => {
          dispatch(
            postClaim({
              claimAddress: cleanAddress,
              claimCode: currentPageMessageSession.lixiClaimCode,
              captchaToken: token
            } as CreateClaimDto)
          );

          const input: OpenPageMessageSessionInput = {
            pageMessageSessionId: currentPageMessageSessionId
          };
          await openPageMessageSessionTrigger({ input }).unwrap();
        });
      });
    }
  };

  const closeSession = async () => {
    const input: ClosePageMessageSessionInput = {
      pageMessageSessionId: currentPageMessageSessionId
    };
    await closePageMessageSessionTrigger({ input }).unwrap();
  };

  useEffect(() => {
    resetField('message');
    setFocus('message');
  }, [currentPageMessageSessionId]);

  useEffect(() => {
    if (data.length > 0 && socket) {
      data.map(item => {
        dispatch(userSubcribeToPageMessageSession(item.id));
      });
    }
  }, [data, socket]);

  useEffect(() => {
    if (socket) {
      dispatch(userSubcribeToAddressChannel(selectedAccount.address));
    }
  }, [socket]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return (
    <StyledContainer className="card page-message">
      <StyledSideContainer>
        <h2 className="title-chat">Chats</h2>
        <div className="groups-page-message">
          {data.length > 0 && (
            <InfiniteScroll
              dataLength={data.length}
              next={loadMoreItems}
              hasMore={hasNext}
              loader={<Skeleton avatar active />}
              scrollableTarget="scrollableChatlist"
            >
              {groupPageChat &&
                groupPageChat.map((chat, index) => {
                  return (
                    <div className="page-info">
                      <PageGroupItem
                        key={index}
                        messages={chat}
                        isPageOwner={isPageOwner}
                        currentSessionId={currentPageMessageSessionId}
                        onClickIcon={session => onClickMessage(session, session.id)}
                      />
                    </div>
                  );
                })}
            </InfiniteScroll>
          )}
        </div>
      </StyledSideContainer>

      <StyledChatContainer>
        <StyledChatHeader>
          {currentPageMessageSession && isPageOwner && (
            <>
              <div className="custom-user-info">
                <Button type="text" icon={<LeftOutlined />}></Button>
                <Avatar className="user-avatar" src={currentPageMessageSession?.account?.avatar}>
                  {transformShortName(currentPageMessageSession?.account?.name)}
                </Avatar>
                <div className="user">
                  <p className="user-name">{currentPageMessageSession?.account?.name}</p>
                  <p className="user-address">
                    {currentPageMessageSession?.account?.address.slice(0, 8) +
                      '...' +
                      currentPageMessageSession?.account?.address.slice(-6)}
                  </p>
                </div>
              </div>
              <div className="chat-header-action">
                <div className={`${currentPageMessageSession?.status.toLowerCase()} status-current-session`}>
                  {currentPageMessageSession?.status}
                </div>
                <Popover
                  content={
                    <Button
                      style={{ background: 'var(--dark-error-background)', fontSize: '12px' }}
                      type="primary"
                      onClick={closeSession}
                    >
                      Close session
                    </Button>
                  }
                  placement="bottomRight"
                  trigger="click"
                  open={open}
                  onOpenChange={handleOpenChange}
                >
                  <ReactSVG className="more-action-header" wrapper="span" src="/images/ico-more-vertical.svg" />
                </Popover>
              </div>
            </>
          )}
          {currentPageMessageSession && !isPageOwner && (
            <>
              <div className="custom-user-info">
                <Button type="text" icon={<LeftOutlined />}></Button>
                <Avatar className="user-avatar" src={currentPageMessageSession?.page?.avatar}>
                  {transformShortName(currentPageMessageSession?.page?.name)}
                </Avatar>
                <div className="user">
                  <p className="user-name">{currentPageMessageSession?.page?.name}</p>
                  <p className="user-address">
                    {Math.round(parseInt(currentPageMessageSession?.lixi?.amount)) + ' XPI'}
                  </p>
                </div>
              </div>
              <div className="chat-header-action">
                <div className={`${currentPageMessageSession?.status.toLowerCase()} status-current-session`}>
                  {currentPageMessageSession?.status}
                </div>
              </div>
            </>
          )}
        </StyledChatHeader>
        <StyledChatbox
          id="scrollableChatbox"
          style={{
            justifyContent: currentPageMessageSession?.status !== PageMessageSessionStatus.Pending ? 'normal' : 'center'
          }}
        >
          {currentPageMessageSession?.status !== PageMessageSessionStatus.Pending ? (
            messageData.length > 0 && (
              <StyledInfiniteScroll
                dataLength={messageData.length}
                next={loadMoreMessages}
                hasMore={messageHasNext}
                loader={<Skeleton active />}
                endMessage={
                  isPageOwner ? (
                    <p>{`You accepted lixi from ${currentPageMessageSession.account.name}`}</p>
                  ) : (
                    <p>{`${currentPageMessageSession?.page.name} accepted your lixi`}</p>
                  )
                }
                inverse
                scrollableTarget="scrollableChatbox"
              >
                {messageData.map(item => {
                  return (
                    <Message
                      senderAvatar={currentPageMessageSession?.page?.avatar}
                      receiverAvatar={currentPageMessageSession?.account?.avatar}
                      message={item}
                      key={item.id}
                      authorAddress={selectedAccount.address}
                    />
                  );
                })}
              </StyledInfiniteScroll>
            )
          ) : (
            <LixiContainer>
              {isPageOwner ? (
                <div className="sender-message">
                  <Avatar className="sender-avatar" src={currentPageMessageSession?.account?.avatar}>
                    {transformShortName(currentPageMessageSession?.account?.name)}
                  </Avatar>
                  <h4 className="sender-name">{currentPageMessageSession?.account?.name}</h4>
                  <p className="sender-created-at">{transformCreatedAt(currentPageMessageSession?.createdAt)}</p>
                  <p className="sender-message-amount">{`Give you ${currentPageMessageSession?.lixi.amount} XPI for messaging`}</p>
                  <div className="group-action-session">
                    <Button type="primary" className="outline-btn" onClick={openSession}>
                      Accept
                    </Button>
                    <Button type="primary" className="outline-btn" onClick={closeSession}>
                      Deny
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="sender-message">
                  <Avatar className="sender-avatar" src={currentPageMessageSession?.page?.avatar}>
                    {transformShortName(currentPageMessageSession?.page?.name)}
                  </Avatar>
                  <h4 className="sender-name">{currentPageMessageSession?.page?.name}</h4>
                  <p className="sender-created-at">{transformCreatedAt(currentPageMessageSession?.createdAt)}</p>
                  <p className="sender-message-amount">{`Waiting for ${currentPageMessageSession?.page?.name} to accept your lixi. Patience is a Virtue!`}</p>
                </div>
              )}
            </LixiContainer>
          )}
        </StyledChatbox>
        {currentPageMessageSession && (
          <InputContainer className="input-page-message">
            <Controller
              name="message"
              control={control}
              rules={{
                required: true,
                validate: value => {
                  return !!value.trim();
                }
              }}
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <TextArea
                  ref={ref}
                  style={{ width: '95%', border: '0', borderRadius: '12px' }}
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  placeholder={
                    currentPageMessageSession.status === PageMessageSessionStatus.Open
                      ? 'Aa'
                      : currentPageMessageSession.status === PageMessageSessionStatus.Pending
                      ? 'Accept to chat...'
                      : 'Session is close'
                  }
                  disabled={
                    isLoadingCreateMessage || currentPageMessageSession.status !== PageMessageSessionStatus.Open
                  }
                  autoSize
                  onKeyDown={handleKeyDown}
                />
              )}
            />
            <IconContainer>
              <Button
                type="text"
                disabled={isLoadingCreateMessage || currentPageMessageSession.status !== PageMessageSessionStatus.Open}
                icon={<ReactSVG className="anticon" src="/images/ico-send-message.svg" wrapper="span" />}
                onClick={sendMessage}
              />
            </IconContainer>
          </InputContainer>
        )}
      </StyledChatContainer>
    </StyledContainer>
  );
};

export default PageMessage;
