import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session/edge';
import { sessionOptions } from './models/session';

export const middleware = async (req: NextRequest) => {
  const res = NextResponse.next();

  const { pathname } = req.nextUrl;

  const session = await getIronSession(req, res, sessionOptions);

  const { localUser } = session;

  if (pathname == '/onboarding' && !localUser) {
    return NextResponse.next();
  }

  if (localUser?.isLocalLoggedIn !== true) {
    // unauthorized to see pages inside admin/
    return NextResponse.redirect(new URL('/onboarding', req.url)); // redirect to /unauthorized page
  }

  return res;
};

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/((?!api|static|favicon.ico).*)']
};
