import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from '@/getPayload';
import config from '@/payload.config';

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const { email, password } = await req.json();

    // Attempt to login with the provided credentials
    const response = await payload.login({
      collection: 'users',
      data: {
        email,
        password,
      },
      req, // Pass the request object to handle session creation
    });

    // Return the login response
    return NextResponse.json(response);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
}
