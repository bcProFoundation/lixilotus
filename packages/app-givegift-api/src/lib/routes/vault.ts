import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let router = express.Router();

router.get('/vaults/:id/', async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    const gift = await prisma.vault.findUnique({
      where: {
        id: parseInt(id)
      }
    });
    res.json(gift);
  } catch (error) {
    res.json({
      error: `Vault with Id ${id} does not exist in the database.`
    })
  }
});

router.post('/vaults')

export { router };