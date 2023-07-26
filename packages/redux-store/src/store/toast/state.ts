import { ArgsProps } from 'antd/lib/notification/interface';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'open' | 'burn' | null;

export interface ToastState {
  type: ToastType;
  config?: ArgsProps | null;
}
