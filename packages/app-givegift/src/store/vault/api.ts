import { CreateVaultDto, ImportVaultDto, VaultDto } from "@abcpros/givegift-models/lib/vault";
import axiosClient from "@utils/axiosClient";

const vaultApi = {
  getById(id: number): Promise<VaultDto> {
    const url = `/api/vaults/${id}`;
    return axiosClient.get(url);
  },
  post(data: CreateVaultDto): Promise<VaultDto> {
    const url = '/api/vaults';
    return axiosClient.post(url, data);
  },
  import(data: ImportVaultDto): Promise<VaultDto> {
    const url = '/api/vaults/import';
    return axiosClient.post(url, data);
  }
};

export default vaultApi;