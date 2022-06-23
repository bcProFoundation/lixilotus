import { createAction } from '@reduxjs/toolkit';
import {
  GenerateLixiCommand,
  CreateLixiCommand,
  Lixi,
  UnarchiveLixiCommand,
  ArchiveLixiCommand,
  WithdrawLixiCommand,
  RenameLixiCommand,
  DownloadExportedLixiCommand
} from '@bcpros/lixi-models/lib/lixi';
import { Claim } from '@bcpros/lixi-models/lib/claim';
import { ExportLixiCommand, LixiDto, PaginationResult } from '@bcpros/lixi-models';

export const getLixiActionType = 'lixi/getLixi';
export const postLixiActionType = 'lixi/postLixi';
export const refreshLixiActionType = 'lixi/refreshLixi';

export const generateLixi = createAction<GenerateLixiCommand>('lixi/generateLixi');
export const getLixi = createAction<number>('lixi/getLixi');
export const getLixiSuccess = createAction<Lixi>('lixi/getLixiSuccess');
export const getLixiFailure = createAction<string>('lixi/getLixiFailure');
export const renameLixi = createAction<RenameLixiCommand>('lixi/renameLixi');
export const renameLixiSuccess = createAction<Lixi>('lixi/renameLixiSuccess');
export const renameLixiFailure = createAction<string>('lixi/renameLixiFailure');
export const postLixi = createAction<CreateLixiCommand>('lixi/postLixi');
export const postLixiSuccess = createAction<Lixi>('lixi/postLixiSuccess');
export const postLixiFailure = createAction<string>('lixi/postLixiFailure');
export const setLixi = createAction<Lixi>('lixi/setLixi');
export const selectLixi = createAction<number>('lixi/selectLixi');
export const selectLixiSuccess = createAction<{ lixi: Lixi; claims: Claim[] }>('lixi/selectLixiSuccess');
export const selectLixiFailure = createAction<string>('lixi/selectLixiFailure');
export const refreshLixi = createAction<number>('lixi/refreshLixi');
export const refreshLixiSuccess = createAction<{ lixi: Lixi; claims: Claim[] }>('lixi/refreshLixiSuccess');
export const refreshLixiFailure = createAction<string>('lixi/refreshLixiFailure');
export const refreshLixiSilent = createAction<number>('lixi/refreshLixiSilent');
export const refreshLixiSilentSuccess = createAction<{ lixi: Lixi; claims: Claim[] }>('lixi/refreshLixiSilentSuccess');
export const refreshLixiSilentFailure = createAction<string>('lixi/refreshLixiSilentFailure');
export const unarchiveLixi = createAction<UnarchiveLixiCommand>('lixi/unarchiveLixi');
export const unarchiveLixiSuccess = createAction<Lixi>('lixi/unarchiveLixiSuccess');
export const unarchiveLixiFailure = createAction<String>('lixi/unarchiveLixiFailure');
export const archiveLixi = createAction<ArchiveLixiCommand>('lixi/archiveLixi');
export const archiveLixiSuccess = createAction<Lixi>('lixi/archiveLixiSuccess');
export const archiveLixiFailure = createAction<String>('lixi/archiveLixiFailure');
export const withdrawLixi = createAction<WithdrawLixiCommand>('lixi/withdrawLixi');
export const withdrawLixiSuccess = createAction<Lixi>('lixi/withdrawLixiSuccess');
export const withdrawLixiFailure = createAction<String>('lixi/withdrawLixiFailure');
export const setLixiBalance = createAction<number>('lixi/setLixiBalance');
export const setAllLixi = createAction<Lixi>('lixi/setLixi');
export const fetchInitialSubLixies = createAction<number>('lixi/fetchInitialSubLixies');
export const fetchInitialSubLixiesSuccess = createAction<PaginationResult<Lixi>>('lixi/fetchInitialSubLixiesSuccess');
export const fetchInitialSubLixiesFailure = createAction<String>('lixi/fetchInitialSubLixiesFailure');
export const fetchMoreSubLixies = createAction<{ parentId: number; startId: number }>('lixi/fetchMoreSubLixies');
export const fetchMoreSubLixiesSuccess = createAction<PaginationResult<Lixi>>('lixi/fetchMoreSubLixiesSuccess');
export const fetchMoreSubLixiesFailure = createAction<String>('lixi/fetchMoreSubLixiesFailure');
export const exportSubLixies = createAction<ExportLixiCommand>('lixi/exportSubLixies');
export const exportSubLixiesSuccess = createAction<{ fileName: string; lixiId: number; mnemonicHash: string }>(
  'lixi/exportSubLixiesSuccess'
);
export const exportSubLixiesFailure = createAction<string>('lixi/exportSubLixiesFailure');
export const downloadExportedLixi = createAction<DownloadExportedLixiCommand>('lixi/downloadExportedLixi');
export const downloadExportedLixiSuccess = createAction<any>('lixi/downloadExportedLixiSuccess');
export const downloadExportedLixiFailure = createAction<string>('lixi/downloadExportedLixiFailure');
