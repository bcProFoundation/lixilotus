import { ExportLixiCommand, LixiDto, PaginationResult } from "@bcpros/lixi-models";
import { CreateLixiCommand, ArchiveLixiCommand, UnarchiveLixiCommand, WithdrawLixiCommand, RenameLixiCommand, Lixi, PostLixiResponseDto } from "@bcpros/lixi-models/lib/lixi";
import axiosClient from "@utils/axiosClient";

const lixiApi = {
  getById(id: number, accountSecret?: string): Promise<LixiDto> {
    const url = `/api/lixies/${id}`;

    const config = accountSecret ? {
      headers: {
        'Account-Secret': accountSecret
      }
    } : {};

    return axiosClient.get(url, config)
      .then(response => {
        return response.data as LixiDto;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      })
  },
  getSubLixies(parentId: number, accountSecret?: string, startId?: number): Promise<PaginationResult<LixiDto>> {

    const config = accountSecret ? {
      headers: {
        'Account-Secret': accountSecret
      }
    } : {};

    const url = startId ?
      `/api/lixies/${parentId}/children?startId=${startId}` :
      `/api/lixies/${parentId}/children`;

    return axiosClient.get(url, config)
      .then(response => {
        return response.data as PaginationResult<LixiDto>;
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
  archiveLixi(id: number, data: ArchiveLixiCommand) {
    const url = `/api/lixies/${id}/archive`;
    return axiosClient.post(url, data)
      .then(response => {
        return response.data as LixiDto;
      })
      .catch(err => {
        const { response } = err;
        throw response.data;
      });
  },
  unarchiveLixi(id: number, command: UnarchiveLixiCommand) {
    const url = `/api/lixies/${id}/unarchive`;
    return axiosClient.post(url, command)
      .then(response => {
        return response.data as LixiDto;
      })
      .catch(err => {
        const { response } = err;
        throw response.data;
      });
  },
  withdrawLixi(id: number, command: WithdrawLixiCommand) {
    const url = `/api/lixies/${id}/withdraw`;
    return axiosClient.post(url, command)
      .then(response => {
        return response.data as LixiDto;
      })
      .catch(err => {
        const { response } = err;
        throw response.data;
      });
  },
  exportSubLixies(id: number, command: ExportLixiCommand, accountSecret?: string) {
    const config = accountSecret ? {
      headers: {
        'Account-Secret': accountSecret
      }
    } : {};

    const url = `/api/lixies/${id}/export`;
    return axiosClient.post(url, command, config)
      .then(response => {
        return response.data;
      })
      .catch(err => {
        const { response } = err;
        throw response.data;
      });
  },
};

export default lixiApi;