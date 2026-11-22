import { NextResponse } from 'next/server';

import { unstable_update } from '@/auth';

export async function POST() {
  try {
    const session = await unstable_update({});
    if (!session || session.error || !session.user?.accessToken) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }
    return NextResponse.json({
      accessToken: session.user.accessToken,
      expiresAt: session.user.expiresAt,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to refresh session' },
      { status: 401 },
    );
  }
}
