import express, { NextFunction } from 'express';
import _ from 'lodash';
import VError from 'verror';

import { Envelope } from '@abcpros/givegift-models';
import { Envelope as EnvelopeDb, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let router = express.Router();

router.get('/envelopes/:id/', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const envelope = await prisma.envelope.findUnique({
      where: {
        id: _.toSafeInteger(id)
      }
    });
    if (!envelope)
      throw new VError('The envelope does not exist in the database.');

    const result = {
      ...envelope,
    } as Envelope;
    return res.json(result);
  } catch (err: unknown) {
    if (err instanceof VError) {
      return next(err);
    } else {
      const error = new VError.WError(err as Error, 'Unable to get the envelope.');
      return next(error);
    }
  }
});

router.get('/envelopes', async (req: express.Request, res: express.Response, next: NextFunction) => {
  try {
    const envelopes = await prisma.envelope.findMany();

    const result = envelopes as Envelope[];
    return res.json(result);
  } catch (err: unknown) {
    if (err instanceof VError) {
      return next(err);
    } else {
      const error = new VError.WError(err as Error, 'Unable to get the envelopes.');
      return next(error);
    }
  }
});

export { router };
