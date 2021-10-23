import { RedeemApi } from "@abcpros/givegift-models/lib/redeem";
import axiosClient from "@utils/axiosClient";

const redeemApi = {
  post(data: RedeemApi): Promise<RedeemApi> {
    const url = '/api/redeems';
    return axiosClient.post(url, data);
  }
};

export default redeemApi;