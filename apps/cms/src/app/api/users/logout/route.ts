import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from '@/getPayload';
import config from '@/payload.config';

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config });

    // Logout the user
    await payload.logout({
      collection: 'users',
      req, // Pass the request object to handle session deletion
    });

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
