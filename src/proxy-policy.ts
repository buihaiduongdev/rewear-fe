import { AUTH_ROUTES } from '@/modules/auth/constants/route.constant';

type ProxyDecision = { action: 'next' } | { action: 'redirect'; target: URL };

const isAuthRoute = (pathname: string) =>
  Object.values(AUTH_ROUTES).some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

export const getProxyDecision = (
  url: URL,
  isLoggedIn: boolean,
): ProxyDecision => {
  const authRoute = isAuthRoute(url.pathname);

  if (authRoute && isLoggedIn) {
    return {
      action: 'redirect',
      target: new URL('/', url),
    };
  }

  if (!authRoute && !isLoggedIn) {
    const loginUrl = new URL(AUTH_ROUTES.LOGIN, url);
    loginUrl.searchParams.set('callbackUrl', `${url.pathname}${url.search}`);

    return {
      action: 'redirect',
      target: loginUrl,
    };
  }

  return { action: 'next' };
};
