import { Button, Input, Skeleton, Space, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getSelectedAccount, getSelectedAccountId } from '@store/account';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { PageItem } from '@components/Pages/PageDetail';
import { useInfiniteMessageByPageMessageSessionId } from '@store/message/useInfiniteMessageByPageMessageSessionId';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  useCreatePageMessageSessionMutation,
  useUserHadMessageToPageQuery
} from '@store/message/pageMessageSession.api';
import { Account } from '@bcpros/lixi-models';
import _ from 'lodash';
import {
  CreateMessageInput,
  CreatePageMessageInput,
  MessageOrderField,
  OrderDirection,
  PageMessageSessionStatus
} from '@generated/types.generated';
import { userSubcribeToPageMessageSession } from '@store/message/actions';
import { useCreateMessageMutation } from '@store/message/message.api';
import { useForm, Controller } from 'react-hook-form';
import Message from './Message';
import { SendOutlined } from '@ant-design/icons';
import { useInfinitePendingPageMessageSessionByAccountId } from '@store/message/useInfinitePendingPageMessageSessionByAccountId';
import { useInfiniteOpenPageMessageSessionByAccountId } from '@store/message/useInfiniteOpenPageMessageSessionByAccountId';
import { getCurrentPageMessageSession } from '@store/page/selectors';
import { setPageMessageSession } from '@store/page/action';
import { PageMessageSessionQuery } from '@store/message/pageMessageSession.generated';

const { TextArea } = Input;

type PageMessageProps = {
  page?: PageItem;
  account: Account;
};

type PageMessageSessionItem = PageMessageSessionQuery['pageMessageSession'];

const StyledChatContainer = styled.div`
  background-color: white;
  height: 600px;
  border-radius: var(--border-radius-primary);
  display: flex;
`;

const StyledChatList = styled.div`
  width: 30%;
  border-right: 1px solid black;
  overflow: auto;
`;

const StyledContainer = styled.div`
  display: flex;
  width: 70%;
  flex-direction: column;
`;

const StyledChatbox = styled.div`
  width: 100%;
  padding: 5px;
  overflow: auto;
  display: flex;
  flex-direction: column-reverse;
  height: 100%;
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

const PageMessageForUser = ({ page, account }: PageMessageProps) => {
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const { control, getValues, resetField, setFocus } = useForm();
  const [currentPageMessageSessionId, setCurrentPageMessageSessionId] = useState<string | null>(null);
  const currentPageMessageSession = useAppSelector(getCurrentPageMessageSession);

  // const { data: pageMessageSessionData, refetch: pageMessageSessionRefetch } = useUserHadMessageToPageQuery({
  //   accountId: selectedAccount.id,
  //   pageId: page.id
  // });

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

  const [
    createPageMessageSessionTrigger,
    {
      isLoading: isLoadingCreatePageMessageSession,
      isSuccess: isSuccessCreatePageMessageSession,
      isError: isErrorCreatePageMessageSession
    }
  ] = useCreatePageMessageSessionMutation();

  const [
    createMessageTrigger,
    { isLoading: isLoadingCreateMessage, isSuccess: isSuccessCreateMessage, isError: isErrorCreateMessage }
  ] = useCreateMessageMutation();

  const loadMoreMessages = () => {
    if (messageHasNext && !messageIsFetching) {
      messageFetchNext();
    } else if (messageHasNext) {
      messageFetchNext();
    }
  };

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext, refetch } =
    useInfiniteOpenPageMessageSessionByAccountId(
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

  const {
    data: pendingData,
    totalCount: pendingTotalCount,
    fetchNext: pendingFetchNext,
    hasNext: pendingHasNext,
    isFetching: pendingIsFetching,
    isFetchingNext: pendingIsFetchingNext,
    refetch: pendingRefetch
  } = useInfinitePendingPageMessageSessionByAccountId(
    {
      first: 10,
      id: selectedAccount.id
    },
    false
  );

  const loadMorePendingItems = () => {
    if (pendingHasNext && !pendingIsFetching) {
      pendingFetchNext();
    } else if (pendingHasNext) {
      pendingFetchNext();
    }
  };

  const onClickMessage = (pageMessageSession: PageMessageSessionItem, pageMessageSessionId: string) => {
    dispatch(setPageMessageSession(pageMessageSession));
    setCurrentPageMessageSessionId(pageMessageSessionId);
  };

  // useEffect(() => {
  //   if (pageMessageSessionData?.userHadMessageToPage?.id) {
  //     const id = pageMessageSessionData?.userHadMessageToPage?.id;
  //     dispatch(userSubcribeToPageMessageSession(id));
  //   }
  // }, [pageMessageSessionData]);

  useEffect(() => {
    if (data.length > 0) {
      console.log('🚀 ~ file: PageMessageForUser.tsx:203 ~ useEffect ~ data:', data);
      data.map(item => {
        dispatch(userSubcribeToPageMessageSession(item.id));
      });
    }
  }, [data]);

  useEffect(() => {
    if (pendingData.length > 0) {
      pendingData.map(item => {
        dispatch(userSubcribeToPageMessageSession(item.id));
      });
    }
  }, [pendingData]);

  const sendMessage = async () => {
    if (_.isNil(getValues('message')) || getValues('message') === '') {
      return;
    }
    const input: CreateMessageInput = {
      authorId: account.id,
      body: getValues('message'),
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

  useEffect(() => {
    resetField('message');
    setFocus('message');
  }, [currentPageMessageSessionId]);

  return (
    <StyledChatContainer>
      <StyledChatList id="scrollableChatlist">
        <Tabs>
          <Tabs.TabPane tab="Open" key="open">
            {data.length > 0 && (
              <InfiniteScroll
                dataLength={data.length}
                next={loadMoreItems}
                hasMore={hasNext}
                loader={<Skeleton avatar active />}
                scrollableTarget="scrollableChatlist"
              >
                {data.map(item => {
                  return (
                    <p onClick={() => onClickMessage(item, item.id)} style={{ cursor: 'pointer' }} key={item.id}>
                      {item.page.name}
                    </p>
                  );
                })}
              </InfiniteScroll>
            )}
          </Tabs.TabPane>
          <Tabs.TabPane tab="Pending" key="pending">
            {pendingData.length > 0 && (
              <InfiniteScroll
                dataLength={pendingData.length}
                next={loadMorePendingItems}
                hasMore={pendingHasNext}
                loader={<Skeleton avatar active />}
                scrollableTarget="scrollableChatlist"
              >
                {pendingData.map(item => {
                  return (
                    <p onClick={() => onClickMessage(item, item.id)} style={{ cursor: 'pointer' }} key={item.id}>
                      {item.page.name}
                    </p>
                  );
                })}
              </InfiniteScroll>
            )}
          </Tabs.TabPane>
        </Tabs>
      </StyledChatList>
      <StyledContainer>
        {currentPageMessageSessionId && <StyledHeader>{`Session: ${currentPageMessageSessionId}`}</StyledHeader>}
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
                endMessage={<p>{`${currentPageMessageSession?.page.name} accepted your lixi`}</p>}
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
              <p>{`Waiting for ${currentPageMessageSession?.page?.name} to accept your lixi. Patience is a Virtue!`}</p>
            </LixiContainer>
          )}
        </StyledChatbox>
        {currentPageMessageSession && (
          <InputContainer>
            <Controller
              name="message"
              control={control}
              rules={{
                required: true
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
      </StyledContainer>
    </StyledChatContainer>
  );
};

export default PageMessageForUser;
