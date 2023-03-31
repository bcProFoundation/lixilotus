import { NotificationDto as Notification, PaginationResult } from '@bcpros/lixi-models';
import axiosClient from '@utils/axiosClient';
import { readAllNotifications } from './actions';

const notificationApi = {
  getByAccountId(id: number, mnemonicHash?: string): Promise<Notification[]> {
    const url = `/api/accounts/${id}/notifications`;

    const config = mnemonicHash
      ? {
        headers: {
          // 'Mnemonic-Hash': mnemonicHash
        },
        withCredentials: true
      }
      : {};

    return axiosClient
      .get(url, config)
      .then(response => {
        return response.data as Notification[];
      })
      .catch(err => {
        const { response } = err;
        throw response.data;
      });
  },
  deleteNofificationById(mnemonicHash?: string, notificationId?: number): Promise<any> {
    const url = `/api/notifications/${notificationId}`;
    const config = mnemonicHash
      ? {
        headers: {
          // 'Mnemonic-Hash': mnemonicHash
        },
        withCredentials: true
      }
      : {};

    return axiosClient
      .delete(url, config)
      .then(response => { })
      .catch(err => {
        const { response } = err;
        throw response.data;
      });
  },
  readByNotificationId(mnemonicHash?: string, notificationId?: number): Promise<Notification> {
    const url = `/api/notifications/${notificationId}`;
    const config = mnemonicHash
      ? {
        headers: {
          // 'Mnemonic-Hash': mnemonicHash
        },
        withCredentials: true
      }
      : {};

    return axiosClient
      .patch(url, {}, config)
      .then(response => {
        return response.data as Notification;
      })
      .catch(err => {
        const { response } = err;
        throw response.data;
      });
  },
  readAllNotifications(mnemonichHash?: string): Promise<any> {
    const url = `/api/notifications/readAll`;
    const config = mnemonichHash
      ? {
        headers: {
          'Mnemonic-Hash': mnemonichHash
        },
        withCredentials: true
      }
      : {};

    return axiosClient
      .patch(url, {}, config)
      .then(response => {
        return response.data as Notification;
      })
      .catch(err => {
        const { response } = err;
        throw response.data;
      });
  },
  readAllNotifications(): Promise<any> {
    const url = `/api/notifications/readAll`;

    return axiosClient
      .patch(url)
      .then(response => {
        return response.data as Notification;
      })
      .catch(err => {
        const { response } = err;
        throw response.data;
      });
  }
};

export default notificationApi;
