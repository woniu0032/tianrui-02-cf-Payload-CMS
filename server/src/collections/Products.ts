import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'price', 'isActive', 'updatedAt'],
    group: '内容管理',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: '产品名称',
      required: true,
      index: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: '产品描述',
    },
    {
      name: 'price',
      type: 'number',
      label: '价格',
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'category',
      type: 'text',
      label: '分类',
      required: true,
      index: true,
    },
    {
      name: 'images',
      type: 'array',
      label: '产品图片',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'sortOrder',
          type: 'number',
          defaultValue: 0,
        },
      ],
    },
    {
      name: 'content',
      type: 'json',
      label: '富文本内容',
    },
    {
      name: 'layout',
      type: 'json',
      label: '页面布局',
    },
    {
      name: 'attributes',
      type: 'group',
      label: '产品属性',
      fields: [
        {
          name: 'specifications',
          type: 'array',
          label: '规格参数',
          fields: [
            { name: 'label', type: 'text' },
            { name: 'value', type: 'text' },
          ],
        },
        {
          name: 'materials',
          type: 'array',
          label: '材质',
          fields: [{ name: 'item', type: 'text' }],
        },
        {
          name: 'colors',
          type: 'array',
          label: '颜色',
          fields: [{ name: 'item', type: 'text' }],
        },
        {
          name: 'features',
          type: 'array',
          label: '特点',
          fields: [{ name: 'item', type: 'text' }],
        },
        {
          name: 'techParams',
          type: 'array',
          label: '技术参数',
          fields: [
            { name: 'label', type: 'text' },
            { name: 'value', type: 'text' },
          ],
        },
        {
          name: 'applications',
          type: 'array',
          label: '应用场景',
          fields: [{ name: 'item', type: 'text' }],
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: '上架状态',
      defaultValue: true,
      index: true,
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: '排序',
      defaultValue: 0,
      index: true,
    },
    {
      name: 'meta',
      type: 'group',
      label: 'SEO 信息',
      fields: [
        { name: 'title', type: 'text', label: 'SEO 标题' },
        { name: 'description', type: 'textarea', label: 'SEO 描述' },
        { name: 'keywords', type: 'text', label: '关键词' },
      ],
    },
  ],
}
