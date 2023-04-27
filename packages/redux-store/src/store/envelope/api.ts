import { Envelope } from '@bcpros/lixi-models';
import axiosClient from '@utils/axiosClient';

const envelopeApi = {
  getById(id: number): Promise<Envelope> {
    const url = `/api/envelopes/${id}`;
    return axiosClient
      .get(url)
      .then(response => {
        return response.data as Envelope;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  },
  getAll(): Promise<Envelope[]> {
    const url = `/api/envelopes`;
    return axiosClient
      .get(url)
      .then(response => {
        return response.data as Envelope[];
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  }
};

export default envelopeApi;
