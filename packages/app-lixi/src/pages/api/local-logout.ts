import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { LocalUser } from 'src/models/localUser';
import { sessionOptions } from 'src/models/session';

async function localLogoutRoute(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Process a POST request

    req.session.localUser = null;
    await req.session.save();

    res.send({ ok: true });
  }
}

export default withIronSessionApiRoute(localLogoutRoute, sessionOptions);
