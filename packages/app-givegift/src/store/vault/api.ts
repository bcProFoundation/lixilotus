import { ImportVaultDto, VaultApi } from "@abcpros/givegift-models/lib/vault";
import axiosClient from "@utils/axiosClient";

const vaultApi = {
  getById(id: number): Promise<VaultApi> {
    const url = `/api/vaults/${id}`;
    return axiosClient.get(url);
  },
  post(data: VaultApi): Promise<VaultApi> {
    const url = '/api/vaults';
    return axiosClient.post(url, data);
  },
  import(data: ImportVaultDto): Promise<VaultApi> {
    const url = '/api/vaults/import';
    return axiosClient.post(url, data);
  }
};

export default vaultApi;