import { createAction } from '@reduxjs/toolkit';
import { ArgsProps } from 'antd/lib/notification/interface';
import { ToastType, CustomToastType } from './state';

export const showToast = createAction('toast/showToast', (type: ToastType | CustomToastType, config: ArgsProps) => {
  return {
    payload: {
      type,
      config
    }
  };
});
