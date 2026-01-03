import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true, // Enable Payload's auth system which will be managed by ZITADEL plugin
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    // Add any additional fields you want to store for users
    // The ZITADEL plugin will handle the authentication fields
  ],
}
