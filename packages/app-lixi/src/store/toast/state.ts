import { ArgsProps } from 'antd/lib/notification';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'open' | null;

export interface ToastState {
  type: ToastType;
  config: ArgsProps | null;
}
