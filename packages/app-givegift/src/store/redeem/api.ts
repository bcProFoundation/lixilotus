import { CreateRedeemDto, RedeemDto, ViewRedeemDto } from "@abcpros/givegift-models/lib/redeem";
import axiosClient from "@utils/axiosClient";

const redeemApi = {
  getById(id: number): Promise<ViewRedeemDto> {
    const url = `/api/redeems/${id}`;
    return axiosClient.get(url)
      .then(response => {
        return response.data as ViewRedeemDto;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      })
  },
  post(dto: CreateRedeemDto) {
    const url = '/api/redeems';
    return axiosClient.post(url, dto)
      .then(response => {
        return response.data as RedeemDto;
      })
      .catch((err) => {
        const { response } = err;
        throw response.data;
      });
  },
  getByVaultId(id: number) {
    const url = `/api/vaults/${id}/redeems`;
    return axiosClient.get(url)
      .then(response => {
        return response.data as RedeemDto[];
      })
      .catch(err => {
        const { response } = err;
        throw response.data;
      });
  }
};

export default redeemApi;