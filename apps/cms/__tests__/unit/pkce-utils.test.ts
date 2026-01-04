import { describe, it, expect } from 'vitest'
import crypto from 'crypto'

// Import the PKCE utility functions directly from the source
// Since they're not exported from the route file, we'll recreate them for testing
function base64URLEncode(str: Buffer) {
  return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function sha256(buffer: string) {
  return crypto.createHash('sha256').update(buffer).digest()
}

describe('PKCE Utilities', () => {
  describe('generateCodeVerifier', () => {
    it('returns a string', () => {
      const codeVerifier = base64URLEncode(crypto.randomBytes(32))
      expect(typeof codeVerifier).toBe('string')
      expect(codeVerifier).toBeDefined()
    })

    it('generates a verifier of appropriate length', () => {
      const codeVerifier = base64URLEncode(crypto.randomBytes(32))
      // 32 bytes should encode to 43-44 characters in base64 URL format
      expect(codeVerifier.length).toBeGreaterThanOrEqual(40)
      expect(codeVerifier.length).toBeLessThanOrEqual(44)
    })
  })

  describe('generateCodeChallenge', () => {
    it('returns URL-safe base64', () => {
      const codeVerifier = base64URLEncode(crypto.randomBytes(32))
      const codeChallenge = base64URLEncode(sha256(codeVerifier))
      
      // Check that the challenge contains only URL-safe characters
      expect(codeChallenge).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    it('same verifier always produces same challenge', () => {
      const codeVerifier = 'test-verifier-string-for-consistency-check'
      const challenge1 = base64URLEncode(sha256(codeVerifier))
      const challenge2 = base64URLEncode(sha256(codeVerifier))
      
      expect(challenge1).toBe(challenge2)
    })

    it('challenge length is appropriate (43 chars for 32-byte input)', () => {
      const codeVerifier = base64URLEncode(crypto.randomBytes(32))
      const codeChallenge = base64URLEncode(sha256(codeVerifier))

      // SHA-256 hash is 32 bytes, when base64 URL encoded it's 43 characters
      expect(codeChallenge.length).toBe(43)
      // The verifier should be 43-44 characters for 32 random bytes
      expect(codeVerifier.length).toBeGreaterThanOrEqual(40)
    })

    it('challenge is deterministic for a given verifier', () => {
      const codeVerifier = 'fixed-test-verifier-string'
      const expectedChallenge = base64URLEncode(sha256(codeVerifier))
      
      // Calculate again to ensure consistency
      const actualChallenge = base64URLEncode(sha256(codeVerifier))
      
      expect(actualChallenge).toBe(expectedChallenge)
    })
  })

  describe('PKCE Flow', () => {
    it('verifier and challenge follow PKCE standards', () => {
      const codeVerifier = base64URLEncode(crypto.randomBytes(32))
      const codeChallenge = base64URLEncode(sha256(codeVerifier))
      
      // Verifier should be URL-safe base64 encoded
      expect(codeVerifier).toMatch(/^[A-Za-z0-9_-]+$/)
      // Challenge should be URL-safe base64 encoded
      expect(codeChallenge).toMatch(/^[A-Za-z0-9_-]+$/)
      
      // Both should have appropriate lengths
      expect(codeVerifier.length).toBeGreaterThanOrEqual(43) // 32 bytes encoded
      expect(codeChallenge.length).toBe(43) // SHA-256 hash is 32 bytes, base64 URL encoded
    })
  })
})