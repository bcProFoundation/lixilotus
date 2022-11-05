import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session/edge';
import { sessionOptions } from './models/session';

function shouldExclude(request: NextRequest) {
  const path = request.nextUrl.pathname;

  return (
    path.startsWith('/_api') || //  exclude all API routes
    path.startsWith('/static') || // exclude static files
    path.includes('.') || // exclude all files in the public folder
    path.startsWith('/claimed')
  );
}

export const middleware = async (req: NextRequest) => {
  const res = NextResponse.next();

  if (shouldExclude(req)) {
    return res;
  }

  const { pathname } = req.nextUrl;

  const session = await getIronSession(req, res, sessionOptions);

  const { localUser } = session;

  if (pathname == '/' && session && (localUser == undefined || localUser == null)) {
    return res;
  }

  if (!localUser) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return res;
};

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/((?!_api|claimed|static|favicon.ico).*)']
};
