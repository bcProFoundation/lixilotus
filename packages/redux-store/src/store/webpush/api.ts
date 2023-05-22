import { WebpushSubscribeCommand, WebpushUnsubscribeCommand } from '@bcpros/lixi-models';
import axiosClient from '@utils/axiosClient';

const webpushApi = {
  subscribe(data: WebpushSubscribeCommand): Promise<number> {
    const url = `/api/webpush/subscribe`;
    return axiosClient
      .post(url, data, { withCredentials: true })
      .then(response => {
        return response.data;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  },
  unsubscribe(data: WebpushUnsubscribeCommand): Promise<number> {
    const url = `/api/webpush/unsubscribe`;
    return axiosClient
      .post(url, data, { withCredentials: true })
      .then(response => {
        return response.data;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  }
};

export default webpushApi;
