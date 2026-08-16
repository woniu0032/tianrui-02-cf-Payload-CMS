import type { Block, CollectionConfig } from 'payload'
import {
  BlocksFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  StrikethroughFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

/**
 * 图文混排区块
 */
const imageTextBlock: Block = {
  slug: 'imageText',
  labels: { singular: '图文混排', plural: '图文混排' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', label: '图片', required: true },
    { name: 'title', type: 'text', label: '标题' },
    { name: 'content', type: 'textarea', label: '文字内容' },
    {
      name: 'imagePosition',
      type: 'select',
      label: '图片位置',
      defaultValue: 'left',
      options: [
        { label: '左侧', value: 'left' },
        { label: '右侧', value: 'right' },
      ],
    },
  ],
}

/**
 * 视频嵌入区块
 */
const videoBlock: Block = {
  slug: 'video',
  labels: { singular: '视频嵌入', plural: '视频嵌入' },
  fields: [
    { name: 'videoUrl', type: 'text', label: '视频链接', required: true },
    { name: 'title', type: 'text', label: '视频标题' },
  ],
}

/**
 * 参数表格区块
 */
const specTableBlock: Block = {
  slug: 'specTable',
  labels: { singular: '参数表格', plural: '参数表格' },
  fields: [
    { name: 'title', type: 'text', label: '表格标题' },
    {
      name: 'rows',
      type: 'array',
      label: '表格行',
      fields: [
        { name: 'label', type: 'text', label: '参数名', required: true },
        { name: 'value', type: 'text', label: '参数值', required: true },
      ],
    },
  ],
}

/**
 * 富文本区块
 */
const richTextBlock: Block = {
  slug: 'richText',
  labels: { singular: '富文本', plural: '富文本' },
  fields: [
    { name: 'content', type: 'richText', label: '内容' },
  ],
}

/**
 * 图片画廊区块
 */
const galleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: '图片画廊', plural: '图片画廊' },
  fields: [
    {
      name: 'images',
      type: 'array',
      label: '图片列表',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', label: '图片', required: true },
        { name: 'caption', type: 'text', label: '说明文字' },
      ],
    },
  ],
}

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
      type: 'richText',
      label: '富文本内容',
      editor: lexicalEditor({
        features: () => [
          FixedToolbarFeature(),
          InlineToolbarFeature(),
          ParagraphFeature(),
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          BoldFeature(),
          ItalicFeature(),
          UnderlineFeature(),
          StrikethroughFeature(),
          UnorderedListFeature(),
          OrderedListFeature(),
          LinkFeature(),
          UploadFeature(),
        ],
      }),
    },
    {
      name: 'layout',
      type: 'blocks',
      label: '页面布局',
      blocks: [imageTextBlock, videoBlock, specTableBlock, richTextBlock, galleryBlock],
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
