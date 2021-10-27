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
}