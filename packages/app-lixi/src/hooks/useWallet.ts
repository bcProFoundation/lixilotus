import BCHJS from '@bcpros/xpi-js';
import { Lixi } from '@bcpros/lixi-models';
import { useState } from 'react';

/* eslint-disable react-hooks/exhaustive-deps */
const useWallet = (XPI: BCHJS) => {
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
    const slpAddress = XPI.SLP.Address.toSLPAddress(cashAddress);
    const xAddress = XPI.HDNode.toXAddress(node);
    const keyPair = XPI.HDNode.toKeyPair(node);
    return {
      xAddress,
      cashAddress,
      slpAddress,
      fundingWif: XPI.HDNode.toWIF(node),
      fundingAddress: XPI.SLP.Address.toSLPAddress(cashAddress),
      legacyAddress: XPI.SLP.Address.toLegacyAddress(cashAddress),
      keyPair
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

  return {
    deriveAccount,
    getWalletDetails,
    validateMnemonic
  } as const;
};

export default useWallet;
