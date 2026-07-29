import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: '../../uploads',
    mimeTypes: [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        height: undefined,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    formatOptions: {
      format: 'webp',
      options: {
        quality: 80,
      },
    },
  },
  admin: {
    useAsTitle: 'filename',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: '替代文本',
    },
    {
      name: 'caption',
      type: 'text',
      label: '说明文字',
    },
    {
      name: 'category',
      type: 'select',
      label: '分类',
      options: [
        { label: '产品图片', value: 'product' },
        { label: '新闻封面', value: 'news' },
        { label: '工厂照片', value: 'factory' },
        { label: '其他', value: 'other' },
      ],
      defaultValue: 'other',
    },
  ],
}
