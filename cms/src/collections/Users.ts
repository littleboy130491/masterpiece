import type { CollectionConfig } from 'payload'
import { admins, adminsField, loggedIn } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role'],
    group: 'Admin',
  },
  auth: true,
  access: {
    read: loggedIn,
    create: admins,
    delete: admins,
    // Everyone can edit their own account; admins can edit anyone.
    update: ({ req }) => (req.user?.role === 'admin' ? true : { id: { equals: req.user?.id } }),
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      access: { update: adminsField },
      options: [
        { label: 'Admin: everything, including users and developer settings', value: 'admin' },
        { label: 'Editor: all site content', value: 'editor' },
        { label: 'Sales: unit status only', value: 'sales' },
      ],
    },
  ],
}
