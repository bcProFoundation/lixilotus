import { createAction } from '@reduxjs/toolkit';
import { WalletStatus } from './models';

export const writeWalletStatus = createAction<WalletStatus>('wallet/writeWalletStatus');
