import { CreateClaimDto, ClaimDto, ViewClaimDto } from "@bcpros/lixi-models/lib/claim";
import axiosClient from "@utils/axiosClient";

const claimApi = {
  getById(id: number): Promise<ViewClaimDto> {
    const url = `/api/claims/${id}`;
    return axiosClient.get(url)
      .then(response => {
        return response.data as ViewClaimDto;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      })
  },
  post(dto: CreateClaimDto) {
    const url = '/api/claims';
    return axiosClient.post(url, dto)
      .then(response => {
        return response.data as ClaimDto;
      })
      .catch((err) => {
        const { response } = err;
        throw response.data;
      });
  },
  getByLixiId(id: number) {
    const url = `/api/lixies/${id}/claims`;
    return axiosClient.get(url)
      .then(response => {
        return response.data as ClaimDto[];
      })
      .catch(err => {
        const { response } = err;
        throw response.data;
      });
  }
};

export default claimApi;