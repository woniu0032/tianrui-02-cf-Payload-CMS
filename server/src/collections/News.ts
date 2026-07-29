import type { CollectionConfig } from 'payload'

export const News: CollectionConfig = {
  slug: 'news',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'author', 'isPublished', 'publishedAt', 'updatedAt'],
    group: '内容管理',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '标题',
      required: true,
      index: true,
    },
    {
      name: 'summary',
      type: 'textarea',
      label: '摘要',
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
      name: 'coverImage',
      type: 'upload',
      label: '封面图片',
      relationTo: 'media',
    },
    {
      name: 'author',
      type: 'text',
      label: '作者',
      defaultValue: '管理员',
    },
    {
      name: 'category',
      type: 'text',
      label: '分类',
      required: true,
      index: true,
    },
    {
      name: 'tags',
      type: 'array',
      label: '标签',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      label: '已发布',
      defaultValue: false,
      index: true,
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: '发布时间',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      index: true,
    },
    {
      name: 'viewCount',
      type: 'number',
      label: '浏览次数',
      defaultValue: 0,
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
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // 自动设置发布时间
        if (operation === 'create' && data.isPublished && !data.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }
        if (operation === 'update' && data.isPublished && !data.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }
        return data
      },
    ],
  },
}
