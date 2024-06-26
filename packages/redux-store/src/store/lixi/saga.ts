import {
  Account,
  AccountDto,
  Claim,
  ExportLixiCommand,
  PaginationResult,
  PostLixiResponseDto,
  RegisterLixiPackCommand
} from '@bcpros/lixi-models';
import { UPLOAD_TYPES } from '@bcpros/lixi-models/constants';
import {
  ArchiveLixiCommand,
  CreateLixiCommand,
  DownloadExportedLixiCommand,
  GenerateLixiCommand,
  Lixi,
  LixiDto,
  RenameLixiCommand,
  UnarchiveLixiCommand,
  WithdrawLixiCommand
} from '@bcpros/lixi-models/lib/lixi';
import { all, fork, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { removeUpload } from '@store/account/actions';
import { getAccountById } from '@store/account/selectors';
import { generateRandomBase58Str } from '@utils/encryptionMethods';
import { Modal } from 'antd';
import { push } from 'connected-next-router';
import { saveAs } from 'file-saver';
import * as _ from 'lodash';
import moment from 'moment';
import intl from 'react-intl-universal';
import * as Effects from 'redux-saga/effects';
import { select } from 'redux-saga/effects';
import { put as putEffect } from 'redux-saga/effects';
import claimApi from '../claim/api';
import { hideLoading, showLoading } from '../loading/actions';
import { showToast } from '../toast/actions';
import { api as pageMessageApi } from '@store/message/pageMessageSession.api';
import {
  archiveLixi,
  archiveLixiFailure,
  archiveLixiSuccess,
  downloadExportedLixi,
  downloadExportedLixiFailure,
  downloadExportedLixiSuccess,
  exportSubLixies,
  exportSubLixiesFailure,
  exportSubLixiesSuccess,
  fetchInitialSubLixies,
  fetchInitialSubLixiesFailure,
  fetchInitialSubLixiesSuccess,
  fetchMoreSubLixies,
  fetchMoreSubLixiesFailure,
  fetchMoreSubLixiesSuccess,
  generateLixi,
  getLixi,
  getLixiFailure,
  getLixiSuccess,
  postLixi,
  postLixiFailure,
  postLixiSuccess,
  refreshLixi,
  refreshLixiFailure,
  refreshLixiSilent,
  refreshLixiSilentFailure,
  refreshLixiSilentSuccess,
  refreshLixiSuccess,
  registerLixiPack,
  registerLixiPackFailure,
  registerLixiPackSuccess,
  renameLixi,
  renameLixiFailure,
  renameLixiSuccess,
  selectLixi,
  selectLixiFailure,
  selectLixiSuccess,
  setLixi,
  unarchiveLixi,
  unarchiveLixiFailure,
  unarchiveLixiSuccess,
  withdrawLixi,
  withdrawLixiFailure,
  withdrawLixiSuccess
} from './actions';
import lixiApi from './api';
import { getLixiById } from './selectors';
import { CreatePageMessageInput } from '@generated/types.generated';

const call: any = Effects.call;
/**
 * Generate a lixi with random encryption password
 * @param action The data to needed generate a lixi
 */
function* generateLixiSaga(action: PayloadAction<GenerateLixiCommand>) {
  const command = action.payload;

  const password = generateRandomBase58Str(8);
  const mnemonic = command.mnemonic;

  const createLixiCommand: CreateLixiCommand = {
    name: command.name,
    accountId: command.accountId,
    maxClaim: Number(command.maxClaim),
    expiryAt: command && command.expiryAt ? new Date(command.expiryAt) : undefined,
    activationAt: command && command.activationAt ? new Date(command.activationAt) : undefined,
    claimType: command.claimType,
    lixiType: command.lixiType,
    minValue: Number(command.minValue),
    maxValue: Number(command.maxValue),
    fixedValue: Number(command.fixedValue),
    dividedValue: Number(command.dividedValue),
    amount: Number(command.amount),
    numberOfSubLixi: Number(command.numberOfSubLixi),
    numberLixiPerPackage: command.shouldGroupToPackage ? Number(command.numberLixiPerPackage) : undefined,
    minStaking: Number(command.minStaking),
    country: command && command.country ? command.country : undefined,
    networkType: command.networkType,
    isFamilyFriendly: command.isFamilyFriendly,
    isNFTEnabled: command.isNFTEnabled,
    password: password,
    mnemonic: mnemonic,
    mnemonicHash: command.mnemonicHash,
    envelopeId: command.envelopeId,
    envelopeMessage: command.envelopeMessage ?? '',
    uploadId: command.upload ? command.upload.id : null,
    staffAddress: command.staffAddress,
    charityAddress: command.charityAddress,
    joinLotteryProgram: command.joinLotteryProgram
  };

  yield put(postLixi({ command: createLixiCommand, pageId: command.pageId }));
}

/**
 * Saga to get the lixi from api by id
 * @param {id} action The id of the lixi to get.
 */
function* getLixiSaga(action: PayloadAction<number>) {
  try {
    const id = action.payload;
    const account: AccountDto = yield select(getAccountById(id));
    const data = yield call(lixiApi.getById, id, account?.secret);
    yield put(getLixiSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('lixi.couldNotFetchLixi');
    yield put(getLixiFailure(message));
  }
}

function* getLixiFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('lixi.unableGetLixi');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
}

function* fetchInitialSubLixiesSaga(action: PayloadAction<number>) {
  try {
    const id = action.payload;
    const parentLixi: LixiDto = yield select(getLixiById(id));
    const account: AccountDto = yield select(getAccountById(parentLixi.accountId));
    const subLixiResult: PaginationResult<Lixi> = yield call(lixiApi.getSubLixies, id, account?.secret);
    yield put(fetchInitialSubLixiesSuccess(subLixiResult));
  } catch (err) {
    console.error(err);
    const message = (err as Error).message ?? intl.get('lixi.couldNotFetchLixi');
    yield put(getLixiFailure(message));
  }
}

function* fetchInitialSubLixiesSuccessSaga(action: PayloadAction<Lixi[]>) {}

function* fetchInitialSubLixiesFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('lixi.unableGetChildLixi');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
}

function* fetchMoreSubLixiesSaga(action: PayloadAction<{ parentId: number; startId: number }>) {
  try {
    const { parentId, startId } = action.payload;
    const parentLixi: LixiDto = yield select(getLixiById(parentId));
    const account: AccountDto = yield select(getAccountById(parentLixi.accountId));
    const subLixiResult: PaginationResult<Lixi> = yield call(lixiApi.getSubLixies, parentId, account?.secret, startId);
    yield put(fetchMoreSubLixiesSuccess(subLixiResult));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('lixi.couldNotFetchLixi');
    yield put(getLixiFailure(message));
  }
}

function* fetchMoreSubLixiesSuccessSaga(action: PayloadAction<Lixi[]>) {}

function* fetchMoreSubLixiesFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('lixi.unableCreateChildLixi');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
}

function* postLixiSaga(action: PayloadAction<{ command: CreateLixiCommand; pageId?: string }>) {
  try {
    const { command, pageId } = action.payload;

    yield put(showLoading(postLixi.type));

    const dataApi: CreateLixiCommand = {
      ...command
    };

    const data: PostLixiResponseDto = yield call(lixiApi.post, dataApi);

    if (_.isNil(data) || _.isNil(data.lixi) || _.isNil(data.lixi.id)) {
      throw new Error(intl.get('lixi.unableCreateLixi'));
    }

    const lixi = data.lixi;
    const account: AccountDto = yield select(getAccountById(lixi.accountId));

    if (!_.isNil(pageId)) {
      const input: CreatePageMessageInput = {
        accountId: lixi.accountId,
        pageId: pageId,
        lixiId: lixi.id,
        accountSecret: account.secret
      };
      const promise = yield putEffect(
        pageMessageApi.endpoints.CreatePageMessageSession.initiate({
          input: input
        })
      );
      yield promise;

      const promiseToRefetch = yield putEffect(
        pageMessageApi.endpoints.UserHadMessageToPage.initiate(
          {
            accountId: account.id,
            pageId: pageId
          },
          { subscribe: false, forceRefetch: true }
        )
      );
      yield promiseToRefetch;
    }

    yield put(postLixiSuccess(lixi));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('lixi.couldNotPostLixi');
    yield put(postLixiFailure(message));
  }
}

function* registerLixiPackSaga(action: PayloadAction<any>) {
  try {
    const command = action.payload;

    yield put(showLoading(registerLixiPack.type));

    const dataApi: RegisterLixiPackCommand = {
      ...command
    };

    const data: Lixi[] = yield call(lixiApi.registerLixiPack, dataApi);
    if (_.isNil(data)) {
      throw new Error(intl.get('lixi.unableRegisterLixiPack'));
    }
    if (data) {
      yield put(registerLixiPackSuccess(dataApi.account));
    }
  } catch (err) {
    const message = (err as Error).message ?? intl.get('lixi.unableRegisterLixiPack');
    yield put(registerLixiPackFailure(message));
  }
}

function* registerLixiPackSuccessSaga(action: PayloadAction<Account>) {
  Modal.success({
    content: intl.get('lixi.registerSuccess')
  });
  yield put(hideLoading(registerLixiPack.type));
}

function* registerLixiPackFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('lixi.unableRegisterLixiPack');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
  yield put(hideLoading(registerLixiPack.type));
}

function* postLixiSuccessSaga(action: PayloadAction<Lixi>) {
  try {
    const lixi: any = action.payload;

    // Calculate
    yield put(
      showToast('success', {
        message: 'Success',
        description: intl.get('lixi.createLixiSuccessful'),
        duration: 5
      })
    );
    yield put(removeUpload({ type: UPLOAD_TYPES.ENVELOPE }));
    yield put(selectLixi(lixi.id));
  } catch (error) {
    const message = intl.get('lixi.errorWhenCreateLixi');
    yield put(postLixiFailure(message));
  }
}

function* postLixiFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('lixi.unableCreateLixiServer');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
  yield put(hideLoading(postLixi.type));
}

function* refreshLixiSaga(action: PayloadAction<number>) {
  try {
    const lixiId = action.payload;
    const selectedLixi: LixiDto = yield select(getLixiById(lixiId));
    const account: AccountDto = yield select(getAccountById(selectedLixi.accountId));
    yield put(showLoading(refreshLixi.type));
    const lixi: Lixi = yield call(lixiApi.getById, lixiId, account?.secret);
    const claimResult: PaginationResult<Claim> = yield call(claimApi.getByLixiId, lixiId);
    const claims = (claimResult.data ?? []) as Claim[];
    yield put(refreshLixiSuccess({ lixi: lixi, claims: claims }));
    yield put(fetchInitialSubLixies(lixi.id));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('lixi.unableRefresh');
    yield put(refreshLixiFailure(message));
  }
}

function* refreshLixiSuccessSaga(action: PayloadAction<{ lixi: Lixi; children: Lixi[]; claims: Claim[] }>) {
  yield put(
    showToast('success', {
      message: 'Success',
      description: intl.get('lixi.refreshSuccess'),
      duration: 5
    })
  );
  yield put(hideLoading(refreshLixi.type));
}

function* refreshLixiFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('lixi.unableRefresh');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
  yield put(hideLoading(refreshLixi.type));
}

function* refreshLixiSilentSaga(action: PayloadAction<number>) {
  try {
    const lixiId = action.payload;
    const selectedLixi: LixiDto = yield select(getLixiById(lixiId));
    const account: AccountDto = yield select(getAccountById(selectedLixi.accountId));
    const lixi: Lixi = yield call(lixiApi.getById, lixiId, account?.secret);
    const claimResult: PaginationResult<Claim> = yield call(claimApi.getByLixiId, lixiId);
    const claims = (claimResult.data ?? []) as Claim[];
    yield put(refreshLixiSilentSuccess({ lixi: lixi, claims: claims }));
    yield put(fetchInitialSubLixies(lixi.id));
  } catch (err) {
    yield put(refreshLixiSilentFailure(''));
  }
}

function* setLixiSaga(action: PayloadAction<Lixi>) {
  const lixi: any = action.payload;
  yield put(push(`/lixi/${lixi.id}`));
  yield put(refreshLixiSilent(lixi.id));
}

function* selectLixiSaga(action: PayloadAction<number>) {
  try {
    const lixiId = action.payload;
    const selectedLixi: LixiDto = yield select(getLixiById(lixiId));
    const account: AccountDto = yield select(getAccountById(selectedLixi.accountId));
    yield put(showLoading(selectLixi.type));
    const lixi: Lixi = yield call(lixiApi.getById, lixiId, account?.secret);
    const claimResult: PaginationResult<Claim> = yield call(claimApi.getByLixiId, lixiId);
    const claims = (claimResult.data ?? []) as Claim[];
    yield put(selectLixiSuccess({ lixi: lixi, claims: claims }));
    if (lixi.numberOfSubLixi > 0 && lixi.numberOfSubLixi) yield put(fetchInitialSubLixies(lixi.id));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('lixi.unableSelect');
    yield put(selectLixiFailure(message));
  }
}

function* selectLixiSuccessSaga(action: PayloadAction<any>) {
  const { lixi } = action.payload;
  yield put(refreshLixiSilent(lixi.id));
  yield put(hideLoading(selectLixi.type));
  // yield put(push(`/lixi/${lixi.id}`)); Dont need to push here
}

function* selectLixiFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('lixi.unableSelect');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
  yield put(hideLoading(selectLixi.type));
}

function* unarchiveLixiSaga(action: PayloadAction<UnarchiveLixiCommand>) {
  try {
    const command = action.payload;

    const dataApi: UnarchiveLixiCommand = {
      ...command
    };

    const data = yield call(lixiApi.unarchiveLixi, command.id, dataApi);
    const lixi = data as Lixi;

    if (_.isNil(data) || _.isNil(data.id)) {
      throw new Error(intl.get('lixi.unableUnlock'));
    }
    yield put(unarchiveLixiSuccess(lixi));
  } catch (error) {
    const message = intl.get('lixi.errorWhenUnlock');
    yield put(unarchiveLixiFailure(message));
  }
}

function* unarchiveLixiSuccessSaga(action: PayloadAction<Lixi>) {
  yield put(
    showToast('success', {
      message: 'Success',
      description: intl.get('lixi.unlockSuccess'),
      duration: 5
    })
  );
  yield put(hideLoading(unarchiveLixiSuccess.type));
}

function* unarchiveLixiFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('lixi.unableUnlock');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
  yield put(hideLoading(unarchiveLixiFailure.type));
}

function* archiveLixiSaga(action: PayloadAction<ArchiveLixiCommand>) {
  try {
    const command = action.payload;

    const dataApi: ArchiveLixiCommand = {
      ...command
    };

    const data = yield call(lixiApi.archiveLixi, command.id, dataApi);
    const lixi = data as Lixi;

    if (_.isNil(data) || _.isNil(data.id)) {
      throw new Error(intl.get('lixi.unableLock'));
    }

    yield put(archiveLixiSuccess(lixi));
  } catch (error) {
    const message = intl.get('lixi.errorWhenLock');
    yield put(postLixiFailure(message));
  }
}

function* archiveLixiSuccessSaga(action: PayloadAction<Lixi>) {
  yield put(
    showToast('success', {
      message: 'Success',
      description: intl.get('lixi.lockSuccess'),
      duration: 5
    })
  );
  yield put(hideLoading(archiveLixiSuccess.type));
}

function* archiveLixiFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('lixi.unableLock');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
  yield put(hideLoading(archiveLixiFailure.type));
}

function* withdrawLixiSaga(action: PayloadAction<WithdrawLixiCommand>) {
  try {
    const command = action.payload;

    const dataApi: WithdrawLixiCommand = {
      ...command
    };

    const data: PostLixiResponseDto = yield call(lixiApi.withdrawLixi, command.id, dataApi);

    if (_.isNil(data) || _.isNil(data.lixi.id)) {
      throw new Error(intl.get('lixi.unableWithdraw'));
    }

    const lixi = data.lixi;
    yield put(withdrawLixiSuccess(lixi));
  } catch (error) {
    const message = (error as Error).message ?? intl.get('lixi.errorWhenWithdraw');
    yield put(withdrawLixiFailure(message));
  }
}

function* withdrawLixiSuccessSaga(action: PayloadAction<Lixi>) {
  yield put(
    showToast('success', {
      message: 'Success',
      description: intl.get('lixi.withdrawSuccess'),
      duration: 5
    })
  );
  yield put(hideLoading(withdrawLixiSuccess.type));
}

function* withdrawLixiFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('lixi.unableRename');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
  yield put(hideLoading(withdrawLixiFailure.type));
}

function* renameLixiSaga(action: PayloadAction<RenameLixiCommand>) {
  try {
    yield put(showLoading(renameLixi.type));
    const { id } = action.payload;
    const data = yield call(lixiApi.renameLixi, id, action.payload);
    const lixi = data as Lixi;
    yield put(renameLixiSuccess(lixi));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('lixi.unableRename');
    yield put(renameLixiFailure(message));
  }
}

function* renameLixiSuccessSaga(action: PayloadAction<Lixi>) {
  const lixi = action.payload;
  yield put(hideLoading(renameLixi.type));
  Modal.success({
    content: intl.get('lixi.renameSuccess', { lixiName: lixi.name })
  });
}

function* renameLixiFailureSaga(action: PayloadAction<string>) {
  Modal.error({
    content: intl.get('lixi.renameFailed')
  });
  yield put(hideLoading(renameLixi.type));
}

function* exportSubLixiesSaga(action: PayloadAction<ExportLixiCommand>) {
  try {
    const { id } = action.payload;
    const command = action.payload;
    const parentLixi: LixiDto = yield select(getLixiById(id));
    const account: AccountDto = yield select(getAccountById(parentLixi.accountId));
    const data = yield call(lixiApi.exportSubLixies, id, command, account?.secret);
    yield put(
      exportSubLixiesSuccess({ fileName: data.fileName, lixiId: parentLixi.id, mnemonicHash: account?.mnemonicHash })
    );
  } catch (err) {
    const message = (err as Error).message ?? intl.get('lixi.unableExportSub');
    yield put(exportSubLixiesFailure(message));
  }
}

function* exportSubLixiesSuccessSaga(action: PayloadAction<DownloadExportedLixiCommand>) {
  yield put(hideLoading(exportSubLixies.type));
}

function* exportSubLixiesFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('lixi.unableExportSub');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
  yield put(hideLoading(exportSubLixies.type));
}

function* downloadExportedLixiSaga(action: PayloadAction<DownloadExportedLixiCommand>) {
  try {
    const data = yield call(lixiApi.downloadExportedLixi, action.payload);
    const parentLixi: LixiDto = yield select(getLixiById(action.payload.lixiId));
    yield put(downloadExportedLixiSuccess({ data: data, lixiName: parentLixi.name }));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('lixi.unableDownloadSub');
    yield put(downloadExportedLixiFailure(message));
  }
}

function* downloadExportedLixiSuccessSaga(action: PayloadAction<any>) {
  const { data, lixiName } = action.payload;

  const name = lixiName.replace(/\s/g, '').toLowerCase();
  const timestamp = moment().format('YYYYMMDD_HHmmss');
  const fileName = `${name}_SubLixiList_${timestamp}.csv`;

  const blob = new Blob([data], { type: 'text/csv' });
  saveAs(blob, fileName);

  yield put(hideLoading(downloadExportedLixi.type));
}

function* downloadExportedLixiFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('lixi.unableDownloadSub');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
  yield put(hideLoading(downloadExportedLixi.type));
}

function* watchGenerateLixi() {
  yield takeLatest(generateLixi.type, generateLixiSaga);
}

function* watchGetLixi() {
  yield takeLatest(getLixi.type, getLixiSaga);
}

function* watchGetLixiFailure() {
  yield takeLatest(getLixiFailure.type, getLixiFailureSaga);
}

function* watchFetchInitialSubLixies() {
  yield takeLatest(fetchInitialSubLixies.type, fetchInitialSubLixiesSaga);
}

function* watchFetchInitialSubLixiesSuccess() {
  yield takeLatest(fetchInitialSubLixiesSuccess.type, fetchInitialSubLixiesSuccessSaga);
}

function* watchFetchInitialSubLixiesFailure() {
  yield takeLatest(fetchInitialSubLixiesFailure.type, fetchInitialSubLixiesFailureSaga);
}

function* watchFetchMoreSubLixies() {
  yield takeLatest(fetchMoreSubLixies.type, fetchMoreSubLixiesSaga);
}

function* watchFetchMoreSubLixiesSuccess() {
  yield takeLatest(fetchMoreSubLixiesSuccess.type, fetchMoreSubLixiesSuccessSaga);
}

function* watchFetchMoreSubLixiesFailure() {
  yield takeLatest(fetchMoreSubLixiesFailure.type, fetchMoreSubLixiesFailureSaga);
}

function* watchPostLixi() {
  yield takeLatest(postLixi.type, postLixiSaga);
}

function* watchPostLixiSuccess() {
  yield takeLatest(postLixiSuccess.type, postLixiSuccessSaga);
}

function* watchPostLixiFailure() {
  yield takeLatest(postLixiFailure.type, postLixiFailureSaga);
}

function* watchSetLixi() {
  yield takeLatest(setLixi.type, setLixiSaga);
}

function* watchSelectLixi() {
  yield takeLatest(selectLixi.type, selectLixiSaga);
}

function* watchSelectLixiSuccess() {
  yield takeLatest(selectLixiSuccess.type, selectLixiSuccessSaga);
}

function* watchSelectLixiFailure() {
  yield takeLatest(selectLixiFailure.type, selectLixiFailureSaga);
}

function* watchRefreshLixi() {
  yield takeLatest(refreshLixi.type, refreshLixiSaga);
}

function* watchRefreshLixiSuccess() {
  yield takeLatest(refreshLixiSuccess.type, refreshLixiSuccessSaga);
}

function* watchRefreshLixiFailure() {
  yield takeLatest(refreshLixiFailure.type, refreshLixiFailureSaga);
}

function* watchRefreshLixiSilent() {
  yield takeLatest(refreshLixiSilent.type, refreshLixiSilentSaga);
}

function* watchArchiveLixi() {
  yield takeLatest(archiveLixi.type, archiveLixiSaga);
}

function* watchArchiveLixiSuccess() {
  yield takeLatest(archiveLixiSuccess.type, archiveLixiSuccessSaga);
}

function* watchArchiveLixiFailure() {
  yield takeLatest(archiveLixiFailure.type, archiveLixiFailureSaga);
}

function* watchUnarchiveLixi() {
  yield takeLatest(unarchiveLixi.type, unarchiveLixiSaga);
}

function* watchUnarchiveLixiSuccess() {
  yield takeLatest(unarchiveLixiSuccess.type, unarchiveLixiSuccessSaga);
}

function* watchUnarchiveLixiFailure() {
  yield takeLatest(unarchiveLixiFailure.type, unarchiveLixiFailureSaga);
}

function* watchWithdrawLixi() {
  yield takeLatest(withdrawLixi.type, withdrawLixiSaga);
}

function* watchWithdrawLixiSuccess() {
  yield takeLatest(withdrawLixiSuccess.type, withdrawLixiSuccessSaga);
}

function* watchWithdrawLixiFailure() {
  yield takeLatest(withdrawLixiFailure.type, withdrawLixiFailureSaga);
}

function* watchRenameLixi() {
  yield takeLatest(renameLixi.type, renameLixiSaga);
}

function* watchRenameLixiSuccess() {
  yield takeLatest(renameLixiSuccess.type, renameLixiSuccessSaga);
}

function* watchRenameLixiFailure() {
  yield takeLatest(renameLixiFailure.type, renameLixiFailureSaga);
}

function* watchExportSubLixies() {
  yield takeLatest(exportSubLixies.type, exportSubLixiesSaga);
}

function* watchExportSubLixiesFailure() {
  yield takeLatest(exportSubLixiesFailure.type, exportSubLixiesFailureSaga);
}

function* watchExportSubLixiesSuccess() {
  yield takeLatest(exportSubLixiesSuccess.type, exportSubLixiesSuccessSaga);
}

function* watchDownloadExportedLixi() {
  yield takeLatest(downloadExportedLixi.type, downloadExportedLixiSaga);
}

function* watchDownloadExportedLixiFailure() {
  yield takeLatest(downloadExportedLixiFailure.type, downloadExportedLixiFailureSaga);
}

function* watchDownloadExportedLixiSuccess() {
  yield takeLatest(downloadExportedLixiSuccess.type, downloadExportedLixiSuccessSaga);
}

function* watchRegisterLixiPack() {
  yield takeLatest(registerLixiPack.type, registerLixiPackSaga);
}

function* watchRegisterLixiPackSuccess() {
  yield takeLatest(registerLixiPackSuccess.type, registerLixiPackSuccessSaga);
}

function* watchRegisterLixiPackFailure() {
  yield takeLatest(registerLixiPackFailure.type, registerLixiPackFailureSaga);
}

export default function* lixiSaga() {
  yield all([
    fork(watchGenerateLixi),
    fork(watchGetLixi),
    fork(watchGetLixiFailure),
    fork(watchFetchInitialSubLixies),
    fork(watchFetchInitialSubLixiesSuccess),
    fork(watchFetchInitialSubLixiesFailure),
    fork(watchFetchMoreSubLixies),
    fork(watchFetchMoreSubLixiesSuccess),
    fork(watchFetchMoreSubLixiesFailure),
    fork(watchPostLixi),
    fork(watchPostLixiFailure),
    fork(watchPostLixiSuccess),
    fork(watchSetLixi),
    fork(watchSelectLixi),
    fork(watchSelectLixiSuccess),
    fork(watchSelectLixiFailure),
    fork(watchRefreshLixi),
    fork(watchRefreshLixiSuccess),
    fork(watchRefreshLixiFailure),
    fork(watchRefreshLixiSilent),
    fork(watchArchiveLixi),
    fork(watchArchiveLixiSuccess),
    fork(watchArchiveLixiFailure),
    fork(watchUnarchiveLixi),
    fork(watchUnarchiveLixiSuccess),
    fork(watchUnarchiveLixiFailure),
    fork(watchWithdrawLixi),
    fork(watchWithdrawLixiSuccess),
    fork(watchWithdrawLixiFailure),
    fork(watchRenameLixi),
    fork(watchRenameLixiSuccess),
    fork(watchRenameLixiFailure),
    fork(watchExportSubLixies),
    fork(watchExportSubLixiesSuccess),
    fork(watchExportSubLixiesFailure),
    fork(watchDownloadExportedLixi),
    fork(watchDownloadExportedLixiFailure),
    fork(watchDownloadExportedLixiSuccess),
    fork(watchRegisterLixiPack),
    fork(watchRegisterLixiPackSuccess),
    fork(watchRegisterLixiPackFailure)
  ]);
}
