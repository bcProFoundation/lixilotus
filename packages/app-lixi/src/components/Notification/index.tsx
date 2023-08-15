import React, { useEffect } from 'react';
import { WrapperPage } from '@components/Settings';
import NotificationPopup from '@components/NotificationPopup';
import { getAllNotifications } from '@store/notification/selectors';
import { fetchNotifications } from '@store/notification/actions';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getSelectedAccount } from '@store/account/selectors';

const NotificationComponent = () => {
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const notifications = useAppSelector(getAllNotifications);

  return <WrapperPage className="card">{NotificationPopup(notifications, selectedAccount)}</WrapperPage>;
};

export default NotificationComponent;
