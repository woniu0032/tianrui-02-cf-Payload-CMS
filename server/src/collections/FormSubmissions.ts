import type { CollectionConfig } from 'payload'
import { sendFormNotification } from '../utils/sendFormNotification'

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
      name: 'customerName',
      type: 'text',
      label: '客户姓名',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'email',
      type: 'email',
      label: '邮箱',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'phone',
      type: 'text',
      label: '电话',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'companyName',
      type: 'text',
      label: '公司名称',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'productName',
      type: 'text',
      label: '产品名称',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'quantity',
      type: 'text',
      label: '数量',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      label: '留言内容',
      admin: {
        description: '客户的详细咨询内容',
      },
    },
    {
      name: 'data',
      type: 'json',
      label: '原始表单数据',
      admin: {
        readOnly: true,
        description: '系统自动保存的完整表单数据(JSON格式)',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: '状态',
      defaultValue: 'pending',
      index: true,
      options: [
        { label: '待处理', value: 'pending' },
        { label: '已处理', value: 'processed' },
        { label: '已回复', value: 'replied' },
        { label: '已关闭', value: 'closed' },
      ],
    },
    {
      name: 'ipAddress',
      type: 'text',
      label: 'IP 地址',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'userAgent',
      type: 'text',
      label: 'User Agent',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: '处理备注',
      admin: {
        description: '内部处理记录,客户不可见',
      },
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
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // 从 data JSON 中提取常用字段到独立字段
        if (operation === 'create' && data.data) {
          const formData = data.data as Record<string, any>
          data.customerName = formData.customer_name || formData.name || ''
          data.email = formData.email || ''
          data.phone = formData.phone || ''
          data.companyName = formData.company_name || formData.company || ''
          data.productName = formData.product_name || formData.product || ''
          data.quantity = formData.quantity || ''
          data.message = formData.message || formData.content || ''
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation }) => {
        // 仅在创建新表单且类型为 inquiry/message 时发送邮件通知
        if (operation === 'create' && (doc.formType === 'inquiry' || doc.formType === 'message')) {
          await sendFormNotification({
            formType: doc.formType,
            customerName: doc.customerName,
            email: doc.email,
            phone: doc.phone,
            companyName: doc.companyName,
            productName: doc.productName,
            quantity: doc.quantity,
            message: doc.message,
          })
        }
      },
    ],
  },
}
