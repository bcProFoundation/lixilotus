import axiosClient from '@utils/axiosClient';
import { LocalUser } from 'src/models/localUser';

const localAccountApi = {
  localLogin(localUser: LocalUser): Promise<any> {
    const url = '/api/local-login';
    return axiosClient
      .post(url, localUser)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  }
};

export default localAccountApi;
