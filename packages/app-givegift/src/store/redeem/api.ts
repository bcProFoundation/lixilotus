import { CreateRedeemDto, RedeemDto } from "@abcpros/givegift-models/lib/redeem";
import axiosClient from "@utils/axiosClient";

const redeemApi = {
  post(data: CreateRedeemDto): Promise<RedeemDto> {
    const url = '/api/redeems';
    return axiosClient.post(url, data);
  },
  getByVaultId(id: number): Promise<RedeemDto[]> {
    const url = `/api/vaults/${id}/redeems`;
    return axiosClient.get(url);
  }
};

export default redeemApi;