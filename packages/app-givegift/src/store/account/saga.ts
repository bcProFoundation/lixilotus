
import { PayloadAction } from "@reduxjs/toolkit";
import { all, call, getContext, put, takeLatest, fork } from "redux-saga/effects";
import { aesGcmEncrypt, generateRandomBase62Str } from "@utils/encryptionMethods";
import { Account, CreateAccountCommand, AccountDto } from "@abcpros/givegift-models/lib/account";
import { postAccount, generateAccount, postAccountSuccess } from "./actions";
import accountApi from "./api";
import BCHJS from "@abcpros/xpi-js";


/**
 * Generate a account with random encryption password
 * @param action The data to needed generate a account
 */
function* generateAccountSaga(action: PayloadAction<any>) {
  const XPI: BCHJS = yield getContext('XPI');
  const lang = 'english';
  const Bip39128BitMnemonic = XPI.Mnemonic.generate(128, XPI.Mnemonic.wordLists()[lang]);

  // Encrypted mnemonic is encrypted by itself
  const encryptedMnemonic: string = yield call(aesGcmEncrypt, Bip39128BitMnemonic, Bip39128BitMnemonic);

  // Hash mnemonic and use it as an id in the database
  const mnemonicUtf8 = new TextEncoder().encode(Bip39128BitMnemonic);              // encode mnemonic as UTF-8
  const mnemonicHashBuffer = yield call([crypto.subtle, crypto.subtle.digest], 'SHA-256', mnemonicUtf8);       // hash the mnemonic
  const mnemonicHash = Buffer.from(new Uint8Array(mnemonicHashBuffer)).toString('hex');

  const name = String(mnemonicHash).substring(0, 5);

  const account: Account = {
    id: 0,
    name,
    mnemonic: Bip39128BitMnemonic,
    encryptedMnemonic,
    mnemonicHash,
  };

  yield put(postAccount(account));
}

function* postAccountSaga(action: PayloadAction<Account>) {
  try {
    const account = action.payload;

    const dataApi: CreateAccountCommand = {
      name: account.name,
      mnemonicHash: account.mnemonicHash,
      encryptedMnemonic: account.encryptedMnemonic
    }

    const data: AccountDto = yield call(accountApi.post, dataApi);

    // Merge back to action payload
    const result = { ...account, ...data } as Account;
    yield put(postAccountSuccess(result));

  } catch (err) {
    const message = (err as Error).message ?? `Could not post the vault to the api.`;
    // yield put(postVaultFailure(message));
  }
}

function* watchGenerateAccount() {
  yield takeLatest(generateAccount.type, generateAccountSaga);
}

function* watchPostAccount() {
  yield takeLatest(postAccount.type, postAccountSaga);
}

export default function* accountSaga() {
  yield all([
    fork(watchGenerateAccount),
    fork(watchPostAccount)
  ]);
}