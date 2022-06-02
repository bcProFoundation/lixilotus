import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BigNumber, ethers } from 'ethers';
import { BaseProvider, EthersContract, EthersSigner, InjectContractProvider, InjectEthersProvider, InjectSignerProvider } from 'nestjs-ethers';
import { I18n, I18nService } from 'nestjs-i18n';
import { VError } from 'verror';

@Injectable()
export class LixiNftService {

  private logger: Logger = new Logger('LixiNftService');

  constructor(
    @InjectEthersProvider()
    private readonly ethersProvider: BaseProvider,
    @InjectSignerProvider()
    private readonly signerProvider: EthersSigner,
    @InjectContractProvider()
    private readonly contractProvider: EthersContract,
    private readonly config: ConfigService,
    @I18n() private i18n: I18nService
  ) {
  }

  async mintNFT(receiverAddress: string): Promise<string> {

    try {
      const contractAbiFragment = [
        'function mintNFT(address receiver) returns (uint256)',
        'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
      ];

      const wallet = this.signerProvider.createWallet(
        this.config.get<string>('NFT_ISSUER_WALLET_PRIVATE_KEY') || ''
      );

      const contractAddress = this.config.get<string>('LIXILOTUS_NFT_CONTRACT_ADDRESS') || '';
      const contractInstance = await this.contractProvider.create(contractAddress, contractAbiFragment, wallet);

      const tx = await contractInstance.mintNFT(receiverAddress);
      const reciept = await tx.wait();
      const event = reciept.events.find((e: any) => e.event === 'Transfer');

      let tokenId: BigNumber = BigNumber.from(0);
      if (event && event.args && event.args['tokenId']) {
        tokenId = event.args['tokenId'];
      } else {
        throw new VError((await this.i18n.t('lixinft.messages.unableToMint')));
      }

      return tokenId.toString();

    } catch (err: unknown) {
      this.logger.error(err);
      throw new VError((await this.i18n.t('lixinft.unableToMint')));
    }
  }
}