import * as _ from 'lodash';
import express, { NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { Claim } from '@bcpros/lixi-models';
import { VError } from 'verror';

const prisma = new PrismaClient();
let router = express.Router();

router.get('/:id/claims', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const { id } = req.params;
  const lixiId = _.toSafeInteger(id);

  try {
    const claims = await prisma.claim.findMany({
      where: {
        lixiId: lixiId
      }
    });

    const results = claims.map(item => {
      return {
        ...item,
        amount: Number(item.amount)
      } as Claim;
    });

    res.json(results ?? []);

  } catch (err) {
    if (err instanceof VError) {
      return next(err);
    } else {
      const error = new VError.WError(err as Error, 'Unable to get claim list of the lixi.');
      return next(error);
    }
  }
});

export { router };