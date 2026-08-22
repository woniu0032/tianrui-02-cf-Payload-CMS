import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, ShoppingCart, FileText, ChevronLeft, ChevronRight, Shield, Flame, Droplets, Zap, Play, Image as ImageIcon } from 'lucide-react';
import { fetchProductById, fetchProducts } from '../services/api';

interface ProductSpec {
  label: string;
  labelEn: string;
  value: string;
  valueEn?: string;
}

// Payload Lexical richText node types
interface LexicalTextNode {
  type: 'text';
  text: string;
  format: number;
  detail: number;
  mode: string;
  style: string;
}

interface LexicalElementNode {
  type: string;
  children: (LexicalTextNode | LexicalElementNode)[];
  format?: string;
  tag?: string;
  indent?: number;
  direction?: string;
}

interface LexicalRootNode {
  type: 'root';
  children: LexicalElementNode[];
  direction: string;
  format: string;
  indent: number;
  version: number;
}

interface LexicalContent {
  root: LexicalRootNode;
}

// Block types
interface ImageTextBlock {
  blockType: 'imageText';
  image?: { url: string };
  title?: string;
  titleEn?: string;
  content?: string;
  contentEn?: string;
  imagePosition?: 'left' | 'right';
}

interface VideoBlock {
  blockType: 'video';
  videoUrl?: string;
  title?: string;
}

interface SpecTableRow {
  label: string;
  labelEn?: string;
  value: string;
  valueEn?: string;
}

interface SpecTableBlock {
  blockType: 'specTable';
  title?: string;
  titleEn?: string;
  rows?: SpecTableRow[];
}

interface RichTextBlock {
  blockType: 'richText';
  content?: LexicalContent;
  contentEn?: LexicalContent;
}

interface GalleryImage {
  image?: { url: string };
  caption?: string;
  captionEn?: string;
}

interface GalleryBlock {
  blockType: 'gallery';
  images?: GalleryImage[];
}

type LayoutBlock = ImageTextBlock | VideoBlock | SpecTableBlock | RichTextBlock | GalleryBlock;

// 直接使用原始 API 数据结构（与 NewsDetail 一致）
interface ProductData {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  coverImage?: { url: string };
  images?: Array<{ image?: { url: string }; sortOrder?: number }>;
  category: string;
  categoryEn?: string;
  content?: LexicalContent;
  contentEn?: LexicalContent;
  layout?: LayoutBlock[];
  attributes?: {
    specifications?: ProductSpec[];
    materials?: Array<{ item: string; itemEn?: string }>;
    colors?: Array<{ item: string; itemEn?: string }>;
    features?: Array<{ item: string; itemEn?: string }>;
    techParams?: Array<{ label: string; labelEn?: string; value: string; valueEn?: string }>;
    applications?: Array<{ item: string; itemEn?: string }>;
  };
}

const staticProducts = [
  { id: '1', name: '阻燃工装面料', nameEn: 'Flame Retardant Workwear Fabric', category: 'fireproof', desc: '采用先进阻燃技术', descEn: 'Advanced flame retardant technology', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600' },
  { id: '2', name: '防水透气面料', nameEn: 'Waterproof Breathable Fabric', category: 'waterproof', desc: '三层复合结构', descEn: '3-layer composite', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600' },
  { id: '3', name: '抗静电面料', nameEn: 'Antistatic Fabric', category: 'antistatic', desc: '永久性抗静电处理', descEn: 'Permanent antistatic', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600' },
];

// Render Lexical richText to HTML
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
      return <a href={(elementNode as any).url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>;
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

// Render individual layout blocks
function ImageTextBlockComponent({ block, isZh }: { block: ImageTextBlock; isZh: boolean }) {
  const isLeft = block.imagePosition !== 'right';
  const title = isZh ? block.title : (block.titleEn || block.title);
  const content = isZh ? block.content : (block.contentEn || block.content);

  return (
    <div className={`grid md:grid-cols-2 gap-8 items-center ${isLeft ? '' : 'md:flex-row-reverse'}`}>
      <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden">
        {block.image?.url ? (
          <img src={block.image.url} alt={title || ''} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}
      </div>
      <div>
        {title && <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>}
        {content && <p className="text-slate-600 leading-relaxed">{content}</p>}
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
          <iframe 
            src={block.videoUrl} 
            className="w-full h-full"
            allowFullScreen
            title={block.title || 'Video'}
          />
        </div>
      ) : (
        <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center">
          <Play className="w-16 h-16 text-slate-400" />
        </div>
      )}
    </div>
  );
}

function SpecTableBlockComponent({ block, isZh }: { block: SpecTableBlock; isZh: boolean }) {
  const title = isZh ? block.title : (block.titleEn || block.title);
  return (
    <div className="space-y-4">
      {title && <h3 className="text-xl font-bold text-slate-900">{title}</h3>}
      {block.rows && block.rows.length > 0 ? (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-6 py-3 font-medium text-slate-700 border-b border-slate-200 w-1/3">{isZh ? row.label : (row.labelEn || row.label)}</td>
                  <td className="px-6 py-3 text-slate-600 border-b border-slate-200">{isZh ? row.value : (row.valueEn || row.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-slate-400 italic">{isZh ? '暂无参数数据' : 'No data available'}</p>
      )}
    </div>
  );
}

function RichTextBlockComponent({ block, isZh }: { block: RichTextBlock; isZh: boolean }) {
  return <LexicalRichText content={(isZh ? block.content : (block.contentEn || block.content))} />;
}

function GalleryBlockComponent({ block, isZh }: { block: GalleryBlock; isZh: boolean }) {
  return (
    <div className="space-y-4">
      {block.images && block.images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {block.images.map((img, i) => {
            const caption = isZh ? img.caption : (img.captionEn || img.caption);
            return (
              <div key={i} className="space-y-2">
                <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden">
                  {img.image?.url ? (
                    <img src={img.image.url} alt={caption || ''} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>
                {caption && <p className="text-sm text-slate-500 text-center">{caption}</p>}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-slate-400 italic">{isZh ? '暂无图片' : 'No images'}</p>
      )}
    </div>
  );
}

function LayoutBlocksRenderer({ blocks, isZh }: { blocks?: LayoutBlock[]; isZh: boolean }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="space-y-12">
      {blocks.map((block, i) => {
        switch (block.blockType) {
          case 'imageText':
            return <ImageTextBlockComponent key={i} block={block as ImageTextBlock} isZh={isZh} />;
          case 'video':
            return <VideoBlockComponent key={i} block={block as VideoBlock} />;
          case 'specTable':
            return <SpecTableBlockComponent key={i} block={block as SpecTableBlock} isZh={isZh} />;
          case 'richText':
            return <RichTextBlockComponent key={i} block={block as RichTextBlock} isZh={isZh} />;
          case 'gallery':
            return <GalleryBlockComponent key={i} block={block as GalleryBlock} isZh={isZh} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const isZh = language === 'zh';

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [related, setRelated] = useState<any[]>([]);

  // 从 Payload CMS 获取产品详情 — 直接存储原始 API 数据（与 NewsDetail 一致）
  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;

      try {
        const productData = await fetchProductById(id);

        if (productData) {
          // 直接存储原始 API 数据，不做中间映射
          setProduct(productData as ProductData);

          // 获取相关产品
          try {
            const relatedResponse = await fetchProducts({
              category: productData.category,
              limit: 3,
            });

            if (relatedResponse.data) {
              setRelated(relatedResponse.data
                .filter((item: any) => item.id !== id)
                .slice(0, 3)
                .map((item: any) => ({
                  id: item.id,
                  name: item.name,
                  nameEn: item.nameEn || item.name,
                  image: item.images?.[0]?.image?.url || item.coverImage?.url || '',
                }))
              );
            }
          } catch (err) {
            console.error('获取相关产品出错:', err);
          }
        } else {
          // API 返回 null，使用静态数据
          const staticProduct = staticProducts.find(p => p.id === id) || staticProducts[0];
          setProduct({
            id: staticProduct.id,
            name: staticProduct.name,
            nameEn: staticProduct.nameEn,
            description: staticProduct.desc,
            descriptionEn: staticProduct.descEn,
            category: staticProduct.category,
            categoryEn: 'Flame Retardant',
            images: [],
            attributes: {
              specifications: [
                { label: '成分', labelEn: 'Composition', value: '100% Polyester', valueEn: '100% Polyester' },
                { label: '克重', labelEn: 'Weight', value: '180-220g/m²', valueEn: '180-220g/m²' },
                { label: '幅宽', labelEn: 'Width', value: '150cm', valueEn: '150cm' },
                { label: '认证', labelEn: 'Certification', value: 'ISO, OEKO-TEX', valueEn: 'ISO, OEKO-TEX' },
              ],
              features: [
                { item: '阻燃', itemEn: 'Flame Retardant' },
                { item: '耐高温', itemEn: 'High Temperature' },
                { item: '环保', itemEn: 'Eco-friendly' },
              ],
            },
          });
        }
      } catch (err) {
        console.error('获取产品出错:', err);
        const staticProduct = staticProducts.find(p => p.id === id) || staticProducts[0];
        setProduct({
          id: staticProduct.id,
          name: staticProduct.name,
          nameEn: staticProduct.nameEn,
          description: staticProduct.desc,
          descriptionEn: staticProduct.descEn,
          category: staticProduct.category,
          categoryEn: 'Flame Retardant',
          images: [],
          attributes: {
            specifications: [
              { label: '成分', labelEn: 'Composition', value: '100% Polyester', valueEn: '100% Polyester' },
              { label: '克重', labelEn: 'Weight', value: '180-220g/m²', valueEn: '180-220g/m²' },
              { label: '幅宽', labelEn: 'Width', value: '150cm', valueEn: '150cm' },
              { label: '认证', labelEn: 'Certification', value: 'ISO, OEKO-TEX', valueEn: 'ISO, OEKO-TEX' },
            ],
            features: [
              { item: '阻燃', itemEn: 'Flame Retardant' },
              { item: '耐高温', itemEn: 'High Temperature' },
              { item: '环保', itemEn: 'Eco-friendly' },
            ],
          },
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  // 如果没有相关产品，使用静态数据
  const displayRelated = related.length > 0 ? related : staticProducts.filter(p => p.id !== id).slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
        <p className="text-gray-500">{t('productDetail.notFound')}</p>
        <button onClick={() => navigate('/products')} className="mt-4 text-blue-600 hover:underline">
          {t('productDetail.backToProducts')}
        </button>
        </div>
      </div>
    );
  }

  // 从原始 API 数据计算图片列表
  const allImages: Array<{ url: string; type: string }> = [];
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach((img) => {
      if (img?.image?.url) {
        allImages.push({ url: img.image.url, type: img.sortOrder === 0 ? 'main' : 'detail' });
      }
    });
  }
  if (allImages.length === 0 && product.coverImage?.url) {
    allImages.push({ url: product.coverImage.url, type: 'main' });
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // 从原始数据提取属性
  const specs = product.attributes?.specifications || [];
  const materials = product.attributes?.materials || [];
  const colors = product.attributes?.colors || [];
  const features = product.attributes?.features || [];
  const techParams = product.attributes?.techParams || [];
  const applications = product.attributes?.applications || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <motion.button 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/products')} 
          className="flex items-center text-blue-600 mb-6 hover:text-blue-800 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          {t('productDetail.backToProducts')}
        </motion.button>

        {/* 主产品展示区域 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="grid lg:grid-cols-2 gap-0">
            {/* 左侧：图片展示 */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 lg:p-12">
              {/* 主图 */}
              <motion.div
                className="relative aspect-square mb-6 bg-white rounded-2xl shadow-xl overflow-hidden group/img"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src={allImages[currentImageIndex]?.url || product.coverImage?.url || ''}
                  alt={isZh ? product.name : (product.nameEn || product.name)}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/img:scale-105"
                />

                {/* 图片切换按钮 */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-105 transition-all duration-200 opacity-0 group-hover/img:opacity-100"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-105 transition-all duration-200 opacity-0 group-hover/img:opacity-100"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </>
                )}

                {/* 图片指示器 */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-2">
                    {allImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`rounded-full transition-all duration-300 ${
                          idx === currentImageIndex ? 'bg-white w-6 h-2' : 'bg-white/50 w-2 h-2 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* 产品标签 */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1.5 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-semibold rounded-lg shadow-sm">
                    {isZh ? product.category : (product.categoryEn || product.category)}
                  </span>
                </div>
              </motion.div>

              {/* 缩略图 */}
              {allImages.length > 1 && (
                <div className="flex gap-3 justify-center">
                  {allImages.map((img, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        idx === currentImageIndex
                          ? 'border-blue-500 ring-2 ring-blue-200 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`${isZh ? product.name : (product.nameEn || product.name)} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* 右侧：产品信息 */}
            <div className="p-8 lg:p-12 space-y-6">
              {/* 标题区域 */}
              <div>
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3"
                >
                  {isZh ? product.name : (product.nameEn || product.name)}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-slate-600 text-lg leading-relaxed"
                >
                  {isZh ? product.description : (product.descriptionEn || product.description)}
                </motion.p>
              </div>

              {/* 功能特性标签 */}
              {features.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-wrap gap-2"
                >
                  {features.map((f, i) => {
                    const text = isZh ? f.item : (f.itemEn || f.item);
                    return (
                      <span
                        key={i}
                        className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100 flex items-center gap-1"
                      >
                        {text.includes('阻燃') || text.includes('Flame') ? <Flame className="w-3 h-3" /> :
                         text.includes('防水') || text.includes('Water') ? <Droplets className="w-3 h-3" /> :
                         text.includes('静电') || text.includes('Static') ? <Zap className="w-3 h-3" /> :
                         <Shield className="w-3 h-3" />}
                        {text}
                      </span>
                    );
                  })}
                </motion.div>
              )}

              {/* 产品参数 */}
              {specs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-slate-50 rounded-2xl p-6 border border-slate-100"
                >
                  <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2.5">
                    <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
                    {t('productDetail.specs')}
                  </h3>
                  <div className="space-y-0 divide-y divide-slate-100">
                    {specs.map((spec, i) => (
                      <div key={i} className="flex items-center justify-between py-3 table-row-hover px-2 -mx-2 rounded-lg">
                        <span className="text-slate-500 text-sm">{isZh ? spec.label : (spec.labelEn || spec.label)}</span>
                        <span className="font-semibold text-slate-900 text-sm">{isZh ? spec.value : (spec.valueEn || spec.value)}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 材质成分 */}
              {materials.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-slate-50 rounded-2xl p-6 border border-slate-100"
                >
                  <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2.5">
                    <span className="w-1 h-5 bg-green-600 rounded-full"></span>
                    {isZh ? '材质成分' : 'Materials'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {materials.map((m, i) => (
                      <span key={i} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
                        {isZh ? m.item : (m.itemEn || m.item)}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 颜色选项 */}
              {colors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-slate-50 rounded-2xl p-6 border border-slate-100"
                >
                  <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2.5">
                    <span className="w-1 h-5 bg-purple-600 rounded-full"></span>
                    {isZh ? '颜色选项' : 'Colors'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c, i) => (
                      <span key={i} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm border border-purple-200">
                        {isZh ? c.item : (c.itemEn || c.item)}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 技术参数 */}
              {techParams.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="bg-slate-50 rounded-2xl p-6 border border-slate-100"
                >
                  <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2.5">
                    <span className="w-1 h-5 bg-cyan-600 rounded-full"></span>
                    {isZh ? '技术参数' : 'Technical Parameters'}
                  </h3>
                  <div className="space-y-0 divide-y divide-slate-100">
                    {techParams.map((param, i) => (
                      <div key={i} className="flex items-center justify-between py-3 table-row-hover px-2 -mx-2 rounded-lg">
                        <span className="text-slate-500 text-sm">{isZh ? param.label : (param.labelEn || param.label)}</span>
                        <span className="font-semibold text-slate-900 text-sm">{isZh ? param.value : (param.valueEn || param.value)}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 应用领域 */}
              {applications.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-slate-50 rounded-2xl p-6 border border-slate-100"
                >
                  <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2.5">
                    <span className="w-1 h-5 bg-indigo-600 rounded-full"></span>
                    {isZh ? '应用领域' : 'Applications'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {applications.map((a, i) => (
                      <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm border border-indigo-200">
                        {isZh ? a.item : (a.itemEn || a.item)}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 操作按钮 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-4 pt-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 12px 28px -6px rgba(37, 99, 235, 0.35)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => navigate('/inquiry'), 300);
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg shadow-blue-200/60 flex items-center justify-center gap-2.5"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {t('products.inquiryNow')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 border-2 border-slate-200 text-slate-600 rounded-xl font-medium hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-300 flex items-center gap-2.5"
                >
                  <FileText className="w-5 h-5" />
                  {t('products.download')}
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* 富文本内容区域 */}
        {(isZh ? product.content : (product.contentEn || product.content)) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-white rounded-2xl shadow-lg p-8 lg:p-12"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
              {isZh ? (t('productDetail.productDescription') || '产品介绍') : 'Product Description'}
            </h2>
            <LexicalRichText content={(isZh ? product.content : (product.contentEn || product.content)) as LexicalContent} />
          </motion.div>
        )}

        {/* 页面布局 Blocks 区域 */}
        {product.layout && product.layout.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 bg-white rounded-2xl shadow-lg p-8 lg:p-12"
          >
            <LayoutBlocksRenderer blocks={product.layout} isZh={isZh} />
          </motion.div>
        )}

        {/* 相关产品 */}
        {displayRelated.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-16"
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
              <h2 className="text-2xl font-bold text-slate-900">{t('productDetail.relatedProducts')}</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {displayRelated.map((item, i) => (
                <motion.div 
                  key={item.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  whileHover={{ y: -5 }}
                  onClick={() => navigate(`/products/${item.id}`)} 
                  className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all border border-slate-100"
                >
                  <div className="aspect-video overflow-hidden bg-slate-100">
                    <img 
                      src={item.image} 
                      alt={isZh ? item.name : item.nameEn} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-slate-900 text-lg">{isZh ? item.name : item.nameEn}</h3>
                    <p className="text-blue-600 text-sm mt-2 font-medium">{t('products.viewDetails')}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
