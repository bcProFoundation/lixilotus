import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import { Body, Controller, Get, HttpException, HttpStatus, Inject, Param, Post } from '@nestjs/common';
import { CreateTokenCommand, TokenDto } from '@bcpros/lixi-models';

import * as _ from 'lodash';
import { I18n, I18nContext } from 'nestjs-i18n';
import { VError } from 'verror';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from '../../wallet/wallet.service';

@Controller('tokens')
export class TokenController {
  constructor(
    private prisma: PrismaService,
    private readonly walletService: WalletService,
    @Inject('xpiWallet') private xpiWallet: MinimalBCHWallet
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
  async createToken(@Body() command: CreateTokenCommand, @I18n() i18n: I18nContext): Promise<TokenDto> {
    if (command) {
      try {
        const tokenToInsert = {
          id: undefined,
          tokenId: command.tokenId,
          name: command.name,
          ticker: command.ticker,
          decimals: command.decimals,
          initialTokenQuantity: command.initialTokenQuantity,
          tokenType: command.tokenType,
          tokenDocumentUrl: command.tokenDocumentUrl,
          totalBurned: command.totalBurned,
          totalMinted: command.totalMinted,
          createdDate: command?.createdDate || undefined,
          createdAt: undefined,
          comments: command?.comments || undefined
        };

        const createdToken = await this.prisma.token.create({
          data: tokenToInsert
        });

        const resultApi: TokenDto = createdToken;

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
