import { Button, Dropdown, Input, MenuProps, Skeleton } from 'antd';
import React, { useEffect, useState } from 'react';
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
import { SendOutlined, SettingOutlined } from '@ant-design/icons';
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

type PageMessageSessionItem = PageMessageSessionQuery['pageMessageSession'];
const SITE_KEY = '6Lc1rGwdAAAAABrD2AxMVIj4p_7ZlFKdE5xCFOrb';

const { TextArea } = Input;

const StyledContainer = styled.div`
  display: flex;
  width: 100%;
`;

const StyledSideContainer = styled.div`
  display: flex;
  border-right: 1px solid black;
  flex-direction: column;
  width: 20%;
`;

const StyledAccountContainer = styled.div`
  display: flex;
  flex-direction: column;

  .sub-account {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-item-light);
    padding: 1rem 1rem 0;
    .sub-account-info {
      text-align: left;
      .name {
        font-size: 14px;
        line-height: 24px;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }
      .address {
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.25px;
        color: rgba(30, 26, 29, 0.38);
        margin-bottom: 0;
      }
    }
  }
`;

const StyledPageContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledChatContainer = styled.div`
  display: flex;
  width: 80%;
  flex-direction: column;
`;

const StyledChatbox = styled.div`
  width: 100%;
  padding: 5px;
  overflow: auto;
  display: flex;
  flex-direction: column-reverse;
  height: 500px;
`;

const InputContainer = styled.div`
  display: flex;
`;

const IconContainer = styled.div`
  display: flex;
  width: 5%;
  border: 1px solid black;
  justify-content: center;
  border-radius: 0px 5px 5px 0px;
`;

const StyledInfiniteScroll = styled(InfiniteScroll)`
  display: flex;
  flex-direction: column-reverse;
`;

const StyledHeader = styled.div`
  border-bottom: 1px solid black;
`;

const LixiContainer = styled.div`
  display: flex;
  width: 100%;
  padding: 5px;
  border: 1px solid black;
  border-radius: var(--border-radius-primary);
  justify-content: center;
`;

const StyledTextHeader = styled.p`
  margin: 0px;
  width: 95%;
`;

const PageMessage = () => {
  const selectedAccount = useAppSelector(getSelectedAccount);
  const dispatch = useAppDispatch();
  const [currentPageMessageSessionId, setCurrentPageMessageSessionId] = useState<string | null>(null);
  const [isPageOwner, setIsPageOwner] = useState<boolean>(false);
  const currentPageMessageSession = useAppSelector(getCurrentPageMessageSession);
  const { control, getValues, resetField, setFocus } = useForm();
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

  return (
    <StyledContainer>
      <StyledSideContainer>
        <StyledAccountContainer>
          <h1>Account</h1>
          <div className="sub-account">
            <div className="sub-account-info">
              <p className="name">{selectedAccount?.name}</p>
              <p className="address">{selectedAccount?.address.slice(-10)}</p>
            </div>
          </div>
        </StyledAccountContainer>
        <h1>Page Message Session</h1>
        {data.length > 0 && (
          <InfiniteScroll
            dataLength={data.length}
            next={loadMoreItems}
            hasMore={hasNext}
            loader={<Skeleton avatar active />}
            scrollableTarget="scrollableChatlist"
          >
            {data.map(session => {
              return (
                <div key={session.id} style={{ border: '1px solid black' }}>
                  <div style={{ display: 'flex', gap: '5px' }} onClick={() => onClickMessage(session, session.id)}>
                    {session.page.pageAccount.address === selectedAccount.address ? (
                      <p>{session.account.name}</p>
                    ) : (
                      <p>{session.page.name}</p>
                    )}
                    <i>as</i>
                    {session.page.pageAccount.address === selectedAccount.address ? (
                      <p>{session.page.name}</p>
                    ) : (
                      <p>Admin</p>
                    )}
                  </div>
                  <p>{session.latestMessage}</p>
                </div>
              );
            })}
          </InfiniteScroll>
        )}
      </StyledSideContainer>

      <StyledChatContainer>
        <StyledTextHeader>{currentPageMessageSessionId && `Session: ${currentPageMessageSessionId}`}</StyledTextHeader>
        {currentPageMessageSessionId && isPageOwner && (
          <StyledHeader>
            <Dropdown menu={{ items }} trigger={['click']}>
              <SettingOutlined />
            </Dropdown>
          </StyledHeader>
        )}
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
                  return <Message message={item} key={item.id} authorAddress={selectedAccount.address} />;
                })}
              </StyledInfiniteScroll>
            )
          ) : (
            <LixiContainer>
              {isPageOwner ? (
                <p>{`${currentPageMessageSession?.account.name} want to give you ${currentPageMessageSession?.lixi.amount} XPI for messaging`}</p>
              ) : (
                <p>{`Waiting for ${currentPageMessageSession?.page?.name} to accept your lixi. Patience is a Virtue!`}</p>
              )}
            </LixiContainer>
          )}
        </StyledChatbox>
        {currentPageMessageSession && (
          <InputContainer>
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
                  style={{ width: '95%' }}
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  placeholder={
                    currentPageMessageSession.status === PageMessageSessionStatus.Open ? 'Aa' : 'Session is closed'
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
              <SendOutlined
                onClick={sendMessage}
                disabled={isLoadingCreateMessage || currentPageMessageSession.status !== PageMessageSessionStatus.Open}
              />
            </IconContainer>
          </InputContainer>
        )}
      </StyledChatContainer>
    </StyledContainer>
  );
};

export default PageMessage;
