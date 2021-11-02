import { createAction } from '@reduxjs/toolkit';
import { ArgsProps } from 'antd/lib/notification';
import { ToastType } from './state';

export const showToast = createAction('toast/showToast', (type: ToastType, config: ArgsProps) => {
  return {
    payload: {
      type,
      config
    }
  };
});