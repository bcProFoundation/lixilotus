import {
  AccountDto,
  CreateAccountCommand,
  DeleteAccountCommand,
  ImportAccountCommand,
  LoginViaEmailCommand,
  RegisterViaEmailNoVerifiedCommand
} from '@bcpros/lixi-models';
import { PatchAccountCommand } from '@bcpros/lixi-models/src/lib/account';
import axiosClient from '@utils/axiosClient';
import getOauth2URL from '@utils/oauth2';

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
  getByAddress(address: string) {
    const url = `/api/accounts/address/${address}`;
    return axiosClient
      .get(url)
      .then(response => {
        return response.data;
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
      .then(response => { })
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
  },
  registerViaEmailNoVerified(data: RegisterViaEmailNoVerifiedCommand): Promise<any> {
    const url = '/user_signup/v1/email_no_verified';
    return axiosClient
      .post(url, data)
      .then(response => {
        return response.data as any;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  },
  loginViaEmail(data: LoginViaEmailCommand): Promise<any> {
    const url = '/auth/login';
    const redirectURL = getOauth2URL();

    return axiosClient
      .post(url, { ...data, redirect: redirectURL })
      .then(response => {
        return response.data;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  },
  verifyEmail(data: string): Promise<any> {
    const url = '/auth/verify_user';

    return axiosClient
      .post(url, { username: data })
      .then(res => {
        return res.data;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  },

  getTopFive() {
    const url = '/api/accounts/top5';
    return axiosClient
      .get(url)
      .then(response => {
        return response.data;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  },
};

export default accountApi;
