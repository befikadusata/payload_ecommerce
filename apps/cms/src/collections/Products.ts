import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true, // Public read access
    create: ({ req }) => {
      // Only authenticated users can create products
      return Boolean(req.user);
    },
    update: ({ req }) => {
      // Only authenticated users can update products
      return Boolean(req.user);
    },
    delete: ({ req }) => {
      // Only users with admin role can delete products
      return req.user?.roles?.includes('admin') || req.user?.roles?.includes('editor');
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
    {
      name: 'variants',
      type: 'array',
      fields: [
        {
          name: 'size',
          type: 'text',
          label: 'Size',
        },
        {
          name: 'color',
          type: 'text',
          label: 'Color',
        },
        {
          name: 'stock',
          type: 'number',
          label: 'Stock',
          min: 0,
        },
        {
          name: 'additionalPrice',
          type: 'number',
          label: 'Additional Price',
          min: 0,
        },
      ],
    },
  ],
}