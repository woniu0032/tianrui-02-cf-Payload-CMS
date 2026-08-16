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

interface ProductImage {
  url: string;
  type: 'main' | 'detail';
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

interface ProductData {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  image: string;
  images: ProductImage[];
  specs: ProductSpec[];
  features: string[];
  featuresEn: string[];
  category: string;
  categoryEn: string;
  content?: LexicalContent;
  layout?: LayoutBlock[];
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
    
    // Apply formatting based on format bitmask
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

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const isZh = language === 'zh';

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [related, setRelated] = useState<any[]>([]);

  // 从 Payload CMS 获取产品详情
  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;

      try {
        // 尝试从 Payload CMS 获取
        const productData = await fetchProductById(id);

        if (productData) {
          // 解析 Payload CMS 产品数据
          const attributes = productData.attributes || {};
          const images: ProductImage[] = [];

          // 处理图片数组
          if (productData.images && Array.isArray(productData.images)) {
            productData.images.forEach((img: any) => {
              if (img?.image?.url) {
                images.push({ url: img.image.url, type: img.sortOrder === 0 ? 'main' : 'detail' });
              }
            });
          }

          // 如果没有图片，使用主图
          if (images.length === 0 && productData.coverImage?.url) {
            images.push({ url: productData.coverImage.url, type: 'main' });
          }

          setProduct({
            id: productData.id,
            name: productData.name,
            nameEn: productData.nameEn || productData.name,
            description: productData.description || '',
            descriptionEn: productData.descriptionEn || productData.description || '',
            image: images[0]?.url || '',
            images: images,
            specs: [
              { label: '成分', labelEn: 'Composition', value: attributes.specifications?.find((s: any) => s.label === '成分')?.value || '88%棉 + 12%锦纶', valueEn: attributes.specifications?.find((s: any) => s.labelEn === 'Composition')?.value },
              { label: '克重', labelEn: 'Weight', value: attributes.specifications?.find((s: any) => s.label === '克重')?.value || '245 GSM', valueEn: attributes.specifications?.find((s: any) => s.labelEn === 'Weight')?.value },
              { label: '颜色', labelEn: 'Color', value: attributes.specifications?.find((s: any) => s.label === '颜色')?.value || '深蓝色', valueEn: attributes.specifications?.find((s: any) => s.labelEn === 'Color')?.value },
              { label: '型号', labelEn: 'Model', value: attributes.specifications?.find((s: any) => s.label === '型号')?.value || '-', valueEn: attributes.specifications?.find((s: any) => s.labelEn === 'Model')?.value },
              { label: '应用', labelEn: 'Application', value: attributes.applications?.[0]?.item || '阻燃工作服', valueEn: attributes.applications?.[0]?.itemEn },
            ],
            features: attributes.features?.map((f: any) => f.item) || ['阻燃', '防油', '防水', '防静电'],
            featuresEn: attributes.features?.map((f: any) => f.itemEn) || ['Flame Retardant', 'Oil Resistant', 'Waterproof', 'Anti-static'],
            category: productData.category,
            categoryEn: productData.categoryEn || productData.category,
            content: productData.content,
            layout: productData.layout,
          });

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
          // 如果 API 返回 null，使用静态数据
          console.log('API 返回空数据，使用静态数据');
          const staticProduct = staticProducts.find(p => p.id === id) || staticProducts[0];
          setProduct({
            id: staticProduct.id,
            name: staticProduct.name,
            nameEn: staticProduct.nameEn,
            description: staticProduct.desc,
            descriptionEn: staticProduct.descEn,
            image: staticProduct.image,
            images: [{ url: staticProduct.image, type: 'main' }],
            specs: [
              { label: '成分', labelEn: 'Composition', value: '100% Polyester' },
              { label: '克重', labelEn: 'Weight', value: '180-220g/m²' },
              { label: '幅宽', labelEn: 'Width', value: '150cm' },
              { label: '认证', labelEn: 'Certification', value: 'ISO, OEKO-TEX' },
            ],
            features: ['阻燃', '耐高温', '环保'],
            featuresEn: ['Flame Retardant', 'High Temp', 'Eco-friendly'],
            category: '阻燃面料',
            categoryEn: 'Flame Retardant',
          });
        }
      } catch (err) {
        console.error('获取产品出错:', err);
        // 出错时使用静态数据
        const staticProduct = staticProducts.find(p => p.id === id) || staticProducts[0];
        setProduct({
          id: staticProduct.id,
          name: staticProduct.name,
          nameEn: staticProduct.nameEn,
          description: staticProduct.desc,
          descriptionEn: staticProduct.descEn,
          image: staticProduct.image,
          images: [{ url: staticProduct.image, type: 'main' }],
          specs: [
            { label: '成分', labelEn: 'Composition', value: '100% Polyester' },
            { label: '克重', labelEn: 'Weight', value: '180-220g/m²' },
            { label: '幅宽', labelEn: 'Width', value: '150cm' },
            { label: '认证', labelEn: 'Certification', value: 'ISO, OEKO-TEX' },
          ],
          features: ['阻燃', '耐高温', '环保'],
          featuresEn: ['Flame Retardant', 'High Temp', 'Eco-friendly'],
          category: '阻燃面料',
          categoryEn: 'Flame Retardant',
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

  const allImages = product.images.length > 0 ? product.images : [{ url: product.image, type: 'main' }];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

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
                className="relative aspect-square mb-6 bg-white rounded-xl shadow-lg overflow-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <img 
                  src={allImages[currentImageIndex]?.url || product.image} 
                  alt={isZh ? product.name : product.nameEn} 
                  className="w-full h-full object-cover"
                />
                
                {/* 图片切换按钮 */}
                {allImages.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </>
                )}

                {/* 图片指示器 */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {allImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === currentImageIndex ? 'bg-blue-600 w-6' : 'bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* 产品标签 */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                    {isZh ? product.category : product.categoryEn}
                  </span>
                  <span className="px-3 py-1 bg-amber-500 text-white text-sm font-medium rounded-full flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {t('productDetail.flameRetardant')}
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
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img 
                        src={img.url} 
                        alt={`${isZh ? product.name : product.nameEn} ${idx + 1}`}
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
                  {isZh ? product.name : product.nameEn}
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-slate-600 text-lg leading-relaxed"
                >
                  {isZh ? product.description : product.descriptionEn}
                </motion.p>
              </div>

              {/* 功能特性标签 */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-2"
              >
                {(isZh ? product.features : product.featuresEn).map((feature, i) => (
                  <span 
                    key={i}
                    className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100 flex items-center gap-1"
                  >
                    {feature.includes('阻燃') || feature.includes('Flame') ? <Flame className="w-3 h-3" /> :
                     feature.includes('防水') || feature.includes('Water') ? <Droplets className="w-3 h-3" /> :
                     feature.includes('静电') || feature.includes('Static') ? <Zap className="w-3 h-3" /> :
                     <Shield className="w-3 h-3" />}
                    {feature}
                  </span>
                ))}
              </motion.div>

              {/* 产品参数 */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-50 rounded-xl p-6 border border-slate-100"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
                  {t('productDetail.specs')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {product.specs.map((spec, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 border border-slate-100">
                      <span className="text-slate-500 text-sm">{isZh ? spec.label : spec.labelEn}</span>
                      <p className="font-semibold text-slate-900 mt-1">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* 操作按钮 */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-4 pt-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => navigate('/inquiry'), 300);
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {t('products.inquiryNow')}
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  {t('products.download')}
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* 富文本内容区域 */}
        {product.content && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-white rounded-2xl shadow-lg p-8 lg:p-12"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
              {t('productDetail.productDescription') || '产品介绍'}
            </h2>
            <LexicalRichText content={product.content} />
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
            <LayoutBlocksRenderer blocks={product.layout} />
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
