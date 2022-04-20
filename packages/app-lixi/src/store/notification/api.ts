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
  }
};

export default notificationApi;