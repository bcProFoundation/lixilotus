import { LixiDto, PaginationResult } from "@bcpros/lixi-models";
import { CreateLixiCommand, LockLixiCommand, UnlockLixiCommand, WithdrawLixiCommand, RenameLixiCommand, Lixi, PostLixiResponseDto } from "@bcpros/lixi-models/lib/lixi";
import axiosClient from "@utils/axiosClient";

const lixiApi = {
  getById(id: number): Promise<LixiDto> {
    const url = `/api/lixies/${id}`;
    return axiosClient.get(url)
      .then(response => {
        return response.data as LixiDto;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      })
  },
  getSubLixi(id: number, startId?: number): Promise<PaginationResult<LixiDto>> {
    const url = startId ?
      `/api/lixies/${id}/children?startId=${startId}` :
      `/api/lixies/${id}/children`;
    return axiosClient.get(url)
      .then(response => {
        return response.data as PaginationResult<LixiDto>;;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      })
  },
  post(data: CreateLixiCommand): Promise<PostLixiResponseDto> {
    const url = '/api/lixies';
    return axiosClient.post(url, data)
      .then(response => {
        return response.data as PostLixiResponseDto;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      })
  },
  patch(id: number, data: RenameLixiCommand): Promise<LixiDto> {
    const url = `/api/lixies/${id}/rename`;
    return axiosClient.patch(url, data)
      .then(response => {
        return response.data as LixiDto;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      })
  },
  getByAccountId(id: number) {
    const url = `/api/accounts/${id}/lixies`;
    return axiosClient.get(url)
      .then(response => {
        return response.data as LixiDto[];
      })
      .catch(err => {
        const { response } = err;
        throw response.data;
      });
  },
  lockLixi(id: number, data: LockLixiCommand) {
    const url = `/api/lixies/${id}/lock`;
    return axiosClient.post(url, data)
      .then(response => {
        return response.data as LixiDto;
      })
      .catch(err => {
        const { response } = err;
        throw response.data;
      });
  },
  unlockLixi(id: number, data: UnlockLixiCommand) {
    const url = `/api/lixies/${id}/unlock`;
    return axiosClient.post(url, data)
      .then(response => {
        return response.data as LixiDto;
      })
      .catch(err => {
        const { response } = err;
        throw response.data;
      });
  },
  withdrawLixi(id: number, data: WithdrawLixiCommand) {
    const url = `/api/lixies/${id}/withdraw`;
    return axiosClient.post(url, data)
      .then(response => {
        return response.data as LixiDto;
      })
      .catch(err => {
        const { response } = err;
        throw response.data;
      });
  }
};

export default lixiApi;