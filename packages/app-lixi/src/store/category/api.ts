import { PageCategory } from '@bcpros/lixi-models';
import axiosClient from '@utils/axiosClient';

const categoryApi = {
  getCategories(): Promise<PageCategory> {
    const url = `/api/categories`;
    return axiosClient
      .get(url)
      .then(response => {
        return response.data as PageCategory;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  }
};

export default categoryApi;
