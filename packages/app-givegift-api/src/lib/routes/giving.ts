import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let router = express.Router();

router.get('/giving/:id/', async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    const giving = await prisma.givingAway.findUnique({
      where: {
        id: id
      }
    });
    res.json(giving);
  } catch (error) {
    res.json({
      error: `Giving with Id ${id} does not exist in the database.`
    })
  }
});

export { router };