import BCHJS from '@bcpros/xpi-js';
import { currency, Lixi } from '@bcpros/lixi-models';
import { useEffect, useState } from 'react';
import { ChronikClient, SubscribeMsg, Tx } from 'chronik-client';
import useXPI from './useXPI';
import useInterval from './useInterval';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getAllWalletPaths, getWaletRefreshInterval, getWalletHasUpdated, getWalletState, setWalletHasUpdated, setWalletRefreshInterval, WalletPathAddressInfo, WalletState, WalletStatus } from '@store/wallet';
import { RootState } from '@store/store';
import { WalletContextValue } from '@context/index';
import { getHashArrayFromWallet, getWalletBalanceFromUtxos } from '@utils/cashMethods';
import _ from 'lodash';
import { getTxHistoryChronik, getUtxosChronik, Hash160AndAddress, organizeUtxosByType, parseChronikTx } from '@utils/chronik';

const chronik = new ChronikClient('https://chronik.fabien.cash');
const websocketConnectedRefreshInterval = 10000;

/* eslint-disable react-hooks/exhaustive-deps */
const useWallet = () => {
  // @todo: use constant
  // and consider to move to redux the neccessary variable


  const [chronikWebsocket, setChronikWebsocket] = useState(null);
  // const [hasUpdated, setHasUpdated] = useState<boolean>(false);

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [apiIndex, setApiIndex] = useState(0);

  const { getXPI } = useXPI();
  const [XPI, setXPI] = useState<BCHJS>(getXPI(apiIndex));

  const walletState = useAppSelector(getWalletState);
  const walletRefreshInterval = useAppSelector(getWaletRefreshInterval);
  const walletHasUpdated = useAppSelector(getWalletHasUpdated);
  const allWalletPaths = useAppSelector(getAllWalletPaths);
  const dispatch = useAppDispatch();

  // If you catch API errors, call this function
  const tryNextAPI = () => {
    let currentApiIndex = apiIndex;
    // How many APIs do you have?
    const apiString = process.env.NEXT_PUBLIC_XPI_APIS;

    const apiArray = apiString.split(',');

    console.log(`You have ${apiArray.length} APIs to choose from`);
    console.log(`Current selection: ${apiIndex}`);
    // If only one, exit
    if (apiArray.length === 0) {
      console.log(
        `There are no backup APIs, you are stuck with this error`,
      );
      return;
    } else if (currentApiIndex < apiArray.length - 1) {
      currentApiIndex += 1;
      console.log(
        `Incrementing API index from ${apiIndex} to ${currentApiIndex}`,
      );
    } else {
      // Otherwise use the first option again
      console.log(`Retrying first API index`);
      currentApiIndex = 0;
    }
    //return setApiIndex(currentApiIndex);
    console.log(`Setting Api Index to ${currentApiIndex}`);
    setApiIndex(currentApiIndex);
    return setXPI(getXPI(currentApiIndex));
    // If you have more than one, use the next one
    // If you are at the "end" of the array, use the first one
  };

  const getWalletPathDetails = async (mnemonic: string, paths: string[]): Promise<WalletPathAddressInfo[]> => {
    const NETWORK = process.env.NEXT_PUBLIC_NETWORK;
    const rootSeedBuffer = await XPI.Mnemonic.toSeed(mnemonic);
    let masterHDNode;

    if (NETWORK === `mainnet`) {
      masterHDNode = XPI.HDNode.fromSeed(rootSeedBuffer);
    } else {
      masterHDNode = XPI.HDNode.fromSeed(rootSeedBuffer, 'testnet');
    }

    let walletPaths: WalletPathAddressInfo[] = [];
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
    const keyPair = XPI.HDNode.toKeyPair(node);
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
      keyPair,
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

  const writeWalletStatus = async (newStatus: WalletStatus) => {
    dispatch(writeWalletStatus(newStatus));
  }

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
      return console.log(
        `Error in chronik.tx(${txid} while processing an incoming websocket tx`,
        err,
      );
    }

    // parse tx for notification
    const parsedChronikTx = parseChronikTx(
      XPI,
      incomingTxDetails,
      wallet
    );
  }

  // Chronik websockets
  const initializeWebsocket = async (wallet: WalletState) => {
    console.log(
      `Initializing websocket connection for wallet ${wallet}`,
    );

    const hash160Array = getHashArrayFromWallet(wallet);
    if (!wallet || _.isNil(hash160Array) || !_.isEmpty(hash160Array)) {
      return setChronikWebsocket(null);
    }

    // Initialize if not in state
    let ws = chronikWebsocket;
    if (ws === null) {
      ws = chronik.ws({
        onMessage: (msg: SubscribeMsg) => {
          processChronikWsMsg(msg, wallet);
        },
        onReconnect: e => {
          // Fired before a reconnect attempt is made:
          console.log(
            'Reconnecting websocket, disconnection cause: ',
            e,
          );
        },
        onConnect: e => {
          console.log(`Chronik websocket connected`, e);
          console.log(
            `Websocket connected, adjusting wallet refresh interval to ${websocketConnectedRefreshInterval / 1000
            }s`,
          );
          setWalletRefreshInterval(
            websocketConnectedRefreshInterval,
          );
        },
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
      const subscribedHash160Array = previousWebsocketSubscriptions.map(
        function (subscription) {
          return subscription.scriptPayload;
        },
      );
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
    console.log(
      `previousWebsocketSubscriptions`,
      previousWebsocketSubscriptions,
    );
    if (previousWebsocketSubscriptions.length > 0) {
      for (let i = 0; i < previousWebsocketSubscriptions.length; i += 1) {
        const unsubHash160 =
          previousWebsocketSubscriptions[i].scriptPayload;
        ws.unsubscribe('p2pkh', unsubHash160);
        console.log(`ws.unsubscribe('p2pkh', ${unsubHash160})`);
      }
    }

    // Subscribe to addresses of current wallet
    for (let i = 0; i < hash160Array.length; i += 1) {
      ws.subscribe('p2pkh', hash160Array[i]);
      console.log(`ws.subscribe('p2pkh', ${hash160Array[i]})`);
    }

    // Put connected websocket in state
    return setChronikWebsocket(ws);

  }

  const update = async (wallet: WalletState) => {
    // Check if walletRefreshInterval is set to 10, i.e. this was called by websocket tx detection
    // If walletRefreshInterval is 10, set it back to the usual refresh rate
    if (walletRefreshInterval === 10) {
      dispatch(setWalletRefreshInterval(
        websocketConnectedRefreshInterval,
      ));
    }
    try {
      if (!wallet) {
        return;
      }

      const hash160AndAddressObjArray: Hash160AndAddress[] = allWalletPaths.map(item => {
        return {
          address: item.xAddress,
          hash160: item.hash160,
        }
      });

      // Check that server is live
      try {
        await XPI.Blockchain.getBlockCount();
      } catch (err) {
        console.log(
          `Error in BCH.Blockchain.getBlockCount, the full node is likely down`,
          err,
        );
        throw new Error(`Node unavailable`);
      }

      const chronikUtxos = await getUtxosChronik(
        chronik,
        hash160AndAddressObjArray,
      );

      const { nonSlpUtxos } = organizeUtxosByType(chronikUtxos);

      const { chronikTxHistory } = await getTxHistoryChronik(chronik, XPI, wallet);

      const newWalletStatus: WalletStatus = {
        balances: getWalletBalanceFromUtxos(nonSlpUtxos),
        slpBalancesAndUtxos: {
          nonSlpUtxos,
        },
        parsedTxHistory: chronikTxHistory,
        utxos: chronikUtxos,
      };
      dispatch(writeWalletStatus(newWalletStatus));

      setApiError(false);

    } catch (error) {
      console.log(`Error in update({wallet})`);
      console.log(error);
      // Set this in state so that transactions are disabled until the issue is resolved
      setApiError(true);
      //console.timeEnd("update");
      // Try another endpoint
      console.log(`Trying next API...`);
      tryNextAPI();
    }
  }

  // Update wallet according to defined interval
  useInterval(async () => {
    const wallet = walletState;
    update(wallet)
      .finally(() => {
        setLoading(false);
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
    })();
  }, [walletState.mnemonic]);

  return {
    XPI,
    chronik,
    deriveAccount,
    getWalletPathDetails,
    validateMnemonic
  } as WalletContextValue;
};

export default useWallet;
