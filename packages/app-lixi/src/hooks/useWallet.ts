import BCHJS from '@bcpros/xpi-js';
import { Lixi } from '@bcpros/lixi-models';
import { useState } from 'react';
import { ChronikClient } from 'chronik-client';
import useXPI from './useXPI';
import useInterval from './useInterval';
import { useAppSelector } from '@store/hooks';
import { getWalletState } from '@store/wallet';
import { RootState } from '@store/store';
import { WalletContextValue } from '@context/index';

const chronik = new ChronikClient('https://chronik.fabien.cash');

/* eslint-disable react-hooks/exhaustive-deps */
const useWallet = () => {
  // @todo: use constant
  // and consider to move to redux the neccessary variable
  const [walletRefreshInterval, setWalletRefreshInterval] = useState(5000);

  const [chronikWebsocket, setChronikWebsocket] = useState(null);
  const [hasUpdated, setHasUpdated] = useState<boolean>(false);

  const [apiIndex, setApiIndex] = useState(0);

  const { getXPI } = useXPI();
  const [XPI, setXPI] = useState(getXPI(apiIndex));

  // const walletState = useAppSelector((state: RootState) => state.wallet);

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

  const validateMnemonic = (mnemonic: string, wordlist = XPI.Mnemonic.wordLists().english) => {
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
    deriveAccount,
    getWalletDetails,
    validateMnemonic
  } as WalletContextValue;
};

export default useWallet;
