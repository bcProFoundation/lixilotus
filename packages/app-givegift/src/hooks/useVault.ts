import React, { useState, useEffect } from 'react';
import localforage from 'localforage';
import BCHJS from '@abcpros/xpi-js';
import useXPI from '@hooks/useXPI';
import { Vault } from '@abcpros/givegift-models/lib/vault';
import { aesGcmEncrypt, aesGcmDecrypt, generateRandomBase62Str } from '@utils/encryptionMethods';



const useVault = () => {

  // @todo: Later to refactor to use redux if the app grow big
  const [vault, setVault] = useState(false);
  const [apiError, setApiError] = useState(false);

  const { getXPI } = useXPI();
  const [loading, setLoading] = useState(true);
  const [apiIndex, setApiIndex] = useState(0);
  const [XPI, setXPI] = useState(getXPI(apiIndex));

  const loadVaultFromStorageOnStartup = {
    // @todo: implement here
  }

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

  const getVaultDetails = async (vault: Vault) => {
    if (!vault) {
      return false;
    }

    // // Since this info is in localforage now, only get the var
    const NETWORK = process.env.REACT_APP_NETWORK;
    const mnemonic = vault.mnemonic;
    const rootSeedBuffer: Buffer = await XPI.Mnemonic.toSeed(mnemonic);
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

    let name = Path10605.xAddress.slice(12, 17);
    if (vault && vault.name) {
      name = vault.name;
    }

    return {
      mnemonic: vault.mnemonic,
      name,
      Path10605
    };

  }

  return {
  } as const;
}

export default useVault;