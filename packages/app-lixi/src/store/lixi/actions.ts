import { createAction } from '@reduxjs/toolkit';
import { GenerateLixiCommand, CreateLixiCommand, Lixi, UnlockLixiCommand, LockLixiCommand, WithdrawLixiCommand, RenameLixiCommand } from '@bcpros/lixi-models/lib/lixi';
import { Claim } from '@bcpros/lixi-models/lib/claim';

export const getLixiActionType = 'lixi/getLixi';
export const postLixiActionType = 'lixi/postLixi';
export const refreshLixiActionType = 'lixi/refreshLixi';


export const generateLixi = createAction<GenerateLixiCommand>('lixi/generateLixi');
export const getLixi = createAction<number>('lixi/getLixi');
export const getLixiSuccess = createAction<Lixi>('lixi/getLixiSuccess');
export const getLixiFailure = createAction<string>('lixi/getLixiFailure');
export const getSubLixi = createAction<number>('lixi/getSubLixi');
export const getSubLixiSuccess = createAction<Lixi[]>('lixi/getSubLixiSuccess');
export const renameLixi = createAction<RenameLixiCommand>('lixi/renameLixi');
export const renameLixiSuccess = createAction<Lixi>('lixi/renameLixiSuccess');
export const renameLixiFailure = createAction<string>('lixi/renameLixiFailure');
export const postLixi = createAction<CreateLixiCommand>('lixi/postLixi');
export const postLixiSuccess = createAction<Lixi>('lixi/postLixiSuccess');
export const postLixiFailure = createAction<string>('lixi/postLixiFailure');
export const setLixi = createAction<Lixi>('lixi/setLixi');
export const selectLixi = createAction<number>('lixi/selectLixi');
export const selectLixiSuccess = createAction<{ lixi: Lixi, children: Lixi[], claims: Claim[] }>('lixi/selectLixiSuccess');
export const selectLixiFailure = createAction<string>('lixi/selectLixiFailure');
export const refreshLixi = createAction<number>('lixi/refreshLixi');
export const refreshLixiSuccess = createAction<{ lixi: Lixi, children: Lixi[], claims: Claim[] }>('lixi/refreshLixiSuccess');
export const refreshLixiFailure = createAction<string>('lixi/refreshLixiFailure');
export const unlockLixi = createAction<UnlockLixiCommand>('lixi/unlockLixi');
export const unlockLixiSuccess = createAction<Lixi>('lixi/unlockLixiSuccess');
export const unlockLixiFailure = createAction<String>('lixi/unlockLixiFailure');
export const lockLixi = createAction<LockLixiCommand>('lixi/lockLixi');
export const lockLixiSuccess = createAction<Lixi>('lixi/lockLixiSuccess');
export const lockLixiFailure = createAction<String>('lixi/lockLixiFailure');
export const withdrawLixi = createAction<WithdrawLixiCommand>('lixi/withdrawLixi');
export const withdrawLixiSuccess = createAction<Lixi>('lixi/withdrawLixiSuccess');
export const withdrawLixiFailure = createAction<String>('lixi/withdrawLixiFailure');
export const setLixiBalance = createAction<number>('lixi/setLixiBalance');
export const setAllLixi = createAction<Lixi>('lixi/setLixi');