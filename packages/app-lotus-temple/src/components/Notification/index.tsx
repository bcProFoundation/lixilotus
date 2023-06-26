import { Comment } from '@ant-design/compatible';
import NotificationPopup from '@components/NotificationPopup';
import { WrapperPage } from '@components/Settings';
import { getSelectedAccount } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { fetchNotifications } from '@store/notification/actions';
import { getAllNotifications } from '@store/notification/selectors';
import { useEffect } from 'react';
import SwipeToDelete from 'react-swipe-to-delete-ios';
import styled from 'styled-components';

const StyledComment = styled(Comment)`
  border-radius: 5px;
  border: 1px solid var(--boder-item-light);
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
  font-size: 14px;
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
