import { DeleteAccountCommand, RenameAccountCommand } from '@bcpros/lixi-models';
import { AccountDto, CreateAccountCommand, ImportAccountCommand } from '@bcpros/lixi-models';
import { PatchAccountCommand } from '@bcpros/lixi-models/src/lib/account';
import axiosClient from '@utils/axiosClient';

const accountApi = {
  getById(id: number): Promise<AccountDto> {
    const url = `/api/accounts/${id}`;
    return axiosClient
      .get(url)
      .then(response => {
        return response.data as AccountDto;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  },
  post(data: CreateAccountCommand): Promise<AccountDto> {
    const url = '/api/accounts';
    return axiosClient
      .post(url, data)
      .then(response => {
        return response.data as AccountDto;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  },
  patch(id: number, data: PatchAccountCommand): Promise<AccountDto> {
    const url = `/api/accounts/${id}`;
    return axiosClient
      .patch(url, data)
      .then(response => {
        return response.data as AccountDto;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  },
  import(data: ImportAccountCommand): Promise<AccountDto> {
    const url = '/api/accounts/import';
    return axiosClient
      .post(url, data)
      .then(response => {
        return response.data as AccountDto;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  },
  delete(id: number, data: DeleteAccountCommand): Promise<any> {
    const url = `/api/accounts/${id}`;
    return axiosClient
      .delete(url, { data: data })
      .then(response => {})
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  },
  login(mnemonic: string): Promise<string> {
    const url = `/api/auth/login`;
    return axiosClient
      .post(url, { mnemonic })
      .then(response => {
        return response.data as string;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  }
};

export default accountApi;
