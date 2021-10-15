import React, { useState, useEffect } from 'react';
import useXPI from '@hooks/useXPI';
import { Vault } from '@abcpros/givegift-models/lib/vault';

const useVault = () => {

  const [vault, setVault] = useState(false);
  const [apiError, setApiError] = useState(false);

  const { getXPI } = useXPI();
  const [apiIndex, setApiIndex] = useState(0);
  const [XPI, setXPI] = useState(getXPI(apiIndex));

  const [loading, setLoading] = useState(true);

  const loadVaultFromStorageOnStartup = {
    // @todo: implement here
  }

  const getVaultDetails = async (vault: Vault) => {
    // if (!vault) {
    //   return false;
    // }

    // // Since this info is in localforage now, only get the var
    // const NETWORK = process.env.REACT_APP_NETWORK;
    // const encryptedMnemonic = vault.encryptedMnemonic;
    // const 
  }

  const createVault = async () => {
    // const lang = 'english';
    // const Bip39128BitMnemonic = XPI.Mnemonic.generate(128, XPI.Mnemonic.wordLists()[lang]);
    // const vaultWallet = await getVaultDetails({

    // });
  }

  return {
    createVault
  };
}

export default useVault;