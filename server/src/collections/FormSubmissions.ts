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
      type: 'select',
      label: '表单类型',
      required: true,
      options: [
        { label: '联系表单', value: 'contact' },
        { label: '询价表单', value: 'inquiry' },
        { label: '反馈表单', value: 'feedback' },
        { label: '留言表单', value: 'message' },
      ],
      index: true,
    },
    {
      name: 'data',
      type: 'json',
      label: '表单数据',
    },
    {
      name: 'status',
      type: 'select',
      label: '状态',
      options: [
        { label: '待处理', value: 'pending' },
        { label: '已处理', value: 'processed' },
        { label: '已归档', value: 'archived' },
      ],
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
