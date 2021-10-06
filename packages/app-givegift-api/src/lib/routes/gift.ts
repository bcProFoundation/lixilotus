import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let router = express.Router();

router.get('/gifts/:id/', async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    const gift = await prisma.gift.findUnique({
      where: {
        id: id
      }
    });
    res.json(gift);
  } catch (error) {
    res.json({
      error: `Gift with Id ${id} does not exist in the database.`
    })
  }
});

export { router };