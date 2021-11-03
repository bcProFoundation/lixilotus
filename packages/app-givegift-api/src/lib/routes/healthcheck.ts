import express from 'express';

let router = express.Router();

router.get('/healthcheck', async (req: express.Request, res: express.Response) => {
  res.json({ status: true });
});

export { router };
