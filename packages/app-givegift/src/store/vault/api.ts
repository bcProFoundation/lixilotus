import { CreateVaultCommand, LockVaultCommand, UnlockVaultCommand, VaultDto } from "@abcpros/givegift-models/lib/vault";
import axiosClient from "@utils/axiosClient";

const vaultApi = {
  getById(id: number): Promise<VaultDto> {
    const url = `/api/vaults/${id}`;
    return axiosClient.get(url)
      .then(response => {
        return response.data as VaultDto;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      })
  },
  post(data: CreateVaultCommand): Promise<VaultDto> {
    const url = '/api/vaults';
    return axiosClient.post(url, data)
      .then(response => {
        return response.data as VaultDto;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      })
  },
  getByAccountId(id: number) {
    const url = `/api/accounts/${id}/vaults`;
    return axiosClient.get(url)
      .then(response => {
        return response.data as VaultDto[];
      })
      .catch(err => {
        const { response } = err;
        throw response.data;
      });
  },
  lockVault(id: number, data: LockVaultCommand) {
    const url = `/api/vaults/${id}/lock`;
    return axiosClient.post(url, data)
      .then(response => {
        return response.data as VaultDto[];
      })
      .catch(err => {
        const { response } = err;
        throw response.data;
      });
  },
  unlockVault(id: number, data: UnlockVaultCommand) {
    const url = `/api/vaults/${id}/unlock`;
    return axiosClient.post(url, data)
      .then(response => {
        return response.data as VaultDto[];
      })
      .catch(err => {
        const { response } = err;
        throw response.data;
      });
  }
};

export default vaultApi;