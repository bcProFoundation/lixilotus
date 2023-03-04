import { ArgsProps } from 'antd/lib/notification/interface';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'open' | null;
export type CustomToastType = 'burn';

export interface ToastState {
  type: ToastType | CustomToastType;
  config?: ArgsProps | null;
}
