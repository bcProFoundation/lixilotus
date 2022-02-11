import * as _ from 'lodash';
import express, { NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { Redeem } from '@bcpros/lixi-models';
import { VError } from 'verror';

const prisma = new PrismaClient();
let router = express.Router();

router.get('/:id/redeems', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const { id } = req.params;
  const vaultId = _.toSafeInteger(id);

  try {
    const redeems = await prisma.redeem.findMany({
      where: {
        vaultId: vaultId
      }
    });

    const results = redeems.map(item => {
      return {
        ...item,
        amount: Number(item.amount)
      } as Redeem;
    });

    res.json(results ?? []);

  } catch (err) {
    if (err instanceof VError) {
      return next(err);
    } else {
      const error = new VError.WError(err as Error, 'Unable to get redeem list of the vault.');
      return next(error);
    }
  }
});

export { router };