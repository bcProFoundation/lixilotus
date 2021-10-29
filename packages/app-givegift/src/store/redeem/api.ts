import { RedeemApi } from "@abcpros/givegift-models/lib/redeem";
import axiosClient from "@utils/axiosClient";

const redeemApi = {
  post(data: RedeemApi): Promise<RedeemApi> {
    const url = '/api/redeems';
    return axiosClient.post(url, data);
  },
  getByVaultId(id: number): Promise<RedeemApi[]> {
    const url = `/api/vaults/${id}/redeems`;
    return axiosClient.get(url);
  }
};

export default redeemApi;