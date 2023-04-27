import { NotificationDto, PaginationResult } from '@bcpros/lixi-models';
import axiosClient from '@utils/axiosClient';

import { readAllNotifications } from './actions';

const notificationApi = {
  getByAccountId(id: number, mnemonicHash?: string): Promise<NotificationDto[]> {
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
        return response.data as NotificationDto[];
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
      .then(response => {})
      .catch(err => {
        const { response } = err;
        throw response.data;
      });
  },
  readByNotificationId(mnemonicHash?: string, notificationId?: number): Promise<NotificationDto> {
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
        return response.data as NotificationDto;
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
        return response.data as NotificationDto;
      })
      .catch(err => {
        const { response } = err;
        throw response.data;
      });
  }
};

export default notificationApi;