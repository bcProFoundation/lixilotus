import { Avatar, Button, Input, Popover, Skeleton } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getSelectedAccount } from '@store/account';
import { ClosePageMessageSessionInput, CreateClaimDto } from '@bcpros/lixi-models';
import _ from 'lodash';
import { useInfinitePageMessageSessionByAccountId } from '@store/message/useInfinitePageMessageSessionByAccountId';
import InfiniteScroll from 'react-infinite-scroll-component';
import { getCurrentPageMessageSession } from '@store/page/selectors';
import { setPageMessageSession } from '@store/page/action';
import {
  PageMessageSessionQuery,
  useClosePageMessageSessionMutation,
  useOpenPageMessageSessionMutation
} from '@store/message/pageMessageSession.generated';
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
import { SpaceShorcutItem, transformCreatedAt } from '@containers/Sidebar/SideBarShortcut';
import { transformShortName } from '@components/Common/AvatarUser';
import { ReactSVG } from 'react-svg';
import useWindowDimensions from '@hooks/useWindowDimensions';
import { useRouter } from 'next/router';
import intl from 'react-intl-universal';
import { getAllWalletPaths, getSlpBalancesAndUtxos, getWalletStatus } from '@store/wallet';
import { getUtxoWif } from '@utils/cashMethods';
import useXPI from '@hooks/useXPI';
import { currency } from '@components/Common/Ticker';
import { sendXPIFailure, sendXPISuccess } from '@store/send/actions';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { useSwipeable } from 'react-swipeable';

type PageMessageSessionItem = PageMessageSessionQuery['pageMessageSession'];
const SITE_KEY = '6Lc1rGwdAAAAABrD2AxMVIj4p_7ZlFKdE5xCFOrb';

const { TextArea } = Input;

const StyledContainer = styled.div`
  display: flex;
  width: 100%;
  margin-top: 1rem;
  background: #fff;
  height: 88vh;
  @media (max-width: 526px) {
    margin: 0;
    border-radius: 0;
    height: calc(100% - 60px);
    &.detail-chat {
      height: 100%;
    }
  }
`;

const StyledSideContainer = styled.div`
  width: 25%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color-base);
  overflow: auto;
  -ms-overflow-style: none; // Internet Explorer 10+
  scrollbar-width: none; // Firefox
  ::-webkit-scrollbar {
    display: none; // Safari and Chrome
  }
  .title-chat {
    display: flex;
    justify-content: space-between;
    padding: 1rem 1rem 0 1rem;
    text-align: left;
    margin-bottom: 1rem;
    .badge-total-message {
      background: var(--bg-color-light-theme);
      color: var(--color-primary);
      font-size: 12px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 12px;
      line-height: 0;
      display: inline-flex;
      align-items: center;
    }
  }
  .groups-page-message {
    .page-info {
      .ant-space {
        border: 0;
        padding: 0.5rem 0.5rem 0.5rem 1rem;
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
            padding: 8px 0;
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
          padding: 0.5rem 1rem 0.5rem 1.5rem;
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
  .blank-chat {
    border: 0;
    padding: 0.5rem 1rem;
    .avatar-account-page {
      border-radius: 8px;
      img {
        border-radius: 8px;
      }
    }
    &:hover {
      background: transparent;
    }
  }
  @media (max-width: 526px) {
    &.hide-side-message {
      display: none;
    }
    &.show-side-message {
      width: 100%;
      border-color: transparent !important;
    }
  }
`;

const StyledChatContainer = styled.div`
  width: 75%;
  display: grid;
  grid-template-rows: max-content 1fr max-content;
  @media (max-width: 526px) {
    &.full-content-chat {
      width: 100%;
    }
    &.hide-content-chat {
      display: none;
    }
  }
`;

const StyledChatbox = styled.div`
  width: 100%;
  padding: 1rem;
  overflow: auto;
  display: flex;
  flex-direction: column-reverse;
  overflow: auto;
  -ms-overflow-style: none; // Internet Explorer 10+
  scrollbar-width: none; // Firefox
  ::-webkit-scrollbar {
    display: none; // Safari and Chrome
  }
`;

const InputContainer = styled.div`
  position: sticky;
  z-index: 999;
  bottom: 0;
  display: flex;
  align-items: center;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  background: #fff;
  margin: 0.5rem 1rem 1rem 1rem;
  height: fit-content;
  .ant-input {
    height: 100%;
    max-height: 25vh;
    &[disabled] {
      background: transparent;
    }
  }
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  button {
    border-radius: 12px;
  }
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
    &.sender-avatar-page {
      border-radius: 8px;
      img {
        border-radius: 8px;
      }
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

const StyledChatHeader = styled.div`
  position: sticky;
  z-index: 999;
  top: 0;
  width: 100%;
  margin: 0;
  padding: 1rem;
  padding-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color-base);
  h2 {
    margin: 0;
  }
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
      &.user-avatar-page {
        border-radius: 8px;
        img {
          border-radius: 8px;
        }
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
  accountAddress,
  onClickIcon
}: {
  messages?: any;
  classStyle?: string;
  accountAddress?: string;
  currentSessionId?: string;
  onClickIcon?: (e: any) => void;
}) => {
  const [collapse, setCollapse] = useState(true);

  const triggerCheckIsPageOwner = () => {
    let isPageOwner = false;
    if (messages[0]?.page?.pageAccount?.address === accountAddress) {
      isPageOwner = true;
    } else {
      isPageOwner = false;
    }
    return isPageOwner;
  };

  return (
    <React.Fragment>
      {messages &&
        messages.map((item: PageMessageSessionItem, index) => {
          if (index == 0) {
            return (
              <SpaceShorcutItem
                key={item?.id}
                style={{ marginBottom: collapse && triggerCheckIsPageOwner() ? '0' : '0.5rem' }}
                className="card"
                size={5}
              >
                {triggerCheckIsPageOwner() ? (
                  <>
                    <div className="avatar-account avatar-account-page" onClick={() => setCollapse(!collapse)}>
                      {item?.page && <img src={item?.page?.avatar || '/images/default-avatar.jpg'} />}
                    </div>
                    <div className="content-account">
                      <div className="info-account" onClick={() => setCollapse(!collapse)}>
                        {item?.page?.name && <p className="page-name">{item?.page?.name}</p>}
                        <p className="account-name">{item?.account?.name}</p>
                        {item?.latestMessage ? (
                          <p className="content">{item?.latestMessage}</p>
                        ) : (
                          <p className="content">
                            Give you {Math.round(parseFloat(item?.lixi?.amount))} XPI for messaging
                          </p>
                        )}
                      </div>
                      <div className="time-score" onClick={() => setCollapse(!collapse)}>
                        <p className="create-date">
                          {intl.get('messenger.total')} {messages.length}
                        </p>
                        <div className="content-score">
                          <p className="lotus-burn-score">{transformCreatedAt(item?.updatedAt)}</p>
                        </div>
                      </div>
                      <div className="collapse-action" onClick={() => setCollapse(!collapse)}>
                        <Button
                          type="primary"
                          className="no-border-btn"
                          icon={
                            !collapse ? (
                              <ReactSVG
                                src="/images/ico-arrow-right.svg"
                                wrapper="span"
                                className="anticon custom-svg"
                              />
                            ) : (
                              <ReactSVG
                                src="/images/ico-arrow-down.svg"
                                wrapper="span"
                                className="anticon custom-svg"
                              />
                            )
                          }
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="avatar-account avatar-account-page" onClick={() => onClickIcon(item)}>
                      {item?.page && <img src={item?.page?.avatar || '/images/default-avatar.jpg'} />}
                    </div>
                    <div className="content-account" style={{ paddingRight: '0.5rem' }}>
                      <div className="info-account" onClick={() => onClickIcon(item)}>
                        {item?.page?.name && <p className="page-name">{item?.page?.name}</p>}
                        {item?.latestMessage ? (
                          <p className="content">{item?.latestMessage}</p>
                        ) : (
                          <p className="content">Give {Math.round(parseFloat(item?.lixi?.amount))} XPI for messaging</p>
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
        triggerCheckIsPageOwner() &&
        messages &&
        messages.map((item, index) => {
          return (
            <SpaceShorcutItem
              key={item?.id}
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
                    <p className="content">Give you {Math.round(parseFloat(item?.lixi?.amount))} XPI for messaging</p>
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
    </React.Fragment>
  );
};

const PageMessage = () => {
  const selectedAccount = useAppSelector(getSelectedAccount);
  const dispatch = useAppDispatch();
  const [isPageOwner, setIsPageOwner] = useState<boolean>(false);
  const currentPageMessageSession = useAppSelector(getCurrentPageMessageSession);
  const { control, getValues, resetField, setFocus } = useForm();
  const [open, setOpen] = useState(false);
  const Wallet = React.useContext(WalletContext);
  const { XPI, chronik } = Wallet;
  const [isMobile, setIsMobile] = useState(false);
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [isSendingXPI, setIsSendingXPI] = useState<boolean>(false);
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const slpBalancesAndUtxosRef = useRef(slpBalancesAndUtxos);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const { sendXpi } = useXPI();
  const walletStatus = useAppSelector(getWalletStatus);
  const txFee = Math.ceil(Wallet.XPI.BitcoinCash.getByteCount({ P2PKH: 1 }, { P2PKH: 1 }) * 2.01); //satoshi

  useEffect(() => {
    const isMobile = width < 526 ? true : false;
    setIsMobile(isMobile);
  }, [width]);

  useEffect(() => {
    if (slpBalancesAndUtxos === slpBalancesAndUtxosRef.current) return;
    setIsSendingXPI(false);
  }, [slpBalancesAndUtxos.nonSlpUtxos]);

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

  useEffect(() => {
    if (
      currentPageMessageSession &&
      currentPageMessageSession?.page?.pageAccount?.address === selectedAccount.address
    ) {
      setIsPageOwner(true);
    }
  }, [currentPageMessageSession]);

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext, refetch } =
    useInfinitePageMessageSessionByAccountId(
      {
        first: 10,
        id: selectedAccount?.id
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

  const onClickMessage = (pageMessageSession: PageMessageSessionItem, pageMessageSessionId: string) => {
    dispatch(setPageMessageSession(pageMessageSession));
  };

  const groupPageChat = useMemo(() => {
    let cloneChats = _.cloneDeep(data);
    cloneChats = _.orderBy(cloneChats, ['updatedAt'], ['desc']);
    let groupPageChats = _.values(_.groupBy(cloneChats, 'page.id'));
    return groupPageChats;
  }, [data]);

  const {
    data: messageData,
    fetchNext: messageFetchNext,
    hasNext: messageHasNext,
    isFetching: messageIsFetching,
    isFetchingNext: messageIsFetchingNext
  } = useInfiniteMessageByPageMessageSessionId({
    id: currentPageMessageSession?.id,
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
    const trimMessage = getValues('message').trim();

    if (_.isNil(getValues('message')) || trimMessage === '') {
      return;
    }

    //Check if message is tip
    if (trimMessage.toLowerCase().split(' ')[0] === '/give') {
      const amount: string = trimMessage.toLowerCase().split(' ')[1];
      let tipHex = undefined;

      //check if amount is valid
      if (validateXPIAmount(amount)) {
        tipHex = await giveXPI(trimMessage, amount).then(result => {
          return result;
        });
        const input: CreateMessageInput = {
          authorId: selectedAccount.id,
          body: trimMessage,
          pageMessageSessionId: currentPageMessageSession?.id,
          isPageOwner: isPageOwner,
          tipHex: tipHex
        };

        await createMessageTrigger({ input }).unwrap();
        dispatch(sendXPISuccess(parseFloat(amount).toFixed(2)));
        resetField('message');
      } else {
        dispatch(sendXPIFailure(intl.get('send.syntaxError')));
      }
    } else {
      const input: CreateMessageInput = {
        authorId: selectedAccount.id,
        body: trimMessage,
        pageMessageSessionId: currentPageMessageSession?.id,
        isPageOwner: isPageOwner
      };

      await createMessageTrigger({ input }).unwrap();
      resetField('message');
    }

    setFocus('message');
  };

  //return promise of tipHex and createFeeHex
  const giveXPI = async (text: string, amount: string): Promise<string> => {
    setIsSendingXPI(true);
    try {
      const fundingWif = getUtxoWif(slpBalancesAndUtxos.nonSlpUtxos[0], walletPaths);
      const tipHex = await sendXpi(
        XPI,
        chronik,
        walletPaths,
        slpBalancesAndUtxos.nonSlpUtxos,
        currency.defaultFee,
        text,
        false, // indicate send mode is one to one
        null,
        isPageOwner
          ? currentPageMessageSession?.account?.address
          : currentPageMessageSession?.page?.pageAccount?.address,
        amount,
        true,
        fundingWif,
        true
      );

      return tipHex;
    } catch (e) {
      const message = e.message || e.error || JSON.stringify(e);
      setIsSendingXPI(false);

      dispatch(sendXPIFailure(message));
    }
  };

  const validateXPIAmount = (value: string): boolean => {
    if (!value) return false;

    //check if value is number;
    if (isNaN(parseFloat(value))) return false;

    //check if value is positive number
    if (parseFloat(value) <= 0) return false;

    //check if balance is smaller than value + txFee
    if (
      fromSmallestDenomination(walletStatus.balances.totalBalanceInSatoshis) <=
      parseFloat(value) + fromSmallestDenomination(txFee)
    )
      return false;

    return true;
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
            pageMessageSessionId: currentPageMessageSession?.id
          };
          await openPageMessageSessionTrigger({ input }).unwrap();
        });
      });
    }
  };

  const closeSession = async () => {
    const input: ClosePageMessageSessionInput = {
      pageMessageSessionId: currentPageMessageSession?.id
    };
    await closePageMessageSessionTrigger({ input }).unwrap();
  };

  useEffect(() => {
    resetField('message');
    setFocus('message');
  }, [currentPageMessageSession?.id]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const backToChat = () => {
    dispatch(setPageMessageSession(null));
  };

  const handlersSwip = useSwipeable({
    onSwipedRight: eventData => backToChat()
  });

  return (
    <StyledContainer className={`card page-message ${currentPageMessageSession ? 'detail-chat' : ''}`}>
      <StyledSideContainer
        className={`${currentPageMessageSession ? 'hide-side-message' : 'show-side-message'} ${
          isMobile ? 'animate__faster animate__animated animate__slideInRight' : ''
        }`}
      >
        <h2 className="title-chat">
          Chats <span className="badge-total-message">{data.length}</span>
        </h2>
        <div className="groups-page-message">
          <SpaceShorcutItem
            className="blank-chat"
            style={{ paddingRight: '0.5rem' }}
            size={5}
            onClick={() => router.push('/page/feed')}
          >
            <div className="avatar-account avatar-account-page">
              <img src={'/images/ico-add-chat.png'} />
            </div>
            <div className="content-account" style={{ paddingRight: '0.5rem' }}>
              <div className="info-account">
                <p className="page-name">{intl.get('messenger.blankTitle')}</p>
                <p className="content">{intl.get('messenger.blankBody')}</p>
              </div>
            </div>
            <div className="action" style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                className="no-border-btn"
                icon={<ReactSVG src="/images/ico-arrow-right.svg" wrapper="span" className="anticon custom-svg" />}
              />
            </div>
          </SpaceShorcutItem>
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
                    <div className="page-info" key={index}>
                      <PageGroupItem
                        messages={chat}
                        currentSessionId={currentPageMessageSession?.id}
                        accountAddress={selectedAccount?.address}
                        onClickIcon={session => onClickMessage(session, session.id)}
                      />
                    </div>
                  );
                })}
            </InfiniteScroll>
          )}
        </div>
      </StyledSideContainer>

      <StyledChatContainer
        {...handlersSwip}
        className={`${currentPageMessageSession ? 'full-content-chat' : 'hide-content-chat'} ${
          isMobile ? 'animate__faster animate__animated animate__slideInLeft' : ''
        }`}
      >
        <StyledChatHeader>
          {currentPageMessageSession ? (
            <>
              {currentPageMessageSession?.page?.pageAccount?.address === selectedAccount?.address && (
                <>
                  <div className="custom-user-info">
                    <Button
                      onClick={() => backToChat()}
                      type="text"
                      icon={<ReactSVG src="/images/ico-arrow-left.svg" wrapper="span" className="anticon custom-svg" />}
                    ></Button>
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
                      {intl.get(`messenger.${currentPageMessageSession?.status?.toLowerCase()}`)}
                    </div>
                    <Popover
                      content={
                        <Button
                          style={{ background: 'var(--dark-error-background)', fontSize: '12px' }}
                          type="primary"
                          onClick={closeSession}
                        >
                          {intl.get('messenger.closeSession')}
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
              {currentPageMessageSession?.page?.pageAccount?.address !== selectedAccount?.address && (
                <>
                  <div className="custom-user-info">
                    <Button
                      type="text"
                      onClick={() => backToChat()}
                      icon={<ReactSVG src="/images/ico-arrow-left.svg" wrapper="span" className="anticon custom-svg" />}
                    ></Button>
                    <Avatar
                      className="user-avatar user-avatar-page"
                      src={currentPageMessageSession?.page?.avatar || '/images/default-avatar.jpg'}
                    />
                    <div className="user">
                      <p className="user-name">{currentPageMessageSession?.page?.name}</p>
                      <p className="user-address">
                        {Math.round(parseInt(currentPageMessageSession?.lixi?.amount)) + ' XPI'}
                      </p>
                    </div>
                  </div>
                  <div className="chat-header-action">
                    <div className={`${currentPageMessageSession?.status.toLowerCase()} status-current-session`}>
                      {intl.get(`messenger.${currentPageMessageSession?.status?.toLowerCase()}`)}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <h2>{intl.get('messenger.welcome')}</h2>
          )}
        </StyledChatHeader>
        <StyledChatbox
          id="scrollableChatbox"
          style={{
            justifyContent: currentPageMessageSession
              ? currentPageMessageSession?.status !== PageMessageSessionStatus.Pending
                ? 'normal'
                : 'center'
              : 'center'
          }}
        >
          {currentPageMessageSession ? (
            <React.Fragment>
              {currentPageMessageSession?.status !== PageMessageSessionStatus.Pending ? (
                messageData.length > 0 && (
                  <StyledInfiniteScroll
                    dataLength={messageData.length}
                    next={loadMoreMessages}
                    hasMore={messageHasNext}
                    loader={<Skeleton active />}
                    endMessage={
                      isPageOwner ? (
                        <p>{`${intl.get('messenger.youAccepted')} ${currentPageMessageSession?.account?.name}`}</p>
                      ) : (
                        <p>{`${currentPageMessageSession?.page?.name} ${intl.get('messenger.acceptedYourLixi')}`}</p>
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
                  {currentPageMessageSession?.page?.pageAccount?.address === selectedAccount?.address ? (
                    <div className="sender-message">
                      <Avatar className="sender-avatar" src={currentPageMessageSession?.account?.avatar}>
                        {transformShortName(currentPageMessageSession?.account?.name)}
                      </Avatar>
                      <h4 className="sender-name">{currentPageMessageSession?.account?.name}</h4>
                      <p className="sender-created-at">{transformCreatedAt(currentPageMessageSession?.createdAt)}</p>
                      <p className="sender-message-amount">{`${intl.get('messenger.giveYou')} ${Math.round(
                        Number(currentPageMessageSession?.lixi.amount)
                      )} XPI ${intl.get('messenger.forMessaging')}`}</p>
                      <div className="group-action-session">
                        <Button type="primary" className="outline-btn" onClick={() => openSession()}>
                          {intl.get('messenger.accept')}
                        </Button>
                        <Button type="primary" className="outline-btn" onClick={() => closeSession()}>
                          {intl.get('messenger.deny')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="sender-message">
                      <Avatar
                        className="sender-avatar sender-avatar-page"
                        src={currentPageMessageSession?.page?.avatar || '/images/default-avatar.jpg'}
                      />
                      <h4 className="sender-name">{currentPageMessageSession?.page?.name}</h4>
                      <p className="sender-created-at">{transformCreatedAt(currentPageMessageSession?.createdAt)}</p>
                      <p className="sender-message-amount">{`Waiting for ${currentPageMessageSession?.page?.name} to accept your lixi. Patience is a Virtue!`}</p>
                    </div>
                  )}
                </LixiContainer>
              )}
            </React.Fragment>
          ) : (
            <span className="blank-chat">{intl.get('messenger.selectChat')}</span>
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
                  style={{ border: '0', borderRadius: '12px' }}
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  placeholder={
                    currentPageMessageSession.status === PageMessageSessionStatus.Open
                      ? 'Aa'
                      : currentPageMessageSession.status === PageMessageSessionStatus.Pending
                      ? `${intl.get('messenger.acceptToChat')}`
                      : `${intl.get('messenger.sessionClose')}`
                  }
                  disabled={
                    isLoadingCreateMessage ||
                    currentPageMessageSession.status !== PageMessageSessionStatus.Open ||
                    isSendingXPI
                  }
                  autoSize
                  onKeyDown={handleKeyDown}
                />
              )}
            />
            <IconContainer>
              <Button
                type="text"
                disabled={
                  isLoadingCreateMessage ||
                  currentPageMessageSession.status !== PageMessageSessionStatus.Open ||
                  isSendingXPI
                }
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
