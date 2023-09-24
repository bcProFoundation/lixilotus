import { LixiDto } from '@bcpros/lixi-models';
import { PrismaService } from '@bcpros/lixi-prisma';
import Lixi from '@components/Lixi';
import _ from 'lodash';
import { GetServerSideProps } from 'next';

const LixiPage = ({ lixiAsString }) => {
  const lixi = JSON.parse(lixiAsString);

  return <Lixi lixi={lixi} />;
};

export const getServerSideProps: GetServerSideProps = async ({ req, res, params }) => {
  const prisma = new PrismaService();
  const { id } = params;
  let lixi: LixiDto;
  let lixiAsString;
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

    lixi = _.omit(
      {
        ...result,
        activationAt: result.activationAt ? result.activationAt.toISOString() : null,
        createdAt: result.createdAt ? result.createdAt.toISOString() : null,
        updatedAt: result.updatedAt ? result.updatedAt.toISOString() : null,
        expiryAt: result.expiryAt ? result.expiryAt.toISOString() : null,
        isClaimed: result.isClaimed,
        balance: 0,
        totalClaim: Number(result.totalClaim),
        envelope: result.envelope,
        distributions: result.distributions
      } as unknown as LixiDto,
      'encryptedXPriv',
      'encryptedClaimCode'
    );

    lixiAsString = JSON.stringify(lixi);
  }

  return {
    props: {
      lixiAsString
    }
  };
};

export default LixiPage;
