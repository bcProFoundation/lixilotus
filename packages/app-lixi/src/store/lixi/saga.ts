import { Modal } from 'antd';
import { push } from 'connected-next-router';
import * as _ from 'lodash';
import * as Effects from 'redux-saga/effects';
import intl from 'react-intl-universal';
import { AccountDto, Claim, ExportLixiCommand, PaginationResult, PostLixiResponseDto } from '@bcpros/lixi-models';
import {
  CreateLixiCommand,
  GenerateLixiCommand,
  Lixi,
  LixiDto,
  ArchiveLixiCommand,
  RenameLixiCommand,
  UnarchiveLixiCommand,
  WithdrawLixiCommand,
  DownloadExportedLixiCommand
} from '@bcpros/lixi-models/lib/lixi';
import { all, fork, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { getAccountById } from '@store/account/selectors';
import { generateRandomBase58Str } from '@utils/encryptionMethods';
import claimApi from '../claim/api';
import { hideLoading, showLoading } from '../loading/actions';
import { showToast } from '../toast/actions';
import {
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
  archiveLixi,
  archiveLixiFailure,
  archiveLixiSuccess,
  postLixi,
  postLixiFailure,
  postLixiSuccess,
  refreshLixi,
  refreshLixiActionType,
  refreshLixiFailure,
  refreshLixiSuccess,
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
  withdrawLixiSuccess,
  downloadExportedLixi,
  downloadExportedLixiFailure,
  downloadExportedLixiSuccess,
  uploadCustomEnvelope,
  uploadCustomEnvelopeSuccess,
  uploadCustomEnvelopeFailure
} from './actions';
import lixiApi from './api';
import { getLixiById } from './selectors';
import { select } from 'redux-saga/effects';
import { saveAs } from 'file-saver';
import moment from 'moment';


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
    numberLixiPerPackage: Number(command.numberLixiPerPackage),
    minStaking: Number(command.minStaking),
    country: command && command.country ? command.country : undefined,
    isFamilyFriendly: command.isFamilyFriendly,
    isNFTEnabled: command.isNFTEnabled,
    password: password,
    mnemonic: mnemonic,
    mnemonicHash: command.mnemonicHash,
    envelopeId: command.envelopeId,
    envelopeMessage: command.envelopeMessage ?? ''
  };

  yield put(postLixi(createLixiCommand));
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
    const message = (err as Error).message ?? intl.get('claim.couldNotFetchLixi');
    yield put(getLixiFailure(message));
  }
}

function* getLixiFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('claim.unableGetLixi');
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
    const message = (err as Error).message ?? intl.get('claim.couldNotFetchLixi');
    yield put(getLixiFailure(message));
  }
}

function* fetchInitialSubLixiesSuccessSaga(action: PayloadAction<Lixi[]>) { }

function* fetchInitialSubLixiesFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('claim.unableGetChildLixi');
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
    const message = (err as Error).message ?? intl.get('claim.couldNotFetchLixi');
    yield put(getLixiFailure(message));
  }
}

function* fetchMoreSubLixiesSuccessSaga(action: PayloadAction<Lixi[]>) { }

function* fetchMoreSubLixiesFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('claim.unableCreateChildLixi');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
}

function* postLixiSaga(action: PayloadAction<CreateLixiCommand>) {
  try {
    const command = action.payload;

    yield put(showLoading(postLixi.type));

    const dataApi: CreateLixiCommand = {
      ...command
    };

    const data: PostLixiResponseDto = yield call(lixiApi.post, dataApi);

    if (_.isNil(data) || _.isNil(data.lixi) || _.isNil(data.lixi.id)) {
      throw new Error(intl.get('claim.unableCreateLixi'));
    }

    const lixi = data.lixi;
    yield put(postLixiSuccess(lixi));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('claim.couldNotPostLixi');
    yield put(postLixiFailure(message));
  }
}

function* postLixiSuccessSaga(action: PayloadAction<Lixi>) {
  try {
    const lixi: any = action.payload;

    // Calculate
    yield put(
      showToast('success', {
        message: 'Success',
        description: intl.get('claim.createLixiSuccessful'),
        duration: 5
      })
    );
    yield put(setLixi(lixi));
    yield put(hideLoading(postLixi.type));
  } catch (error) {
    const message = intl.get('claim.errorWhenCreateLixi');
    yield put(postLixiFailure(message));
  }
}

function* postLixiFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('claim.unableCreateLixiServer');
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
    const message = (err as Error).message ?? intl.get('claim.unableRefresh');
    yield put(refreshLixiFailure(message));
  }
}

function* refreshLixiSuccessSaga(action: PayloadAction<{ lixi: Lixi; children: Lixi[]; claims: Claim[] }>) {
  yield put(
    showToast('success', {
      message: 'Success',
      description: intl.get('claim.refreshSuccess'),
      duration: 5
    })
  );
  yield put(hideLoading(refreshLixi.type));
}

function* refreshLixiFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('claim.unableRefresh');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
  yield put(hideLoading(refreshLixi.type));
}

function* setLixiSaga(action: PayloadAction<Lixi>) {
  const lixi: any = action.payload;
  yield put(push('/lixi'));
  yield put(refreshLixi(lixi.id));
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
    yield put(fetchInitialSubLixies(lixi.id));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('claim.unableSelect');
    yield put(selectLixiFailure(message));
  }
}

function* selectLixiSuccessSaga(action: PayloadAction<Lixi>) {
  yield put(hideLoading(selectLixi.type));
  yield put(push('/lixi'));
}

function* selectLixiFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('claim.unableSelect');
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
      throw new Error(intl.get('claim.unableUnlock'));
    }
    yield put(unarchiveLixiSuccess(lixi));
  } catch (error) {
    const message = intl.get('claim.errorWhenUnlock');
    yield put(unarchiveLixiFailure(message));
  }
}

function* unarchiveLixiSuccessSaga(action: PayloadAction<Lixi>) {
  yield put(
    showToast('success', {
      message: 'Success',
      description: intl.get('claim.unlockSuccess'),
      duration: 5
    })
  );
  yield put(hideLoading(unarchiveLixiSuccess.type));
}

function* unarchiveLixiFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('claim.unableUnlock');
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
      throw new Error(intl.get('claim.unableLock'));
    }

    yield put(archiveLixiSuccess(lixi));
  } catch (error) {
    const message = intl.get('claim.errorWhenLock');
    yield put(postLixiFailure(message));
  }
}

function* archiveLixiSuccessSaga(action: PayloadAction<Lixi>) {
  yield put(
    showToast('success', {
      message: 'Success',
      description: intl.get('claim.lockSuccess'),
      duration: 5
    })
  );
  yield put(hideLoading(archiveLixiSuccess.type));
}

function* archiveLixiFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('claim.unableLock');
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
      throw new Error(intl.get('claim.unableWithdraw'));
    }

    const lixi = data.lixi;
    yield put(withdrawLixiSuccess(lixi));
  } catch (error) {
    const message = (error as Error).message ?? intl.get('claim.errorWhenWithdraw');
    yield put(withdrawLixiFailure(message));
  }
}

function* withdrawLixiSuccessSaga(action: PayloadAction<Lixi>) {
  yield put(
    showToast('success', {
      message: 'Success',
      description: intl.get('claim.withdrawSuccess'),
      duration: 5
    })
  );
  yield put(hideLoading(withdrawLixiSuccess.type));
}

function* withdrawLixiFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('claim.unableRename');
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
    const message = (err as Error).message ?? intl.get('claim.unableRename');
    yield put(renameLixiFailure(message));
  }
}

function* renameLixiSuccessSaga(action: PayloadAction<Lixi>) {
  const lixi = action.payload;
  yield put(hideLoading(renameLixi.type));
  Modal.success({
    content: intl.get('claim.unableRename', { lixiName: lixi.name })
  });
}

function* renameLixiFailureSaga(action: PayloadAction<string>) {
  Modal.error({
    content: intl.get('claim.renameFailed')
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
    yield put(exportSubLixiesSuccess({ fileName: data.fileName, lixiId: parentLixi.id, mnemonicHash: account?.mnemonicHash }));
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
    yield put(downloadExportedLixiSuccess({ data:data, lixiName: parentLixi.name }));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('lixi.unableDownloadSub')
    yield put(downloadExportedLixiFailure(message));
  }
}

function* downloadExportedLixiSuccessSaga(action: PayloadAction<any>) {
  const { data, lixiName } = action.payload;

  const name = lixiName.replace(/\s/g, '').toLowerCase();
  var timestamp = moment().format('YYYYMMDD_HHmmss');
  const fileName = `${name}_SubLixiList_${timestamp}.csv`;

  const result = data.replace(/['"]+/g, '')
  var blob = new Blob([result], { type: "text/csv;charset=utf-8" });
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

function* uploadCustomEnvelopeSaga(action: PayloadAction<any>) {
  // try {
  //   const data = yield call(lixiApi.downloadExportedLixi, action.payload);
  //   const parentLixi: LixiDto = yield select(getLixiById(action.payload.lixiId));
  //   yield put(downloadExportedLixiSuccess({ data:data, lixiName: parentLixi.name }));
  // } catch (err) {
  //   const message = (err as Error).message ?? intl.get('lixi.unableDownloadSub')
  //   yield put(downloadExportedLixiFailure(message));
  // }

  console.log(action.payload);
}

function* uploadCustomEnvelopeSuccessSaga(action: PayloadAction<any>) {
  try {
    const data = yield call(lixiApi.downloadExportedLixi, action.payload);
    const parentLixi: LixiDto = yield select(getLixiById(action.payload.lixiId));
    yield put(downloadExportedLixiSuccess({ data:data, lixiName: parentLixi.name }));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('lixi.unableDownloadSub')
    yield put(downloadExportedLixiFailure(message));
  }
}

function* uploadCustomEnvelopeFailureSaga(action: PayloadAction<any>) {
  try {
    const data = yield call(lixiApi.downloadExportedLixi, action.payload);
    const parentLixi: LixiDto = yield select(getLixiById(action.payload.lixiId));
    yield put(downloadExportedLixiSuccess({ data:data, lixiName: parentLixi.name }));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('lixi.unableDownloadSub')
    yield put(downloadExportedLixiFailure(message));
  }
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

function* watchUploadCustomEnvelope() {
  yield takeLatest(uploadCustomEnvelope.type, uploadCustomEnvelopeSaga);
}

function* watchUploadCustomEnvelopeSuccess() {
  yield takeLatest(uploadCustomEnvelopeSuccess.type, uploadCustomEnvelopeSuccessSaga);
}

function* watchUploadCustomEnvelopeFailure() {
  yield takeLatest(uploadCustomEnvelopeFailure.type, uploadCustomEnvelopeFailureSaga);
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
    fork(watchUploadCustomEnvelope),
    fork(watchUploadCustomEnvelopeSuccess),
    fork(watchUploadCustomEnvelopeFailure)
  ]);
}
