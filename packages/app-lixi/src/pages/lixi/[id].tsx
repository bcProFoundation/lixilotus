import React from 'react';
import { GetServerSideProps } from 'next';
import Lixi from '@components/Lixi';
import { LixiDto } from '@bcpros/lixi-models';
import { PrismaService } from '@bcpros/lixi-prisma';
import _ from 'lodash';
import BCHJS from '@bcpros/xpi-js';

const LixiPage = ({ lixi }) => {
  return <Lixi lixi={lixi} />;
};

export const getServerSideProps: GetServerSideProps = async ({ req, res, params }) => {
  const prisma = new PrismaService();
  const { id } = params;
  let lixi: LixiDto;

  if (id) {
    const result = await prisma.lixi.findUnique({
      where: {
        id: _.toSafeInteger(id)
      },
      include: {
        envelope: true,
        distributions: true,
        pageMessageSession: {
          select: {
            id: true,
            status: true,
            page: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    const XPI = new BCHJS({ restURL: process.env.NEXT_PUBLIC_XPI_APIS });
    const balance = await XPI.Electrumx.balance(result.address);
    const totalBalance = balance.balance.confirmed + balance.balance.unconfirmed;

    lixi = _.omit(
      {
        ...result,
        activationAt: result.activationAt ? result.activationAt.toISOString() : null,
        createdAt: result.createdAt ? result.createdAt.toISOString() : null,
        updatedAt: result.updatedAt ? result.updatedAt.toISOString() : null,
        expiryAt: result.expiryAt ? result.expiryAt.toISOString() : null,
        isClaimed: result.isClaimed,
        balance: totalBalance,
        totalClaim: Number(result.totalClaim),
        envelope: result.envelope,
        distributions: result.distributions
      } as unknown as LixiDto,
      'encryptedXPriv',
      'encryptedClaimCode'
    );
  }

  return {
    props: {
      lixi
    }
  };
};

export default LixiPage;
