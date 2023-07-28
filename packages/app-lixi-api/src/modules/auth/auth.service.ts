import { Injectable, Logger } from '@nestjs/common';
import { TokenSigner, TokenVerifier, decodeToken } from 'jsontokens';
import { I18n, I18nService } from 'nestjs-i18n';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { VError } from 'verror';
// import * as wif from 'wif';
import { hashMnemonic } from '../../utils/encryptionMethods';
import { WalletService } from '../wallet/wallet.service';
import { Account } from '@bcpros/lixi-models';
const wif = require('wif');

@Injectable()
export class AuthService {
  private logger: Logger = new Logger(AuthService.name);

  constructor(private prisma: PrismaService, private walletService: WalletService, @I18n() private i18n: I18nService) {}

  /**
   * Generate the jwt token from mnemonic
   * @param mnemonic The mnemonic of the account
   * @returns The jwt token
   */
  public async login(mnemonic: string): Promise<string | never> {
    const mnemonicHash = await hashMnemonic(mnemonic);

    // Find the account
    const account = await this.prisma.account.findFirst({
      where: {
        mnemonicHash: mnemonicHash
      }
    });

    if (!account) {
      const accountNotExistMessage = await this.i18n.t('auth.messages.accountNotExist');
      throw new VError(accountNotExistMessage);
    }

    const { publicKey, wifKey } = await this.walletService.deriveAddress(mnemonic, 0);
    if (!account.publicKey) {
      // There're  no public key, old account
      await this.prisma.account.update({
        where: {
          id: account.id
        },
        data: {
          publicKey: publicKey
        }
      });
    }

    const dataToSign = {
      id: account.id
    };
    const wifDecoded = wif.decode(wifKey);
    const privateKey = wifDecoded.privateKey.toString('hex');

    const payload = JSON.stringify(dataToSign);
    const token = await new TokenSigner('ES256K', privateKey).signAsync(payload);
    return token;
  }

  public async verifyJwt(token: string): Promise<Account> {
    try {
      const tokenDecoded = decodeToken(token);
      const { id } = JSON.parse(tokenDecoded.payload as string);

      // Find the account
      const account = await this.prisma.account.findFirst({
        where: {
          id: id
        }
      });

      const avatar = await this.prisma.account
        .findUnique({
          where: {
            id: id
          }
        })
        .avatar({
          include: {
            upload: true
          }
        });

      let url;
      if (avatar) {
        const { upload } = avatar;
        const cfUrl = `${process.env.CF_IMAGES_DELIVERY_URL}/${process.env.CF_ACCOUNT_HASH}/${upload.cfImageId}/public`;
        url = upload.cfImageId ? cfUrl : upload.url;
      }

      if (!account) throw new Error('Invalid account');

      const verified = await new TokenVerifier('ES256K', account.publicKey).verifyAsync(token);

      if (verified) {
        return { ...account, avatar: url ?? undefined };
      }
    } catch (err) {
      throw new Error('Invalid account');
    }

    throw new Error('Invalid account');
  }
}
