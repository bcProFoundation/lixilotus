import { AccountDto, CreateAccountCommand } from "@abcpros/givegift-models/src/lib/account";
import axiosClient from "@utils/axiosClient";

const accountApi = {
  getById(id: number): Promise<AccountDto> {
    const url = `/api/accounts/${id}`;
    return axiosClient.get(url)
      .then(response => {
        return response.data as AccountDto;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      })
  },
  post(data: CreateAccountCommand): Promise<AccountDto> {
    const url = '/api/accounts';
    return axiosClient.post(url, data)
      .then(response => {
        return response.data as AccountDto;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      })
  },
};

export default accountApi;