import { Account, AccountDto, CreateAccountDto, GenerateAccountDto } from "@abcpros/givegift-models/src/lib/account";
import { PayloadAction } from "@reduxjs/toolkit";
import { aesGcmEncrypt, generateRandomBase62Str } from "@utils/encryptionMethods";
import { call, getContext, put } from "redux-saga/effects";
import { postAccount } from "./actions";
import accountApi from "./api";


/**
 * Generate a account with random encryption password
 * @param action The data to needed generate a account
 */
function* generateAccountSaga(action: PayloadAction<GenerateAccountDto>) {
  const XPI = yield getContext('XPI');
  const accountDto = action.payload;
  const lang = 'english';
  const Bip39128BitMnemonic = XPI.Mnemonic.generate(128, XPI.Mnemonic.wordLists()[lang]);
  const wallet = XPI.Mnemonic.getWalletDetails({
    mnemonic: Bip39128BitMnemonic.toString(),
  });

  const account: Account = {
    id: 0,
    name: accountDto.name,
    encryptedMnemonic: wallet['mneonic']
  };
  
  yield put(postAccount(account));
}

function* postAccountSaga(action: PayloadAction<Account>) {
  try {
    const account = action.payload;

    const dataApi: CreateAccountDto = {
      name: account.name,
      encryptedMnemonic: account.encryptedMnemonic
    }

    const data: AccountDto = yield call(accountApi.post, dataApi);

    // Merge back to action payload
    const result = { ...account, ...data } as Account;
    // yield put(postAccountSuccess(result));

  } catch (err) {
    const message = (err as Error).message ?? `Could not post the vault to the api.`;
    // yield put(postVaultFailure(message));
  }
}