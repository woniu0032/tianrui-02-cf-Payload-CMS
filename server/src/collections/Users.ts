import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    tokenExpiration: 7200, // 2 hours
    verify: false,
    maxLoginAttempts: 5,
    lockTime: 600000, // 10 minutes
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: '姓名',
    },
    {
      name: 'role',
      type: 'text',
      label: '角色',
      defaultValue: 'editor',
      required: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      label: '头像',
      relationTo: 'media',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: '启用',
      defaultValue: true,
    },
  ],
}
