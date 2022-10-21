import React, { useEffect } from 'react';
import { WrapperPage } from '@components/Settings';
import NotificationPopup, { StyledPopover } from '@components/NotificationPopup';
import { getAllNotifications } from '@store/notification/selectors';
import { fetchNotifications } from '@store/notification/actions';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getSelectedAccount } from '@store/account/selectors';
import styled from 'styled-components';

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
