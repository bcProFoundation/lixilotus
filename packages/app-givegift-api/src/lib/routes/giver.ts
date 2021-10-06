import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let router = express.Router();

router.get('/givers/:id/', async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    const giver = await prisma.giver.findUnique({
      where: {
        id: id
      }
    });
    res.json(giver);
  } catch (error) {
    res.json({
      error: `Giver with Id ${id} does not exist in the database.`
    })
  }
});

export { router };