import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPayload } from '@/getPayload'
import config from '@/payload.config'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const cookieStore = await cookies()
  const codeVerifier = cookieStore.get('pkce_code_verifier')?.value

  if (!code || !codeVerifier) {
    return NextResponse.json({ error: 'Missing code or verifier' }, { status: 400 })
  }

  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await fetch(
      process.env.ZITADEL_TOKEN_URL || 'http://localhost:8080/oauth/v2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.ZITADEL_CLIENT_ID || '',
          client_secret: process.env.ZITADEL_CLIENT_SECRET || '', // Include client secret for confidential clients
          code: code,
          redirect_uri:
            process.env.ZITADEL_REDIRECT_URI || 'http://localhost:3001/api/auth/zitadel/callback',
          code_verifier: codeVerifier,
        }),
      },
    )

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error('Failed to exchange authorization code for access token', tokenError);
      return NextResponse.json({ error: 'Failed to get token' }, { status: 500 });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user information from ZITADEL
    const userInfoResponse = await fetch(
      process.env.ZITADEL_USERINFO_URL || 'http://localhost:8080/oidc/v1/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!userInfoResponse.ok) {
      const userInfoError = await userInfoResponse.text();
      console.error('Failed to fetch user info from ZITADEL', userInfoError);
      return NextResponse.json({ error: 'Failed to get user info' }, { status: 500 });
    }

    const userInfo = await userInfoResponse.json();

    const payload = await getPayload({ config })

    // Find or create user in Payload
    const users = await payload.find({
      collection: 'users',
      where: {
        sub: {
          equals: userInfo.sub,
        },
      },
      limit: 1,
    })

    // Extract roles from ZITADEL and ensure user has at least 'user' role
    const zitadelRoles = userInfo['urn:zitadel:iam:org:project:roles'] || {};
    // Convert ZITADEL roles format to Payload-compatible format
    let roles = ['user']; // Default role

    if (zitadelRoles && typeof zitadelRoles === 'object') {
      // Extract role names from ZITADEL roles object
      roles = [...new Set([...roles, ...Object.keys(zitadelRoles)])];
    } else if (Array.isArray(zitadelRoles) && zitadelRoles.length > 0) {
      roles = [...new Set([...roles, ...zitadelRoles])];
    }

    // Ensure the user has at least the 'user' role to be able to log in
    // Add 'admin' role if the user is specified as an admin in environment variables
    if (userInfo.email && userInfo.email === process.env.ADMIN_EMAIL) {
      if (!roles.includes('admin')) {
        roles.push('admin');
      }
    } else if (!roles.includes('user') && !roles.includes('admin')) {
      // Ensure all users have at least the 'user' role to be able to log in
      roles.push('user');
    }

    const existingUser = users.docs[0]
    let userToLogin

    if (!existingUser) {
      userToLogin = await payload.create({
        collection: 'users',
        data: {
          email: userInfo.email,
          sub: userInfo.sub,
          name: userInfo.name || userInfo.preferred_username,
          roles: roles,
        },
      })
    } else {
      await payload.update({
        collection: 'users',
        id: existingUser.id,
        data: {
          name: userInfo.name || userInfo.preferred_username,
          roles: roles,
        },
      })
      // Re-fetch the user to ensure we have the full, updated document
      userToLogin = await payload.findByID({
        collection: 'users',
        id: existingUser.id,
      })
    }

    // Since we've authenticated the user via ZITADEL and created/updated them in Payload,
    // we need to create a session. For OAuth users, we'll use a special approach.

    // The proper way to handle this is to let Payload create the session automatically
    // when we return the response, but we need to make sure the user is properly logged in.

    // Create the response with the session cookie
    const res = NextResponse.redirect(
      process.env.ZITADEL_POST_LOGIN_REDIRECT_URL || 'http://localhost:5173/protected' // Redirect to frontend after login
    );

    // Clean up PKCE cookie
    res.cookies.delete('pkce_code_verifier');

    return res;
  } catch (error) {
    console.error('Error during ZITADEL callback:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
