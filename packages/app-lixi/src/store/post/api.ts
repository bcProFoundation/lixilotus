import { EditPostCommand } from '@bcpros/lixi-models';
import { CreatePostCommand } from '@bcpros/lixi-models/src';
import { searchPost } from './actions';
import axiosClient from '@utils/axiosClient';

const postApi = {
  post(data: CreatePostCommand): Promise<any> {
    const url = '/api/posts';
    return axiosClient
      .post(url, data, { withCredentials: true })
      .then(response => {
        return response.data as any;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  },
  getAllPostByAccount(accountId: number): Promise<any> {
    const url = `/api/posts/account/${accountId}`;
    return axiosClient
      .get(url)
      .then(response => {
        return response.data.data as any;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  },
  getAllPostsByPage(pageId): Promise<any> {
    const url = `/api/posts/page/${pageId}`;
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
  getDetailPost(id: string): Promise<any> {
    const url = `/api/posts/${id}`;
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
  searchPost(query: string): Promise<any> {
    const url = `/api/posts/search?q=${query}`;
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
  update(id: string, data: EditPostCommand): Promise<any> {
    const url = `/api/posts/${id}`;
    return axiosClient
      .patch(url, data, { withCredentials: true })
      .then(response => {
        return response.data as any;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  }
};

export default postApi;
