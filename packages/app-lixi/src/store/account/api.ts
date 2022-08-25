import {
  DeleteAccountCommand,
  RenameAccountCommand,
  RegisterViaEmailNoVerifiedCommand,
  LoginViaEmailCommand
} from '@bcpros/lixi-models';
import { AccountDto, CreateAccountCommand, ImportAccountCommand } from '@bcpros/lixi-models';
import { PatchAccountCommand } from '@bcpros/lixi-models/src/lib/account';
import axiosClient, { axiosAuthClient } from '@utils/axiosClient';
import axios from 'axios';

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
  },
  registerViaEmailNoVerified(data: RegisterViaEmailNoVerifiedCommand): Promise<any> {
    const url = '/user_signup/v1/email_no_verified';
    return axiosAuthClient
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
    const allowedScopes = ['openid', 'email'];
    const clientId = '​6aa82f7e-e1aa-41f2-8e01-06addce862f6';
    const redirect_uri = 'http://admin.localhost:4220/index.html';

    const options = {
      method: 'GET',
      url: 'http://accounts.localhost:4210/oauth2/confirmation',
      params: {
        response_type: 'code',
        client_id: '0485a20d-74d5-46ea-80ac-51a603319d19',
        redirect_uri: 'https://lixilotus.test',
        scope: 'openid roles'
      },
      redirect_uri: 'http://accounts.localhost:4210'
    };

    // return axiosAuthClient
    //   .post(url, data)
    //   .then(() => {
    //     axios.request(options).then(function (response) {
    //       console.log(response.data);
    //     })
    //   })
    //   .catch(err => {
    //     const { response } = err;
    //     throw response?.data ?? err ?? 'Network Error';
    //   });
    return axios.request(options).then(function (response) {
      console.log(response.data);
    });
  }
};

export default accountApi;
