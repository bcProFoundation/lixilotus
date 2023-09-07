import { PrismaClient, BurnType as BurnTypePrisma, AccountDanaHistoryType } from '@prisma/client';
import BCHJS from '@bcpros/xpi-js';

require('dotenv').config();

const prismaClient = new PrismaClient();
const XPI = new BCHJS({ restURL: 'https://api.sendlotus.com/v4/' });

enum BurnForType {
  Page = 24321,
  Post = 24322,
  Comment = 24323,
  Account = 24324,
  Token = 24325,
  Worship = 24326
}

enum BurnType {
  Up = 1,
  Down = 0
}

const convertBurnedByToAddress = (burnedBy: string): string => {
  const legacyAddress = XPI.Address.hash160ToLegacy(burnedBy);

  const publicAddress = XPI.Address.toXAddress(legacyAddress);

  return publicAddress;
};

const updateAccountsDanaHistory = async (
  burnType: BurnType,
  burnForType: BurnForType,
  amount: number,
  givenDanaAddress: string,
  receivedDanaAddress: string,
  burnForId: string,
  txid: string,
  createdAt: Date,
  updatedAt: Date
) => {
  if (givenDanaAddress === receivedDanaAddress) {
    await prismaClient.$transaction(async prisma => {
      let givenUpValue = 0.0;
      let givenDownValue = 0.0;

      switch (burnType) {
        case BurnType.Up:
          givenUpValue = amount;
          break;
        case BurnType.Down:
          givenDownValue = amount;
          break;
      }

      const accountDana = await prisma.accountDana.findFirst({
        where: {
          account: {
            address: givenDanaAddress
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const danaGiven = accountDana?.danaGiven! + amount;

      const updatedAccountDana = await prisma.accountDana.update({
        where: {
          id: accountDana?.id
        },
        data: {
          danaGiven: danaGiven
        }
      });

      await prisma.accountDanaHistory.create({
        data: {
          txid: txid,
          burnType: burnType ? BurnTypePrisma.UPVOTE : BurnTypePrisma.DOWNVOTE,
          accountDana: {
            connect: {
              id: updatedAccountDana?.id
            }
          },
          burnForId: burnForId,
          burnForType: burnForType,
          type: AccountDanaHistoryType.GIVEN,
          givenUpValue: givenUpValue,
          givenDownValue: givenDownValue,
          createdAt: createdAt,
          updatedAt: updatedAt
        }
      });
    });
  } else {
    await prismaClient.$transaction(async prisma => {
      let givenUpValue = 0.0;
      let givenDownValue = 0.0;
      let receivedUpValue = 0.0;
      let receivedDownValue = 0.0;

      switch (burnType) {
        case BurnType.Up:
          givenUpValue = amount;
          receivedUpValue = amount;
          break;
        case BurnType.Down:
          givenDownValue = amount;
          receivedDownValue = amount;
          break;
      }

      //update given account
      const givenAccountDana = await prisma.accountDana.findFirst({
        where: {
          account: {
            address: givenDanaAddress
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const danaGiven = givenAccountDana?.danaGiven! + amount;

      const updatedGivenAccountDana = await prisma.accountDana.update({
        where: {
          id: givenAccountDana?.id
        },
        data: {
          danaGiven: danaGiven
        }
      });

      await prisma.accountDanaHistory.create({
        data: {
          txid: txid,
          burnType: burnType ? BurnTypePrisma.UPVOTE : BurnTypePrisma.DOWNVOTE,
          accountDana: {
            connect: {
              id: updatedGivenAccountDana?.id
            }
          },
          burnForId: burnForId,
          burnForType: burnForType,
          type: AccountDanaHistoryType.GIVEN,
          givenUpValue: givenUpValue,
          givenDownValue: givenDownValue,
          createdAt: createdAt,
          updatedAt: updatedAt
        }
      });

      //update received account
      const receivedAccountDana = await prisma.accountDana.findFirst({
        where: {
          account: {
            address: receivedDanaAddress
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const danaReceived =
        burnType === BurnType.Up
          ? receivedAccountDana?.danaReceived! + amount
          : receivedAccountDana?.danaReceived! - amount;

      const updatedRecivedAccountDana = await prisma.accountDana.update({
        where: {
          id: receivedAccountDana?.id
        },
        data: {
          danaReceived: danaReceived
        }
      });

      await prisma.accountDanaHistory.create({
        data: {
          txid: txid,
          burnType: burnType ? BurnTypePrisma.UPVOTE : BurnTypePrisma.DOWNVOTE,
          accountDana: {
            connect: {
              id: updatedRecivedAccountDana?.id
            }
          },
          burnForId: burnForId,
          burnForType: burnForType,
          type: AccountDanaHistoryType.RECEIVED,
          receivedUpValue: receivedUpValue,
          receivedDownValue: receivedDownValue
        }
      });
    });
  }
};

async function main() {
  const accounts = await prismaClient.account.findMany({});
  console.log(`Creating account dana for all accounts`);
  await prismaClient.accountDana.createMany({
    data: accounts.map(account => ({
      accountId: account.id,
      danaGiven: 0,
      danaReceived: 0
    })),
    skipDuplicates: true
  });
  console.log(`Done`);

  console.log(`Calculating dana for all accounts based on burn table`);
  const burns = await prismaClient.burn.findMany({});
  for (const burn of burns) {
    const burnType = burn.burnType === true ? BurnType.Up : BurnType.Down;
    const burnForType = burn.burnForType;
    const burnAddress = convertBurnedByToAddress(burn.burnedBy.toString('hex'));
    const burnForId = burn.burnForId;
    const burnCreatedAt = burn.createdAt!;
    const burnUpdatedAt = burn.updatedAt!;
    const txid = burn.txid;

    switch (burnForType) {
      case BurnForType.Post:
        const post = await prismaClient.post.findUnique({
          where: { id: burn.burnForId },
          include: {
            postAccount: {
              select: {
                address: true
              }
            }
          }
        });
        await updateAccountsDanaHistory(
          burnType,
          burnForType,
          burn.burnedValue,
          burnAddress,
          post?.postAccount!.address!,
          burnForId,
          txid,
          burnCreatedAt,
          burnUpdatedAt
        );
        break;
      case BurnForType.Comment:
        const comment = await prismaClient.comment.findUnique({
          where: { id: burn.burnForId },
          include: {
            commentAccount: {
              select: {
                address: true
              }
            }
          }
        });
        await updateAccountsDanaHistory(
          burnType,
          burnForType,
          burn.burnedValue,
          burnAddress,
          comment?.commentAccount!.address!,
          burnForId,
          txid,
          burnCreatedAt,
          burnUpdatedAt
        );

        break;
      case BurnForType.Token:
        let givenUpValue = 0.0;
        let givenDownValue = 0.0;
        const xpiValue = burn.burnedValue;

        switch (burnType) {
          case BurnType.Up:
            givenUpValue = xpiValue;
            break;
          case BurnType.Down:
            givenDownValue = xpiValue;
            break;
        }

        await prismaClient.$transaction(async prisma => {
          const accountDana = await prisma.accountDana.findFirst({
            where: {
              account: {
                address: burnAddress
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          });

          const danaGiven = accountDana?.danaGiven! + xpiValue;

          const updatedAccountDana = await prisma.accountDana.update({
            where: {
              id: accountDana?.id
            },
            data: {
              danaGiven: danaGiven
            }
          });

          await prisma.accountDanaHistory.create({
            data: {
              txid: txid,
              burnType: burnType ? BurnTypePrisma.UPVOTE : BurnTypePrisma.DOWNVOTE,
              accountDana: {
                connect: {
                  id: updatedAccountDana?.id
                }
              },
              burnForId: burnForId,
              burnForType: burnForType,
              type: AccountDanaHistoryType.GIVEN,
              givenUpValue: givenUpValue,
              givenDownValue: givenDownValue,
              createdAt: burnCreatedAt,
              updatedAt: burnUpdatedAt
            }
          });
        });

        break;
    }

    //sleep for 1.5 seconds
    console.log(`Update account ${burnAddress} completed. Sleeping for 1.5 seconds`);
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
