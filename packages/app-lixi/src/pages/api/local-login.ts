import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { LocalUser } from 'src/shared/models/localUser';
import { sessionOptions } from 'src/shared/models/session';

async function localLoginRoute(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Process a POST request
    const { id, address, name } = await req.body;

    const localUser: LocalUser = {
      isLocalLoggedIn: true,
      id,
      address,
      name
    };

    req.session.localUser = localUser;
    await req.session.save();

    res.send({ ok: true });
  }
}

export default withIronSessionApiRoute(localLoginRoute, sessionOptions);
