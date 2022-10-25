import BCHJS from '@bcpros/xpi-js';
import { currency, Lixi } from '@bcpros/lixi-models';
import { useState } from 'react';
import { ChronikClient, SubscribeMsg, Tx } from 'chronik-client';
import useXPI from './useXPI';
import useInterval from './useInterval';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getWalletState, WalletState, WalletStatus } from '@store/wallet';
import { RootState } from '@store/store';
import { WalletContextValue } from '@context/index';
import { getHashArrayFromWallet } from '@utils/cashMethods';
import _ from 'lodash';
import { parseChronikTx } from '@utils/chronik';

const chronik = new ChronikClient('https://chronik.fabien.cash');
const websocketDisconnectedRefreshInterval = 5000;
const websocketConnectedRefreshInterval = 10000;

/* eslint-disable react-hooks/exhaustive-deps */
const useWallet = () => {
  // @todo: use constant
  // and consider to move to redux the neccessary variable
  const [walletRefreshInterval, setWalletRefreshInterval] = useState(5000);

  const [chronikWebsocket, setChronikWebsocket] = useState(null);
  const [hasUpdated, setHasUpdated] = useState<boolean>(false);

  const [apiIndex, setApiIndex] = useState(0);

  const { getXPI } = useXPI();
  const [XPI, setXPI] = useState<BCHJS>(getXPI(apiIndex));

  // const walletState = useAppSelector((state: RootState) => state.wallet);
  const dispatch = useAppDispatch();

  const getWalletDetails = async mnemonic => {
    const NETWORK = process.env.NEXT_PUBLIC_NETWORK;
    const rootSeedBuffer = await XPI.Mnemonic.toSeed(mnemonic);
    let masterHDNode;

    if (NETWORK === `mainnet`) {
      masterHDNode = XPI.HDNode.fromSeed(rootSeedBuffer);
    } else {
      masterHDNode = XPI.HDNode.fromSeed(rootSeedBuffer, 'testnet');
    }

    const Path10605 = await deriveAccount(XPI, {
      masterHDNode,
      path: "m/44'/10605'/0'/0/0"
    });

    return Path10605;
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
    setWalletRefreshInterval(10);

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
      `Initializing websocket connection for wallet ${wallet.name}`,
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

  // Update wallet according to defined interval
  // useInterval(async () => {
  //   const wallet = walletState;
  //   update({
  //     wallet
  //   }).finally(() => {
  //     setLoading(false);
  //     if (!hasUpdated) {
  //       setHasUpdated(true);
  //     }
  //   });
  // }, walletRefreshInterval);

  return {
    XPI,
    chronik,
    deriveAccount,
    getWalletDetails,
    validateMnemonic
  } as WalletContextValue;
};

export default useWallet;
