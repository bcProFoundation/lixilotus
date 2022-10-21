import { createAction } from '@reduxjs/toolkit';
import { WalletState } from './state';

export const updateWalletState = createAction<WalletState>('wallet/updateWalletState');
