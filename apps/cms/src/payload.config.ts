import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { zitadelPlugin } from 'payload-zitadel-plugin'

import { Media } from './collections/Media'
import { Products } from './collections/Products'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Products],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    zitadelPlugin({
      clientID: process.env.ZITADEL_CLIENT_ID,
      clientSecret: process.env.ZITADEL_CLIENT_SECRET,
      issuerUrl: process.env.ZITADEL_URL,
      authorizationURL: process.env.ZITADEL_AUTH_URL,
      tokenURL: process.env.ZITADEL_TOKEN_URL,
      userInfoURL: process.env.ZITADEL_USERINFO_URL,
      postLoginRedirectUrl: process.env.PUBLIC_APP_URL,
      redirectUri: `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/users/callback`,
    })
  ],
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },
  cors: [
    'http://localhost:5173', // Frontend origin
    ...(process.env.NODE_ENV === 'development'
      ? ['http://localhost:5173']
      : []),
  ],
  csrf: [
    'http://localhost:5173', // Frontend origin
    ...(process.env.NODE_ENV === 'development'
      ? ['http://localhost:5173']
      : []),
  ],
})
