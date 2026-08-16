import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, Calendar, User, Eye, Image as ImageIcon, Play } from 'lucide-react';
import { fetchNewsById, type News } from '../services/api';

// Lexical richText types
interface LexicalTextNode {
  type: 'text';
  text: string;
  format: number;
}

interface LexicalElementNode {
  type: string;
  children: (LexicalTextNode | LexicalElementNode)[];
  tag?: string;
  format?: string;
  url?: string;
}

interface LexicalRootNode {
  type: 'root';
  children: LexicalElementNode[];
}

interface LexicalContent {
  root: LexicalRootNode;
}

// Block types
interface ImageTextBlock {
  blockType: 'imageText';
  image?: { url: string };
  title?: string;
  content?: string;
  imagePosition?: 'left' | 'right';
}

interface VideoBlock {
  blockType: 'video';
  videoUrl?: string;
  title?: string;
}

interface SpecTableRow {
  label: string;
  value: string;
}

interface SpecTableBlock {
  blockType: 'specTable';
  title?: string;
  rows?: SpecTableRow[];
}

interface RichTextBlock {
  blockType: 'richText';
  content?: LexicalContent;
}

interface GalleryImage {
  image?: { url: string };
  caption?: string;
}

interface GalleryBlock {
  blockType: 'gallery';
  images?: GalleryImage[];
}

type LayoutBlock = ImageTextBlock | VideoBlock | SpecTableBlock | RichTextBlock | GalleryBlock;

// Render Lexical richText
function renderLexicalNode(node: LexicalTextNode | LexicalElementNode): React.ReactNode {
  if (node.type === 'text') {
    const textNode = node as LexicalTextNode;
    let content: React.ReactNode = textNode.text;
    if (textNode.format & 1) content = <strong>{content}</strong>;
    if (textNode.format & 2) content = <em>{content}</em>;
    if (textNode.format & 4) content = <u>{content}</u>;
    if (textNode.format & 8) content = <s>{content}</s>;
    return content;
  }

  const elementNode = node as LexicalElementNode;
  const children = elementNode.children.map((child, i) => (
    <React.Fragment key={i}>{renderLexicalNode(child)}</React.Fragment>
  ));

  switch (elementNode.type) {
    case 'paragraph':
      return <p className="mb-4 last:mb-0">{children}</p>;
    case 'heading':
      const Tag = elementNode.tag || 'h2';
      const headingClass = Tag === 'h2' ? 'text-2xl font-bold mb-4 mt-6' :
                          Tag === 'h3' ? 'text-xl font-semibold mb-3 mt-5' :
                          'text-lg font-medium mb-2 mt-4';
      return <Tag className={headingClass}>{children}</Tag>;
    case 'list':
      const ListTag = elementNode.format === 'bullet' ? 'ul' : 'ol';
      return <ListTag className="list-disc pl-6 mb-4 space-y-1">{children}</ListTag>;
    case 'listitem':
      return <li>{children}</li>;
    case 'link':
      return <a href={elementNode.url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>;
    default:
      return <div>{children}</div>;
  }
}

function LexicalRichText({ content }: { content?: LexicalContent }) {
  if (!content?.root?.children?.length) return null;
  return (
    <div className="prose prose-slate max-w-none">
      {content.root.children.map((node, i) => (
        <React.Fragment key={i}>{renderLexicalNode(node)}</React.Fragment>
      ))}
    </div>
  );
}

// Block components
function ImageTextBlockComponent({ block }: { block: ImageTextBlock }) {
  const isLeft = block.imagePosition !== 'right';
  return (
    <div className={`grid md:grid-cols-2 gap-8 items-center ${isLeft ? '' : 'md:flex-row-reverse'}`}>
      <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden">
        {block.image?.url ? (
          <img src={block.image.url} alt={block.title || ''} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}
      </div>
      <div>
        {block.title && <h3 className="text-xl font-bold text-slate-900 mb-3">{block.title}</h3>}
        {block.content && <p className="text-slate-600 leading-relaxed">{block.content}</p>}
      </div>
    </div>
  );
}

function VideoBlockComponent({ block }: { block: VideoBlock }) {
  return (
    <div className="space-y-4">
      {block.title && <h3 className="text-xl font-bold text-slate-900">{block.title}</h3>}
      {block.videoUrl ? (
        <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden">
          <iframe src={block.videoUrl} className="w-full h-full" allowFullScreen title={block.title || 'Video'} />
        </div>
      ) : (
        <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center">
          <Play className="w-16 h-16 text-slate-400" />
        </div>
      )}
    </div>
  );
}

function SpecTableBlockComponent({ block }: { block: SpecTableBlock }) {
  return (
    <div className="space-y-4">
      {block.title && <h3 className="text-xl font-bold text-slate-900">{block.title}</h3>}
      {block.rows && block.rows.length > 0 ? (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-6 py-3 font-medium text-slate-700 border-b border-slate-200 w-1/3">{row.label}</td>
                  <td className="px-6 py-3 text-slate-600 border-b border-slate-200">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-slate-400 italic">暂无参数数据</p>
      )}
    </div>
  );
}

function RichTextBlockComponent({ block }: { block: RichTextBlock }) {
  return <LexicalRichText content={block.content} />;
}

function GalleryBlockComponent({ block }: { block: GalleryBlock }) {
  return (
    <div className="space-y-4">
      {block.images && block.images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {block.images.map((img, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden">
                {img.image?.url ? (
                  <img src={img.image.url} alt={img.caption || ''} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
              </div>
              {img.caption && <p className="text-sm text-slate-500 text-center">{img.caption}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 italic">暂无图片</p>
      )}
    </div>
  );
}

function LayoutBlocksRenderer({ blocks }: { blocks?: LayoutBlock[] }) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <div className="space-y-12">
      {blocks.map((block, i) => {
        switch (block.blockType) {
          case 'imageText':
            return <ImageTextBlockComponent key={i} block={block as ImageTextBlock} />;
          case 'video':
            return <VideoBlockComponent key={i} block={block as VideoBlock} />;
          case 'specTable':
            return <SpecTableBlockComponent key={i} block={block as SpecTableBlock} />;
          case 'richText':
            return <RichTextBlockComponent key={i} block={block as RichTextBlock} />;
          case 'gallery':
            return <GalleryBlockComponent key={i} block={block as GalleryBlock} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      if (!id) return;
      try {
        const data = await fetchNewsById(id);
        setNews(data);
      } catch (err) {
        console.error('Failed to fetch news:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">新闻未找到</p>
          <button onClick={() => navigate('/news')} className="mt-4 text-blue-600 hover:underline">
            返回新闻列表
          </button>
        </div>
      </div>
    );
  }

  const dateStr = news.publishedAt
    ? new Date(news.publishedAt).toLocaleDateString('zh-CN')
    : new Date(news.createdAt).toLocaleDateString('zh-CN');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-20 -mt-20 pt-[240px]">
        <div className="max-w-4xl mx-auto px-4">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => navigate('/news')}
            className="flex items-center text-blue-200 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回新闻列表
          </motion.button>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            {news.title}
          </motion.h1>
          <div className="flex flex-wrap items-center gap-6 text-blue-200 text-sm">
            <span className="flex items-center"><Calendar className="w-4 h-4 mr-2" />{dateStr}</span>
            <span className="flex items-center"><User className="w-4 h-4 mr-2" />{news.author || '管理员'}</span>
            <span className="flex items-center"><Eye className="w-4 h-4 mr-2" />{news.viewCount || 0} 次阅读</span>
            {news.category && <span className="bg-blue-800/50 px-3 py-1 rounded-full">{news.category}</span>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Cover Image */}
        {news.coverImage?.url && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 rounded-2xl overflow-hidden shadow-lg"
          >
            <img src={news.coverImage.url} alt={news.title} className="w-full aspect-video object-cover" />
          </motion.div>
        )}

        {/* Summary */}
        {news.summary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-10 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl"
          >
            <p className="text-lg text-slate-700 leading-relaxed">{news.summary}</p>
          </motion.div>
        )}

        {/* RichText Content */}
        {news.content && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <LexicalRichText content={news.content as unknown as LexicalContent} />
          </motion.div>
        )}

        {/* Layout Blocks */}
        {news.layout && news.layout.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <LayoutBlocksRenderer blocks={news.layout as unknown as LayoutBlock[]} />
          </motion.div>
        )}

        {/* Tags */}
        {news.tags && news.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-slate-200">
            {news.tags.map((tagItem: any, i: number) => (
              <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
                #{tagItem.tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
