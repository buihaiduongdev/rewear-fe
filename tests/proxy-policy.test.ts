import { getProxyDecision } from '@/proxy-policy';
import { describe, expect, it } from 'vitest';

describe('Public marketplace access', () => {
  it('allows a guest to open Home and share a filtered catalog URL', () => {
    expect(getProxyDecision(new URL('http://localhost:5000/'), false)).toEqual({
      action: 'next',
    });
    expect(
      getProxyDecision(
        new URL('http://localhost:5000/products?search=wool'),
        false,
      ),
    ).toEqual({ action: 'next' });
    expect(
      getProxyDecision(
        new URL(
          'http://localhost:5000/products/b0c16928-8686-4e58-86fc-b7ef5d89fb0e',
        ),
        false,
      ),
    ).toEqual({ action: 'next' });
    expect(
      getProxyDecision(
        new URL(
          'http://localhost:5000/shops/b0c16928-8686-4e58-86fc-b7ef5d89fb0e',
        ),
        false,
      ),
    ).toEqual({ action: 'next' });
    expect(
      getProxyDecision(new URL('http://localhost:5000/help'), false),
    ).toEqual({ action: 'next' });
  });

  it('keeps other application routes protected and preserves their destination', () => {
    const decision = getProxyDecision(
      new URL('http://localhost:5000/account?tab=addresses'),
      false,
    );
    expect(decision.action).toBe('redirect');
    if (decision.action === 'redirect') {
      expect(decision.target.pathname).toBe('/login');
      expect(decision.target.searchParams.get('callbackUrl')).toBe(
        '/account?tab=addresses',
      );
    }
  });

  it('allows payment return and cancel routes through without redirecting mid-callback', () => {
    expect(
      getProxyDecision(
        new URL('http://localhost:5000/payment-result?paymentId=pay-1'),
        false,
      ),
    ).toEqual({ action: 'next' });
    expect(
      getProxyDecision(
        new URL('http://localhost:5000/payment-cancel?checkoutId=chk-1'),
        false,
      ),
    ).toEqual({ action: 'next' });
  });

  it('keeps auth forms available to guests and redirects signed-in users Home', () => {
    const url = new URL('http://localhost:5000/login');
    expect(getProxyDecision(url, false)).toEqual({ action: 'next' });
    const decision = getProxyDecision(url, true);
    expect(decision.action).toBe('redirect');
    if (decision.action === 'redirect')
      expect(decision.target.pathname).toBe('/');
  });
});
