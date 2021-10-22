import BCHJS from "@abcpros/xpi-js";
import { useState } from "react";
import useXPI from "./useXPI";

/* eslint-disable react-hooks/exhaustive-deps */
const useWallet = (XPI: BCHJS) => {

  const getWalletDetails = async (mnemonic) => {
    const NETWORK = process.env.REACT_APP_NETWORK;
    const rootSeedBuffer = await XPI.Mnemonic.toSeed(mnemonic);
    let masterHDNode;

    if (NETWORK === `mainnet`) {
      masterHDNode = XPI.HDNode.fromSeed(rootSeedBuffer);
    } else {
      masterHDNode = XPI.HDNode.fromSeed(rootSeedBuffer, 'testnet');
    }

    const Path10605 = await deriveAccount(XPI, {
      masterHDNode,
      path: "m/44'/10605'/0'/0/0",
    });

    return Path10605;
  };

  const deriveAccount = async (XPI: BCHJS, { masterHDNode, path }) => {
    const node = XPI.HDNode.derivePath(masterHDNode, path);
    const cashAddress = XPI.HDNode.toCashAddress(node);
    const slpAddress = XPI.SLP.Address.toSLPAddress(cashAddress);
    const xAddress = XPI.HDNode.toXAddress(node);

    return {
      xAddress,
      cashAddress,
      slpAddress,
      fundingWif: XPI.HDNode.toWIF(node),
      fundingAddress: XPI.SLP.Address.toSLPAddress(cashAddress),
      legacyAddress: XPI.SLP.Address.toLegacyAddress(cashAddress),
    };
  };

  return {
    getWalletDetails
  }
};

export default useWallet;
