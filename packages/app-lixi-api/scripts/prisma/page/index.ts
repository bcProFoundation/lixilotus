import { PrismaClient } from '@prisma/client';
import { MeiliSearch } from 'meilisearch';
import { aesGcmEncrypt, generateRandomBase58Str } from '../../../src/utils/encryptionMethods';
import BCHJS from '@bcpros/xpi-js';

require('dotenv').config();

const prisma = new PrismaClient();
const meiliClient = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST!,
  apiKey: process.env.MEILISEARCH_MASTER_KEY
});

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
