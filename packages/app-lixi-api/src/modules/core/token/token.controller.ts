import { TokenDto } from '@bcpros/lixi-models';
import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import { Body, Controller, Get, HttpException, HttpStatus, Inject, Param, Post } from '@nestjs/common';

import { SkipThrottle } from '@nestjs/throttler';
import { Token as TokenDb } from '@prisma/client';
import { ChronikClient } from 'chronik-client';
import moment from 'moment';
import { I18n, I18nContext } from 'nestjs-i18n';
import { InjectChronikClient } from 'src/common/modules/chronik/chronik.decorators';
import { VError } from 'verror';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from '../../wallet/wallet.service';

@SkipThrottle()
@Controller('tokens')
export class TokenController {
  constructor(
    private prisma: PrismaService,
    private readonly walletService: WalletService,
    @Inject('xpiWallet') private xpiWallet: MinimalBCHWallet,
    @InjectChronikClient('xec') private chronik: ChronikClient
  ) {}

  @Get(':id')
  async getTokensInfobyId(@Param('id') id: string, @I18n() i18n: I18nContext): Promise<any> {
    try {
      const tokenInfo = await this.prisma.token.findUnique({
        where: {
          tokenId: id
        }
      });
      if (!tokenInfo) {
        const tokenNotExist = await i18n.t('token.messages.tokenNotExist');
        const error = new VError.WError(tokenNotExist);
        return error;
      }
      return tokenInfo;
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableToGetToken = await i18n.t('token.messages.unableToGetToken');
        const error = new VError.WError(err as Error, unableToGetToken);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Get()
  async getAllTokenInfo(@I18n() i18n: I18nContext): Promise<any> {
    try {
      const tokensList = await this.prisma.token.findMany();
      return tokensList;
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableToGetToken = await i18n.t('token.messages.unableToGetToken');
        const error = new VError.WError(err as Error, unableToGetToken);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post()
  async createToken(@Body() tokenId: string, @I18n() i18n: I18nContext): Promise<TokenDto> {
    if (tokenId) {
      try {
        const tokenExist = await this.prisma.token.findUnique({
          where: {
            tokenId: tokenId
          }
        });

        if (tokenExist) {
          throw new VError('Token already exist');
        }

        const token = await this.chronik.token(tokenId);

        const tokenToInsert = {
          tokenId: tokenId,
          name: token?.slpTxData?.genesisInfo?.tokenName,
          ticker: token?.slpTxData?.genesisInfo?.tokenTicker,
          decimals: token?.slpTxData?.genesisInfo?.decimals,
          initialTokenQuantity: token?.initialTokenQuantity,
          tokenType: token?.slpTxData?.slpMeta?.tokenType,
          tokenDocumentUrl: token?.slpTxData?.genesisInfo?.tokenDocumentUrl,
          totalBurned: token?.tokenStats?.totalBurned,
          totalMinted: token?.tokenStats?.totalMinted,
          createdDate: moment(token?.block?.timestamp, 'X').toDate(),
          comments: moment().toDate()
        } as TokenDb;

        const createdToken = await this.prisma.token.create({
          data: tokenToInsert
        });

        const resultApi: TokenDto = { ...createdToken };

        return resultApi;
      } catch (err) {
        if (err instanceof VError) {
          throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          const unableCreateToken = await i18n.t('token.messages.unableCreateToken');
          const error = new VError.WError(err as Error, unableCreateToken);
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    }
    return null as any;
  }
}
