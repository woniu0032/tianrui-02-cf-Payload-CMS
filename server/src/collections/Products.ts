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
 * 图文混排区块：左图右文 / 右图左文
 */
const imageTextBlock: Block = {
  slug: 'imageText',
  labels: { singular: '图文混排', plural: '图文混排' },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: '图片',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      label: '标题',
    },
    {
      name: 'content',
      type: 'textarea',
      label: '文字内容',
    },
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
    {
      name: 'videoUrl',
      type: 'text',
      label: '视频链接',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      label: '视频标题',
    },
  ],
}

/**
 * 参数表格区块
 */
const specTableBlock: Block = {
  slug: 'specTable',
  labels: { singular: '参数表格', plural: '参数表格' },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '表格标题',
    },
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
 * 富文本区块（用于在 layout 中插入自由排版的文字段落）
 */
const richTextBlock: Block = {
  slug: 'richText',
  labels: { singular: '富文本', plural: '富文本' },
  fields: [
    {
      name: 'content',
      type: 'richText',
      label: '内容',
    },
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
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: '图片',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          label: '说明文字',
        },
      ],
    },
  ],
}

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
