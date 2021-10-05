import express from 'express';

let router = express.Router();

router.get('/gifts/:id/', async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

});