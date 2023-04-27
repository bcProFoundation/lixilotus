import type { IronSessionOptions } from 'iron-session';

import type { LocalUser } from './localUser';

export const sessionOptions: IronSessionOptions = {
  password: process.env.IRON_SESSION_SECRET as string,
  cookieName: 'iron-session',
  cookieOptions: {
    secure: process.env.NODE_ENV != 'production'
  }
};

// This is where we specify the typings of req.session.*
declare module 'iron-session' {
  interface IronSessionData {
    localUser?: LocalUser;
  }
}
