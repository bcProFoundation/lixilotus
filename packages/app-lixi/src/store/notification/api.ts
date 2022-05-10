import { NotificationDto as Notification } from "@bcpros/lixi-models";
import axiosClient from "@utils/axiosClient";

const notificationApi = {
  getByAccountId(id: number, mnemonicHash?: string): Promise<Notification[]> {
    const url = `/api/accounts/${id}/notifications`;

    const config = mnemonicHash ? {
      headers: {
        'Mnemonic-Hash': mnemonicHash
      }
    } : {};

    return axiosClient.get(url, config)
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
    const config = mnemonicHash ? {
      headers: {
        'Mnemonic-Hash': mnemonicHash
      }
    } : {};

    return axiosClient.delete(url,config)
      .then(response => {
      })
      .catch(err => {
        const { response } = err;
        throw response.data;
      });
  },
  readByNotificationId(mnemonicHash?: string, notificationId?: number): Promise<Notification> {
    const url = `/api/notifications/${notificationId}`;
    const config = mnemonicHash ? {
      headers: {
        'Mnemonic-Hash': mnemonicHash
      }
    } : {};

    return axiosClient.patch(url,config)
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