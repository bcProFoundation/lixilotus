import { PrismaClient } from '@prisma/client';
import { MeiliSearch } from 'meilisearch';
import crypto from 'crypto';
import BCHJS from '@bcpros/xpi-js';

require('dotenv').config();

const prisma = new PrismaClient();

function generateRandomBase58Str(length: number): string {
  const base = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'.split('');
  const array = new Uint8Array(crypto.randomBytes(length));
  let str = '';
  for (var i = 0; i < array.length; i++) {
    str += base[array[i] % base.length];
  }
  return str;
}

async function aesGcmEncrypt(plaintext: string, password: string): Promise<string> {
  const pwUtf8 = new TextEncoder().encode(password); // encode password as UTF-8
  const pwHash = await crypto.createHash('sha256').update(pwUtf8).digest(); // hash the password

  const iv = crypto.randomBytes(12);
  const key = pwHash;

  const ptUint8 = new TextEncoder().encode(plaintext);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encryptedBuffer = cipher.update(ptUint8);
  cipher.final();

  const encryptedResult = Buffer.concat([iv, encryptedBuffer, cipher.getAuthTag()]);
  return encryptedResult.toString('base64');
}

async function main() {
  console.log(`Creating new seed and salt for exsiting pages`);
  const XPI = new BCHJS({ restURL: process.env.NEXT_PUBLIC_XPI_APIS });
  const allPages = await prisma.page.findMany({
    where: {
      AND: [
        {
          salt: null
        },
        {
          encryptedMnemonic: null
        }
      ]
    }
  });

  //Cannot use updateMany with different data so we have to use a loop here
  //https://stackoverflow.com/questions/71500083/update-multiple-rows-using-prisma-without-manual-loops
  const lang = 'english';
  const Bip39128BitMnemonic = XPI.Mnemonic.generate(128, XPI.Mnemonic.wordLists()[lang]);
  const salt = generateRandomBase58Str(10);

  const encryptedMnemonic: string = await aesGcmEncrypt(Bip39128BitMnemonic, salt + process.env.MNEMONIC_SECRET);
  allPages.map(async page => {
    await prisma.page.update({
      where: {
        id: page.id
      },
      data: {
        encryptedMnemonic: encryptedMnemonic,
        salt: salt
      }
    });
  });

  console.log('Done!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
