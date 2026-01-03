import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  serverExternalPackages: ['sharp'],
  env: {
    PAYLOAD_PUBLIC_SERVER_URL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
    ZITADEL_CLIENT_ID: process.env.ZITADEL_CLIENT_ID,
    ZITADEL_URL: process.env.ZITADEL_URL,
  },
}

console.log('PAYLOAD_PUBLIC_SERVER_URL in next.config.mjs:', process.env.PAYLOAD_PUBLIC_SERVER_URL);

export default withPayload(nextConfig, { devBundleServerPackages: false })
