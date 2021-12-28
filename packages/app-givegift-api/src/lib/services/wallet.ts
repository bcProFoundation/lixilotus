import MinimalBCHWallet from "@abcpros/minimal-xpi-slp-wallet";
import BCHJS from "@abcpros/xpi-js";
import { Inject, Service } from "typedi";

@Service()
export class WalletService {
  constructor(
    @Inject('xpijs') private xpijs: BCHJS,
    @Inject('xpiWallet') private xpiWallet: MinimalBCHWallet
  ) {

  }

  async getBalance(address: string) {
    return this.xpiWallet.getBalance(address);
  }

  async getWalletDetails(mnemonic: string, vaultIndex: number) {
    const rootSeedBuffer = await this.xpijs.Mnemonic.toSeed(mnemonic);
    const masterHDNode = this.xpijs.HDNode.fromSeed(rootSeedBuffer);
    const hdPath = `m/44'/10605'/${vaultIndex}'/0/0`;
    const childNode = masterHDNode.derivePath(hdPath);
    const vaultAddress: string = this.xpijs.HDNode.toXAddress(childNode);
    const keyPair = this.xpijs.HDNode.toKeyPair(vaultAddress);
    const balance = await this.getBalance(vaultAddress);
    return { keyPair, balance }

  }
}