import { Controller, Get, HttpException, HttpStatus, Logger, Param } from '@nestjs/common';
import { BaseProvider, BigNumber, InjectEthersProvider, EthersContract } from 'nestjs-ethers';
import { I18n, I18nService } from 'nestjs-i18n';
import { VError } from 'verror';
import { ethers } from 'ethers';

@Controller('nft')
export class LixiNftController {
  private logger: Logger = new Logger('LixiNftController');

  constructor(
    @InjectEthersProvider()
    private readonly ethersProvider: BaseProvider,
    @I18n() private i18n: I18nService
  ) {}

  @Get('balance/:address')
  async getBalance(@Param('address') address: string): Promise<string> {
    try {
      this.logger.log(address);
      const balance: BigNumber = await this.ethersProvider.getBalance(address);
      this.logger.log(balance);

      return ethers.utils.formatEther(balance);
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableGetAccountMessage = await this.i18n.t('account.messages.unableGetAccount');
        const error = new VError.WError(err as Error, unableGetAccountMessage);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
