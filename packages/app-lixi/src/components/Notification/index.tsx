import React, { useEffect } from 'react';
import { WrapperPage } from '@components/Settings';
import NotificationPopup, { StyledPopover } from '@components/NotificationPopup';
import { getAllNotifications } from '@store/notification/selectors';
import { fetchNotifications } from '@store/notification/actions';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getSelectedAccount } from '@store/account/selectors';
import styled from 'styled-components';
import SwipeToDelete from 'react-swipe-to-delete-ios';
import moment from 'moment';
import { isMobile } from 'react-device-detect';
import { Space, Popover, Comment } from 'antd';

const StyledComment = styled(Comment)`
  border-radius: 5px;
  border-bottom: 1px solid #e8e8e8;
  padding: 5px;

  &:hover {
    background-color: #eceff5 !important;
  }

  .ant-comment-inner {
    padding: 0px;
    color: black;
  }
`;

const StyledAuthor = styled.div`
  font-size: 14px;
  color: black;
  display: inline-block;
  width: 310px;

  &:hover {
    color: black;
  }
`;

const StyledTextLeft = styled.span`
  float: left;
  font-size: 16px;
  font-weight: bold;
`;

const StyledTextRight = styled.span`
  float: right;
  font-size: 10px;
  font-style: italic;
`;

const StyledSwipeToDelete = styled(SwipeToDelete)`
  --rstdiHeight: 100% !important;
`;

const NotificationComponent = () => {
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const notifications = useAppSelector(getAllNotifications);

  useEffect(() => {
    if (selectedAccount) {
      dispatch(
        fetchNotifications({
          accountId: selectedAccount.id,
          mnemonichHash: selectedAccount.mnemonicHash
        })
      );
    }
  }, []);

  return <WrapperPage>{NotificationPopup(notifications, selectedAccount)}</WrapperPage>;
};

export default NotificationComponent;
