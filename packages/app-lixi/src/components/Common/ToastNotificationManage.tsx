import { useAppDispatch, useAppSelector } from '@store/hooks';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { notification } from 'antd';
import { getCurrentThemes } from '@store/settings';
import _ from 'lodash';
import { getToastNotification } from '@store/toast/selectors';
import { ReactSVG } from 'react-svg';
import { ToastType } from '@store/toast/state';
import intl from 'react-intl-universal';
import { closeToast } from '@store/toast/actions';

const DURATION_DEFAULT = 1.5;

const ToastNotificationManage = () => {
  const currentToast = useAppSelector(getToastNotification);
  const currentTheme = useAppSelector(getCurrentThemes);
  const dispatch = useAppDispatch();

  const getIconToast = (typeToast: ToastType) => {
    switch (typeToast) {
      case 'success':
        return (
          <ReactSVG
            src={`${
              currentTheme === 'dark' ? '/images/ico-toast-success-dark.svg' : '/images/ico-toast-success-light.svg'
            }`}
          />
        );
      case 'error':
        return (
          <ReactSVG
            src={`${
              currentTheme === 'dark' ? '/images/ico-toast-error-dark.svg' : '/images/ico-toast-error-light.svg'
            }`}
          />
        );
      case 'warning':
        return (
          <ReactSVG
            src={`${
              currentTheme === 'dark' ? '/images/ico-toast-warning-dark.svg' : '/images/ico-toast-warning-light.svg'
            }`}
          />
        );
      case 'open':
        return (
          <ReactSVG
            src={`${currentTheme === 'dark' ? '/images/ico-toast-info-dark.svg' : '/images/ico-toast-info-light.svg'}`}
          />
        );
      case 'info':
        return (
          <ReactSVG
            src={`${currentTheme === 'dark' ? '/images/ico-toast-info-dark.svg' : '/images/ico-toast-info-light.svg'}`}
          />
        );
      case 'burn':
        return <ReactSVG src="/images/ico-fire-toast.svg" />;
      default:
        return (
          <ReactSVG
            src={`${currentTheme === 'dark' ? '/images/ico-toast-info-dark.svg' : '/images/ico-toast-info-light.svg'}`}
          />
        );
    }
  };

  useEffect(() => {
    if (currentToast) {
      const { type, config } = currentToast;
      if (config) {
        const newConfig = _.cloneDeep(config);
        newConfig.placement = 'top';
        newConfig.className = `custom-toast-notification ${
          currentTheme === 'dark' ? 'custom-toast-notification-dark' : 'custom-toast-notification-light'
        }`;
        newConfig.icon = getIconToast(type);
        newConfig.message = newConfig?.message || intl.get(`toast.${type}`);
        newConfig.duration = newConfig?.duration || DURATION_DEFAULT;

        dispatch(closeToast());
        switch (type) {
          case 'success':
            return notification.success(newConfig);
          case 'error':
            return notification.error(newConfig);
          case 'warning':
            return notification.warning(newConfig);
          case 'open':
            return notification.open(newConfig);
          case 'info':
            return notification.info(newConfig);
          case 'burn':
            newConfig.className = newConfig.className + ' burn-toast-notification';
            return notification.error(newConfig);
          default:
            break;
        }
      }
    }
  }, [currentToast]);

  return <></>;
};

export default ToastNotificationManage;
