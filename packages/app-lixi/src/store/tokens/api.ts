import { TokenDto } from '@bcpros/lixi-models';
import axiosClient from '@utils/axiosClient';

const tokenApi = {
  getAllTokens(): Promise<any> {
    const url = `/api/tokens`;
    return axiosClient
      .get(url)
      .then(response => {
        return response.data as any;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  },
  getTokenById(id: string): Promise<any> {
    const url = `/api/tokens/${id}`;
    return axiosClient
      .get(url)
      .then(response => {
        return response.data as any;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  },
  post(data: any): Promise<TokenDto> {
    const url = '/api/tokens';
    return axiosClient
      .post(url, data, { withCredentials: true })
      .then(response => {
        return response.data as TokenDto;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  }
};

export default tokenApi;
