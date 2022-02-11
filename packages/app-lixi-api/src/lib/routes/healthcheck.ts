import { PrismaClient } from '@prisma/client';
import express, { NextFunction } from 'express';
import VError from 'verror';

let router = express.Router();

const prisma = new PrismaClient();

router.get('/healthcheck', async (req: express.Request, res: express.Response, next: NextFunction) => {

  const existedRedeems = await prisma.$queryRaw`SELECT 1`;
  if (!existedRedeems) {
    const error = new VError('Database is shuting down');
    return next(error);
  }
  
  res.json({ status: true });
});

export { router };
