import type { CollectionConfig } from 'payload'

export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  admin: {
    useAsTitle: 'formType',
    defaultColumns: ['formType', 'status', 'ipAddress', 'createdAt'],
    group: '数据管理',
  },
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [
    {
      name: 'formType',
      type: 'text',
      label: '表单类型',
      required: true,
      index: true,
    },
    {
      name: 'data',
      type: 'json',
      label: '表单数据',
    },
    {
      name: 'status',
      type: 'text',
      label: '状态',
      defaultValue: 'pending',
      index: true,
    },
    {
      name: 'ipAddress',
      type: 'text',
      label: 'IP 地址',
    },
    {
      name: 'userAgent',
      type: 'text',
      label: 'User Agent',
    },
    {
      name: 'notes',
      type: 'textarea',
      label: '处理备注',
    },
    {
      name: 'processedBy',
      type: 'relationship',
      label: '处理人',
      relationTo: 'users',
    },
    {
      name: 'processedAt',
      type: 'date',
      label: '处理时间',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
}
