import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

function base64URLEncode(str: Buffer) {
  return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function sha256(buffer: string) {
  return crypto.createHash('sha256').update(buffer).digest()
}

export async function GET(_req: NextRequest) {
  try {
    const codeVerifier = base64URLEncode(crypto.randomBytes(32))
    const codeChallenge = base64URLEncode(sha256(codeVerifier))

    const authorizationUrl = new URL(
      process.env.ZITADEL_AUTHORIZATION_URL || 'http://localhost:8080/oauth/v2/authorize',
    )
    authorizationUrl.searchParams.set('client_id', process.env.ZITADEL_CLIENT_ID || '')
    authorizationUrl.searchParams.set('response_type', 'code')
    authorizationUrl.searchParams.set(
      'redirect_uri',
      process.env.ZITADEL_REDIRECT_URI || 'http://localhost:3001/api/auth/zitadel/callback',
    )
    authorizationUrl.searchParams.set('scope', 'openid email profile urn:zitadel:iam:org:project:roles')
    authorizationUrl.searchParams.set('code_challenge', codeChallenge)
    authorizationUrl.searchParams.set('code_challenge_method', 'S256')

    const res = NextResponse.redirect(authorizationUrl.toString())

    res.cookies.set('pkce_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    })

    return res
  } catch (error) {
    console.error('Error during ZITADEL auth initiation:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
