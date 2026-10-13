import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { getProxyDecision } from '@/proxy-policy';

export const proxy = auth((req) => {
  const decision = getProxyDecision(req.nextUrl, Boolean(req.auth));

  if (decision.action === 'redirect') {
    return NextResponse.redirect(decision.target);
  }

  return NextResponse.next();
});

export default proxy;

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
