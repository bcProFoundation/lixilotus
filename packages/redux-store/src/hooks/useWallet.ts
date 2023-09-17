import BCHJS from '@bcpros/xpi-js';
import { WalletContextValue } from '@context/index';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { xpiReceivedNotificationWebSocket } from '@store/notification/actions';
import {
  activateWallet,
  getAllWalletPaths,
  getSelectedWalletPath,
  getWaletRefreshInterval,
  getWalletHasUpdated,
  getWalletState,
  getWalletStatus,
  getWalletUtxos,
  setWalletHasUpdated,
  setWalletPaths,
  setWalletRefreshInterval,
  WalletPathAddressInfo,
  WalletState,
  WalletStatus,
  writeWalletStatus
} from '@store/wallet';
import { getHashArrayFromWallet, getWalletBalanceFromUtxos } from '@utils/cashMethods';
import {
  getTxHistoryChronik,
  getUtxosChronik,
  Hash160AndAddress,
  organizeUtxosByType,
  parseChronikTx
} from '@utils/chronik';
import isEqualIgnoreUndefined from '@utils/comparision';
import { ChronikClient, SubscribeMsg, Tx, Utxo } from 'chronik-client';
import _, { isEqual } from 'lodash';
import { useEffect, useState } from 'react';
// @ts-ignore
import useInterval from './useInterval';
import useXPI from './useXPI';
import { getAllAccounts } from '@store/account';
import { Account } from '@bcpros/lixi-models';

const chronik = new ChronikClient('https://chronik.be.cash/xpi');
const websocketConnectedRefreshInterval = 10000;

const useWallet = () => {
  // @todo: use constant
  // and consider to move to redux the neccessary variable

  const [chronikWebsocket, setChronikWebsocket] = useState(null);

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [apiIndex, setApiIndex] = useState(0);

  const { getXPI } = useXPI();
  const [XPI, setXPI] = useState<BCHJS>(getXPI(apiIndex));

  const accounts = useAppSelector(getAllAccounts);
  const walletState = useAppSelector(getWalletState);
  const walletRefreshInterval = useAppSelector(getWaletRefreshInterval);
  const walletHasUpdated = useAppSelector(getWalletHasUpdated);
  const allWalletPaths = useAppSelector(getAllWalletPaths);
  const selectedWalletPath = useAppSelector(getSelectedWalletPath);
  const walletUtxos = useAppSelector(getWalletUtxos);
  const dispatch = useAppDispatch();
  const walletStatus = useAppSelector(getWalletStatus);

  const getWalletPathDetails = async (mnemonic: string, paths: string[]): Promise<WalletPathAddressInfo[]> => {
    const NETWORK = process.env.NEXT_PUBLIC_NETWORK;
    const rootSeedBuffer = await XPI.Mnemonic.toSeed(mnemonic);
    let masterHDNode;

    if (NETWORK === `mainnet`) {
      masterHDNode = XPI.HDNode.fromSeed(rootSeedBuffer);
    } else {
      masterHDNode = XPI.HDNode.fromSeed(rootSeedBuffer, 'testnet');
    }

    const walletPaths: WalletPathAddressInfo[] = [];
    for (const path of paths) {
      const walletPath = await deriveAccount(XPI, {
        masterHDNode,
        path: path
      });
      walletPaths.push(walletPath);
    }

    return walletPaths;
  };

  const deriveAccount = async (XPI: BCHJS, { masterHDNode, path }) => {
    const node = XPI.HDNode.derivePath(masterHDNode, path);
    const cashAddress = XPI.HDNode.toCashAddress(node);
    const hash160 = XPI.Address.toHash160(cashAddress);
    const slpAddress = XPI.SLP.Address.toSLPAddress(cashAddress);
    const xAddress = XPI.HDNode.toXAddress(node);
    const publicKey = XPI.HDNode.toPublicKey(node).toString('hex');
    return {
      path,
      xAddress,
      cashAddress,
      slpAddress,
      hash160,
      fundingWif: XPI.HDNode.toWIF(node),
      fundingAddress: XPI.SLP.Address.toSLPAddress(cashAddress),
      legacyAddress: XPI.SLP.Address.toLegacyAddress(cashAddress),
      publicKey
    };
  };

  const validateMnemonic = (mnemonic: string, wordlist = XPI.Mnemonic.wordLists().english): boolean => {
    let mnemonicTestOutput;

    try {
      mnemonicTestOutput = XPI.Mnemonic.validate(mnemonic, wordlist);

      if (mnemonicTestOutput === 'Valid mnemonic') {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const syncAccountsToWallets = async (accounts: Account[], walletPaths: WalletPathAddressInfo[]) => {
    const accountsNotInWallets = _.filter(accounts, (account: Account) => {
      return !_.some(walletPaths, (walletPath: WalletPathAddressInfo) => {
        return walletPath.xAddress === account.address;
      });
    });
    const walletsAlreadySync = _.filter(walletPaths, (walletPath: WalletPathAddressInfo) => {
      return _.some(accounts, (account: Account) => {
        return walletPath.xAddress === account.address;
      });
    });

    // There is an mismatch between accounts and wallets
    if (accountsNotInWallets.length > 0 || walletsAlreadySync.length !== accounts.length) {
      // Then calculate the wallets and dispatch action to save the wallet paths to redux
      const derivedWalletPathsPromises: Array<Promise<WalletPathAddressInfo[]>> = _.map(
        accountsNotInWallets,
        account => {
          const defaultPath = "m/44'/10605'/0'/0/0";
          return getWalletPathDetails(account.mnemonic, [defaultPath]);
        }
      );
      // Calculate the wallet not synced yet
      const walletsPathToSync = (await Promise.all(derivedWalletPathsPromises)).flat();

      dispatch(setWalletPaths([...walletsAlreadySync, ...walletsPathToSync]));
    }
  };

  const haveUtxosChanged = (utxos: Utxo[], previousUtxos: Utxo[]) => {
    // Relevant points for this array comparing exercise
    // https://stackoverflow.com/questions/13757109/triple-equal-signs-return-false-for-arrays-in-javascript-why
    // https://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript

    // If this is initial state
    if (utxos === null) {
      // Then make sure to get slpBalancesAndUtxos
      return true;
    }
    // If this is the first time the wallet received utxos
    if (typeof utxos === 'undefined') {
      // Then they have certainly changed
      return true;
    }
    if (typeof previousUtxos === 'undefined') {
      return true;
    }
    // return true for empty array, since this means you definitely do not want to skip the next API call
    if (utxos && utxos.length === 0) {
      return true;
    }

    // If wallet is valid, compare what exists in written wallet state instead of former api call
    const utxosToCompare = previousUtxos;

    const haveChanged = !_.isEqualWith(utxos, utxosToCompare, isEqualIgnoreUndefined);

    // Compare utxo sets
    return haveChanged;
  };

  // Parse chronik ws message for incoming tx notifications
  const processChronikWsMsg = async (msg: SubscribeMsg, wallet: WalletState) => {
    // get the message type
    const { type } = msg;

    // For now, only act on "first seen" transactions, as the only logic to happen is first seen notifications
    // Dev note: Other chronik msg types
    // "BlockConnected", arrives as new blocks are found
    // "Confirmed", arrives as subscribed + seen txid is confirmed in a block
    if (type !== 'AddedToMempool') {
      return;
    }

    // If you see a tx from your subscribed addresses added to the mempool, then the wallet utxo set has changed
    // Update it
    dispatch(setWalletRefreshInterval(10));

    // get txid info
    const txid = msg.txid;
    let incomingTxDetails: Tx;
    try {
      incomingTxDetails = await chronik.tx(txid);
    } catch (err) {
      // In this case, no notification
      return console.log(`Error in chronik.tx(${txid} while processing an incoming websocket tx`, err);
    }

    // parse tx for notification
    const parsedChronikTx = await parseChronikTx(XPI, chronik, incomingTxDetails, wallet);

    if (parsedChronikTx && parsedChronikTx.incoming) {
      // Notification
      dispatch(xpiReceivedNotificationWebSocket(parsedChronikTx.xpiAmount));
    }
  };

  // Chronik websockets
  const initializeWebsocket = async (wallet: WalletState) => {
    console.log(`Initializing websocket connection for wallet ${wallet}`);

    // @todo: previously we have one wallet, now we have multiple
    const hash160Array = getHashArrayFromWallet(wallet);
    if (!wallet || !hash160Array) {
      return setChronikWebsocket(null);
    }

    // Initialize if not in state
    let ws = chronikWebsocket;
    if (ws === null) {
      console.log('start connect websocket');
      ws = chronik.ws({
        onMessage: (msg: SubscribeMsg) => {
          processChronikWsMsg(msg, wallet);
        },
        onReconnect: e => {
          // Fired before a reconnect attempt is made:
          console.log('Reconnecting websocket, disconnection cause: ', e);
        },
        onConnect: e => {
          console.log(`Chronik websocket connected`, e);
          console.log(
            `Websocket connected, adjusting wallet refresh interval to ${websocketConnectedRefreshInterval / 1000}s`
          );
          setWalletRefreshInterval(websocketConnectedRefreshInterval);
        },
        onError: e => {
          console.log('error', e);
        }
      });

      // Wait for websocket to be connected:
      await ws.waitForOpen();
    } else {
      /*        
      If the websocket connection is not null, initializeWebsocket was called
      because one of the websocket's dependencies changed

      Update the onMessage method to get the latest dependencies (wallet, fiatPrice)
      */
      ws.onMessage = (msg: SubscribeMsg) => {
        processChronikWsMsg(msg, wallet);
      };
    }

    // Check if current subscriptions match current wallet
    let activeSubscriptionsMatchActiveWallet = true;

    const previousWebsocketSubscriptions = ws._subs;
    // If there are no previous subscriptions, then activeSubscriptionsMatchActiveWallet is certainly false
    if (previousWebsocketSubscriptions.length === 0) {
      activeSubscriptionsMatchActiveWallet = false;
    } else {
      const subscribedHash160Array = previousWebsocketSubscriptions.map(function (subscription) {
        return subscription.scriptPayload;
      });
      // Confirm that websocket is subscribed to every address in wallet hash160Array
      for (let i = 0; i < hash160Array.length; i += 1) {
        if (!subscribedHash160Array.includes(hash160Array[i])) {
          activeSubscriptionsMatchActiveWallet = false;
        }
      }
    }

    // If you are already subscribed to the right addresses, exit here
    // You get to this situation if fiatPrice changed but wallet.mnemonic did not
    if (activeSubscriptionsMatchActiveWallet) {
      // Put connected websocket in state
      return setChronikWebsocket(ws);
    }

    // Unsubscribe to any active subscriptions
    if (previousWebsocketSubscriptions.length > 0) {
      for (let i = 0; i < previousWebsocketSubscriptions.length; i += 1) {
        const unsubHash160 = previousWebsocketSubscriptions[i].scriptPayload;
        ws.unsubscribe('p2pkh', unsubHash160);
      }
    }

    // Subscribe to addresses of current wallet
    for (let i = 0; i < hash160Array.length; i += 1) {
      ws.subscribe('p2pkh', hash160Array[i]);
    }

    // Put connected websocket in state
    return setChronikWebsocket(ws);
  };

  const update = async (wallet: WalletState) => {
    // Check if walletRefreshInterval is set to 10, i.e. this was called by websocket tx detection
    // If walletRefreshInterval is 10, set it back to the usual refresh rate
    if (walletRefreshInterval === 10) {
      dispatch(setWalletRefreshInterval(websocketConnectedRefreshInterval));
    }
    try {
      if (!wallet) {
        return;
      }

      const hash160AndAddressObjArray: Hash160AndAddress[] = [selectedWalletPath].map(item => {
        return {
          address: item.xAddress,
          hash160: item.hash160
        };
      });

      const chronikUtxos = await getUtxosChronik(chronik, hash160AndAddressObjArray);

      // Need to call wToUpdateith wallet as a parameter rather than trusting it is in state, otherwise can sometimes get wallet=false from haveUtxosChanged
      const utxosHaveChanged = haveUtxosChanged(chronikUtxos, walletUtxos);

      // If the utxo set has not changed,
      if (!utxosHaveChanged) {
        // remove api error here; otherwise it will remain if recovering from a rate
        // limit error with an unchanged utxo set
        setApiError(false);
        // then wallet.state has not changed and does not need to be updated
        //console.timeEnd("update");
        return;
      }

      const { nonSlpUtxos } = organizeUtxosByType(chronikUtxos);
      const { chronikTxHistory } = await getTxHistoryChronik(chronik, XPI, wallet);

      const newWalletStatus: WalletStatus = {
        balances: getWalletBalanceFromUtxos(nonSlpUtxos),
        slpBalancesAndUtxos: {
          nonSlpUtxos
        },
        parsedTxHistory: chronikTxHistory,
        utxos: chronikUtxos
      };

      if (!_.isEqual(newWalletStatus, walletStatus)) {
        dispatch(writeWalletStatus(newWalletStatus));
      }

      setApiError(false);
    } catch (error) {
      console.log(`Error in update({wallet})`);
      console.log(error);
      // Set this in state so that transactions are disabled until the issue is resolved
      setApiError(true);
      //console.timeEnd("update");
      // Try another endpoint
      console.log(`Trying next API...`);
    }
  };

  // Update wallet according to defined interval
  useInterval(async () => {
    const wallet = walletState;
    update(wallet).finally(() => {
      if (!walletHasUpdated) {
        dispatch(setWalletHasUpdated(true));
      }
    });
  }, walletRefreshInterval);

  /*
    Use wallet.mnemonic as the useEffect parameter here because we 
    want to run initializeWebsocket(wallet, fiatPrice) when a new unique wallet
    is selected, not when the active wallet changes state
    */
  useEffect(() => {
    (async () => {
      await initializeWebsocket(walletState);
      // dispatch(activateWallet(walletState.mnemonic));
    })();
  }, [walletState.mnemonic]);

  useEffect(() => {
    syncAccountsToWallets(accounts, allWalletPaths);
  }, []);

  return {
    XPI,
    chronik,
    deriveAccount,
    getWalletPathDetails,
    validateMnemonic
  } as WalletContextValue;
};

export default useWallet;
