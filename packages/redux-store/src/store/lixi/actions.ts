import { Account, ExportLixiCommand, LixiDto, PaginationResult, RegisterLixiPackCommand } from '@bcpros/lixi-models';
import { Claim } from '@bcpros/lixi-models/lib/claim';
import {
  ArchiveLixiCommand,
  CreateLixiCommand,
  DownloadExportedLixiCommand,
  GenerateLixiCommand,
  Lixi,
  RenameLixiCommand,
  UnarchiveLixiCommand,
  WithdrawLixiCommand
} from '@bcpros/lixi-models/lib/lixi';
import { createAction } from '@reduxjs/toolkit';

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
export const postLixi = createAction<{ command: CreateLixiCommand; pageId?: string }>('lixi/postLixi');
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
export const unarchiveLixiFailure = createAction<string>('lixi/unarchiveLixiFailure');
export const archiveLixi = createAction<ArchiveLixiCommand>('lixi/archiveLixi');
export const archiveLixiSuccess = createAction<Lixi>('lixi/archiveLixiSuccess');
export const archiveLixiFailure = createAction<string>('lixi/archiveLixiFailure');
export const withdrawLixi = createAction<WithdrawLixiCommand>('lixi/withdrawLixi');
export const withdrawLixiSuccess = createAction<Lixi>('lixi/withdrawLixiSuccess');
export const withdrawLixiFailure = createAction<string>('lixi/withdrawLixiFailure');
export const setLixiBalance = createAction<number>('lixi/setLixiBalance');
export const setAllLixi = createAction<Lixi>('lixi/setLixi');
export const fetchInitialSubLixies = createAction<number>('lixi/fetchInitialSubLixies');
export const fetchInitialSubLixiesSuccess = createAction<PaginationResult<Lixi>>('lixi/fetchInitialSubLixiesSuccess');
export const fetchInitialSubLixiesFailure = createAction<string>('lixi/fetchInitialSubLixiesFailure');
export const fetchMoreSubLixies = createAction<{ parentId: number; startId: number }>('lixi/fetchMoreSubLixies');
export const fetchMoreSubLixiesSuccess = createAction<PaginationResult<Lixi>>('lixi/fetchMoreSubLixiesSuccess');
export const fetchMoreSubLixiesFailure = createAction<string>('lixi/fetchMoreSubLixiesFailure');
export const exportSubLixies = createAction<ExportLixiCommand>('lixi/exportSubLixies');
export const exportSubLixiesSuccess = createAction<{ fileName: string; lixiId: number; mnemonicHash: string }>(
  'lixi/exportSubLixiesSuccess'
);
export const exportSubLixiesFailure = createAction<string>('lixi/exportSubLixiesFailure');
export const downloadExportedLixi = createAction<DownloadExportedLixiCommand>('lixi/downloadExportedLixi');
export const downloadExportedLixiSuccess = createAction<any>('lixi/downloadExportedLixiSuccess');
export const downloadExportedLixiFailure = createAction<string>('lixi/downloadExportedLixiFailure');
export const registerLixiPack = createAction<RegisterLixiPackCommand>('lixi/registerLixiPack');
export const registerLixiPackSuccess = createAction<Account>('lixi/registerLixiPackSuccess');
export const registerLixiPackFailure = createAction<string>('lixi/registerLixiPackFailure');
