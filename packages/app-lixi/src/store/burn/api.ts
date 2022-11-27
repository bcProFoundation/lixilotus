import { BurnCommand } from "@bcpros/lixi-models";
import axiosClient from "@utils/axiosClient";

const burnApi = {
  post(data: BurnCommand): Promise<any> {
    const url = '/api/burn';
    return axiosClient
      .post(url, data, { withCredentials: true })
      .then(response => {
        return response.data as any;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  }
}

export default burnApi;