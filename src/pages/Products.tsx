import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { X, ChevronRight, Flame, Droplets, Shield, Zap, HeartPulse, Layers, Move, Sun, Palette, Leaf, CircleDot, Send } from 'lucide-react';
import { fetchProducts, API_BASE_URL, getHeaders } from '../services/api';

interface FabricMaterial {
  id: string;
  name: string;
  nameEn: string;
  icon: React.ReactNode;
  subMenu?: { name: string; nameEn: string; dbCategory: string }[];
  description: string;
  descriptionEn: string;
  features: string[];
  featuresEn: string[];
  specs: { label: string; labelEn: string; value: string }[];
  applications: string[];
  applicationsEn: string[];
  dbCategory: string; // 对应后台 Payload CMS 的 category 字段值
}

interface LexicalContent {
  root?: { children?: any[] };
}

interface LayoutBlock {
  blockType: string;
  [key: string]: any;
}

interface Product {
  id: string;
  name: string;
  nameEn: string;
  image: string;
  description: string;
  descriptionEn: string;
  price?: number;
  content?: LexicalContent;
  contentEn?: LexicalContent;
  layout?: LayoutBlock[];
  attributes?: {
    specifications?: { label: string; value: string }[];
    materials?: { item: string }[];
    colors?: { item: string }[];
    features?: { item: string }[];
    techParams?: { label: string; value: string }[];
    applications?: { item: string }[];
  };
}

const fabricMaterials: FabricMaterial[] = [
  {
    id: 'flame-retardant',
    name: '阻燃面料',
    nameEn: 'Flame Retardant Fabric',
    icon: <Flame className="w-6 h-6" />,
    subMenu: [
      { name: '芳纶', nameEn: 'Aramid', dbCategory: '芳纶' },
      { name: '后整理阻燃', nameEn: 'Finished FR', dbCategory: '后整理阻燃' }
    ],
    description: '采用先进阻燃技术处理，具有优异的防火性能，遇火不燃烧、不熔滴，有效保护穿着者安全。广泛应用于石油、化工、电力、冶金等行业的工装制服。',
    descriptionEn: 'Advanced flame retardant technology, excellent fire resistance, non-combustible and non-dripping. Widely used in petroleum, chemical, power, and metallurgy industries.',
    features: ['永久阻燃', '耐高温', '不熔滴', '环保无毒'],
    featuresEn: ['Permanent Flame Retardant', 'High Temperature Resistant', 'Non-dripping', 'Eco-friendly'],
    specs: [
      { label: '阻燃等级', labelEn: 'Flame Retardant Level', value: 'EN11612 / NFPA2112' },
      { label: '耐温范围', labelEn: 'Temp Range', value: '-40°C ~ 260°C' },
      { label: '洗涤次数', labelEn: 'Wash Cycles', value: '≥100次' },
    ],
    applications: ['石油化工工装', '电力行业制服', '冶金防护服', '消防服装'],
    applicationsEn: ['Petrochemical Workwear', 'Power Industry Uniforms', 'Metallurgy Protection', 'Firefighter Clothing'],
    dbCategory: '芳纶',
  },
  {
    id: 'three-proof',
    name: '三防面料',
    nameEn: 'Three-Proof Fabric',
    icon: <Shield className="w-6 h-6" />,
    subMenu: [
      { name: '防水面料', nameEn: 'Waterproof', dbCategory: '防水面料' },
      { name: '防油面料', nameEn: 'Oil Resistant', dbCategory: '防油面料' },
      { name: '易去污面料', nameEn: 'Stain Resistant', dbCategory: '易去污面料' }
    ],
    description: '防水、防油、防污三合一功能面料，采用纳米技术处理，在纤维表面形成保护膜，有效抵御各种液体和油污渗透。',
    descriptionEn: 'Waterproof, oil-proof, and stain-proof 3-in-1 functional fabric with nano-technology protection film.',
    features: ['防水透气', '防油防污', '易清洗', '持久耐用'],
    featuresEn: ['Waterproof & Breathable', 'Oil & Stain Resistant', 'Easy Clean', 'Durable'],
    specs: [
      { label: '防水等级', labelEn: 'Waterproof Level', value: '≥10000mm' },
      { label: '透气指数', labelEn: 'Breathability', value: '≥8000g/m²/24h' },
      { label: '防油等级', labelEn: 'Oil Resistance', value: '≥6级' },
    ],
    applications: ['户外工作服', '厨师服装', '医疗防护服', '工业围裙'],
    applicationsEn: ['Outdoor Workwear', 'Chef Uniforms', 'Medical Protection', 'Industrial Aprons'],
    dbCategory: '防水面料',
  },
  {
    id: 'acid-alkali',
    name: '防酸碱面料',
    nameEn: 'Acid & Alkali Resistant',
    icon: <Droplets className="w-6 h-6" />,
    description: '专业防化学腐蚀面料，能有效抵御强酸、强碱等化学品的侵蚀，保护作业人员安全，适用于化工、实验室等环境。',
    descriptionEn: 'Professional chemical-resistant fabric, effective against strong acids and alkalis.',
    features: ['防强酸', '防强碱', '防化学腐蚀', '高密封性'],
    featuresEn: ['Acid Resistant', 'Alkali Resistant', 'Chemical Resistant', 'High Sealing'],
    specs: [
      { label: '耐酸等级', labelEn: 'Acid Resistance', value: '80%硫酸' },
      { label: '耐碱等级', labelEn: 'Alkali Resistance', value: '30%氢氧化钠' },
      { label: '防护时间', labelEn: 'Protection Time', value: '≥60分钟' },
    ],
    applications: ['化工厂防护服', '实验室工作服', '电镀行业', '污水处理'],
    applicationsEn: ['Chemical Protection', 'Lab Workwear', 'Electroplating', 'Wastewater Treatment'],
    dbCategory: '防酸碱面料',
  },
  {
    id: 'antistatic',
    name: '防静电面料',
    nameEn: 'Antistatic Fabric',
    icon: <Zap className="w-6 h-6" />,
    description: '永久性抗静电处理面料，表面电阻稳定，能有效消除静电积聚，防止静电放电引起的火灾和爆炸危险。',
    descriptionEn: 'Permanent antistatic treatment with stable surface resistance, prevents static discharge hazards.',
    features: ['永久抗静电', '电阻稳定', '无尘洁净', '舒适透气'],
    featuresEn: ['Permanent Antistatic', 'Stable Resistance', 'Dust-free', 'Breathable'],
    specs: [
      { label: '表面电阻', labelEn: 'Surface Resistance', value: '10⁶-10Ω' },
      { label: '电荷密度', labelEn: 'Charge Density', value: '<7μc/m²' },
      { label: '洗涤耐久', labelEn: 'Wash Durability', value: '≥50次' },
    ],
    applications: ['电子车间工装', '防爆环境', '无尘车间', '石油化工'],
    applicationsEn: ['Electronics Workshop', 'Explosion-proof', 'Cleanroom', 'Petrochemical'],
    dbCategory: '防静电面料',
  },
  {
    id: 'medical',
    name: '医护面料',
    nameEn: 'Medical Fabric',
    icon: <HeartPulse className="w-6 h-6" />,
    description: '专为医疗行业设计的功能性面料，具有抗菌、防液体渗透、易清洗消毒等特性，符合医疗卫生标准。',
    descriptionEn: 'Functional fabric for medical industry with antibacterial and fluid-resistant properties.',
    features: ['抗菌防臭', '防液体渗透', '易清洗', '耐消毒'],
    featuresEn: ['Antibacterial', 'Fluid Resistant', 'Easy Clean', 'Disinfection Resistant'],
    specs: [
      { label: '抗菌率', labelEn: 'Antibacterial Rate', value: '≥99%' },
      { label: '阻隔率', labelEn: 'Barrier Rate', value: '≥95%' },
      { label: '耐洗次数', labelEn: 'Wash Cycles', value: '≥75次' },
    ],
    applications: ['医生服', '护士服', '手术服', '病号服'],
    applicationsEn: ['Doctor Coats', 'Nurse Uniforms', 'Surgical Gowns', 'Patient Gowns'],
    dbCategory: '医护面料',
  },
  {
    id: 'poly-cotton',
    name: '涤棉面料',
    nameEn: 'Poly-cotton Fabric',
    icon: <Layers className="w-6 h-6" />,
    description: '涤纶与棉纤维混纺面料，兼具涤纶的强度和棉的舒适性，性价比高，是工装制服的主流选择。',
    descriptionEn: 'Polyester-cotton blend combining strength and comfort, cost-effective for workwear.',
    features: ['强度高', '不易皱', '易打理', '性价比高'],
    featuresEn: ['High Strength', 'Wrinkle Resistant', 'Easy Care', 'Cost-effective'],
    specs: [
      { label: '混纺比例', labelEn: 'Blend Ratio', value: 'T/C 65/35' },
      { label: '克重范围', labelEn: 'Weight Range', value: '150-280g/m²' },
      { label: '幅宽', labelEn: 'Width', value: '150cm' },
    ],
    applications: ['工装制服', '校服', '职业装', '休闲服'],
    applicationsEn: ['Workwear', 'School Uniforms', 'Business Wear', 'Casual Wear'],
    dbCategory: '涤棉面料',
  },
  {
    id: 'elastic',
    name: '弹力面料',
    nameEn: 'Elastic Fabric',
    icon: <Move className="w-6 h-6" />,
    subMenu: [
      { name: 'T400面料', nameEn: 'T400 Fabric', dbCategory: 'T400面料' },
      { name: '氨纶面料', nameEn: 'Spandex Fabric', dbCategory: '氨纶面料' }
    ],
    description: '添加氨纶等弹性纤维，具有优异的弹性和回复性，穿着舒适不紧绷，活动自如。',
    descriptionEn: 'With spandex for excellent elasticity and recovery, comfortable and flexible.',
    features: ['高弹性', '回复性好', '不紧绷', '活动自如'],
    featuresEn: ['High Elasticity', 'Good Recovery', 'Non-restrictive', 'Flexible'],
    specs: [
      { label: '弹性纤维', labelEn: 'Elastic Fiber', value: '氨纶/莱卡' },
      { label: '伸长率', labelEn: 'Elongation', value: '≥20%' },
      { label: '回复率', labelEn: 'Recovery', value: '≥95%' },
    ],
    applications: ['运动服', '瑜伽服', '紧身工装', '休闲裤'],
    applicationsEn: ['Sportswear', 'Yoga Wear', 'Fitted Workwear', 'Casual Pants'],
    dbCategory: 'T400面料',
  },
  {
    id: 'fluorescent',
    name: '荧光面料',
    nameEn: 'Fluorescent Fabric',
    icon: <Sun className="w-6 h-6" />,
    description: '高可视性荧光面料，在夜间或低光环境下具有强烈的反光效果，提高穿着者的安全性。',
    descriptionEn: 'High-visibility fluorescent fabric with strong reflective effect in low light.',
    features: ['高可视性', '反光条', '耐光色牢', '安全警示'],
    featuresEn: ['High Visibility', 'Reflective Strips', 'Light Fastness', 'Safety Warning'],
    specs: [
      { label: '反光系数', labelEn: 'Reflective Coeff', value: '≥330cd/lux/m²' },
      { label: '荧光面积', labelEn: 'Fluorescent Area', value: '≥0.2m²' },
      { label: '色牢度', labelEn: 'Color Fastness', value: '≥4级' },
    ],
    applications: ['交通工作服', '环卫服装', '建筑工地', '救援服装'],
    applicationsEn: ['Traffic Workwear', 'Sanitation Uniforms', 'Construction', 'Rescue Clothing'],
    dbCategory: '荧光面料',
  },
  {
    id: 'printed',
    name: '印花面料',
    nameEn: 'Printed Fabric',
    icon: <Palette className="w-6 h-6" />,
    description: '采用先进印花技术，图案清晰色彩鲜艳，色牢度高，可定制各种图案和花型。',
    descriptionEn: 'Advanced printing technology with clear patterns and vibrant colors.',
    features: ['图案清晰', '色彩鲜艳', '色牢度高', '可定制'],
    featuresEn: ['Clear Patterns', 'Vibrant Colors', 'High Color Fastness', 'Customizable'],
    specs: [
      { label: '印花方式', labelEn: 'Printing Method', value: '数码/圆网' },
      { label: '色牢度', labelEn: 'Color Fastness', value: '≥4级' },
      { label: '套色数', labelEn: 'Color Sets', value: '≤12色' },
    ],
    applications: ['时尚工装', '休闲服装', '家纺产品', '箱包面料'],
    applicationsEn: ['Fashion Workwear', 'Casual Wear', 'Home Textiles', 'Bag Fabric'],
    dbCategory: '印花面料',
  },
  {
    id: 'linen',
    name: '亚麻面料',
    nameEn: 'Linen Fabric',
    icon: <Leaf className="w-6 h-6" />,
    description: '天然亚麻纤维面料，吸湿透气，凉爽舒适，具有天然的抗菌性能，是夏季服装的理想选择。',
    descriptionEn: 'Natural linen fiber with moisture absorption, breathability, and antibacterial properties.',
    features: ['天然纤维', '吸湿透气', '凉爽舒适', '抗菌防螨'],
    featuresEn: ['Natural Fiber', 'Moisture Absorbing', 'Cool Comfort', 'Antibacterial'],
    specs: [
      { label: '纤维含量', labelEn: 'Fiber Content', value: '100%亚麻' },
      { label: '克重', labelEn: 'Weight', value: '120-200g/m²' },
      { label: '幅宽', labelEn: 'Width', value: '140-150cm' },
    ],
    applications: ['夏季工装', '休闲衬衫', '高档制服', '家居服'],
    applicationsEn: ['Summer Workwear', 'Casual Shirts', 'Premium Uniforms', 'Loungewear'],
    dbCategory: '亚麻面料',
  },
  {
    id: 'wool',
    name: '羊毛面料',
    nameEn: 'Wool Fabric',
    icon: <CircleDot className="w-6 h-6" />,
    description: '优质羊毛面料，保暖性极佳，手感柔软，悬垂性好，适合制作高档职业装和冬季制服。',
    descriptionEn: 'Premium wool fabric with excellent warmth, soft hand feel, and good drape.',
    features: ['保暖性好', '手感柔软', '悬垂性佳', '高档质感'],
    featuresEn: ['Excellent Warmth', 'Soft Hand Feel', 'Good Drape', 'Premium Quality'],
    specs: [
      { label: '羊毛含量', labelEn: 'Wool Content', value: '50%-100%' },
      { label: '克重', labelEn: 'Weight', value: '280-450g/m²' },
      { label: '幅宽', labelEn: 'Width', value: '150cm' },
    ],
    applications: ['高档西装', '冬季制服', '职业套装', '大衣外套'],
    applicationsEn: ['Premium Suits', 'Winter Uniforms', 'Business Sets', 'Coats'],
    dbCategory: '羊毛面料',
  },
];

export default function Products() {
  const { language, t } = useLanguage();
  const isZh = language === 'zh';
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedMaterial, setSelectedMaterial] = useState<FabricMaterial | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);

  const handleMaterialClick = (material: FabricMaterial, subCategory?: string) => {
    setSelectedMaterial(material);
    setActiveCategory(material.id);
    setActiveSubCategory(subCategory || null);
  };

  // 从 URL 参数读取分类并自动选中
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      // 查找对应的 material
      const matchedMaterial = fabricMaterials.find(m =>
        m.subMenu?.some(sub => sub.dbCategory === categoryParam) || m.dbCategory === categoryParam
      );

      if (matchedMaterial) {
        // 检查是否是子分类
        const isSubCategory = matchedMaterial.subMenu?.some(sub => sub.dbCategory === categoryParam);
        if (isSubCategory) {
          handleMaterialClick(matchedMaterial, categoryParam);
        } else {
          handleMaterialClick(matchedMaterial);
        }
      }
    }
  }, [searchParams]);

  // 路由切换时重置所有状态(但保留URL参数触发的选择)
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (!categoryParam) {
      setSelectedMaterial(null);
      setSelectedProduct(null);
      setActiveCategory(null);
      setActiveSubCategory(null);
    }
  }, [location.pathname, searchParams]);

  // 一次性拉取所有产品并按 category 分组
  useEffect(() => {
    async function fetchAllProducts() {
      try {
        // depth=2 让 content(richText) 和 layout(blocks) 中的 media 关联返回完整对象
        const response = await fetch(`${API_BASE_URL}/api/products?limit=500&depth=2`, { headers: getHeaders(false) });
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        const docs = data.docs || [];

        if (docs && docs.length > 0) {
          const grouped: Record<string, Product[]> = {};
          for (const item of docs) {
            const category = item.category || '';
            if (!grouped[category]) {
              grouped[category] = [];
            }

            // 解析图片 URL：若 depth=2 未生效导致 image 为数字 ID，则主动请求 media 详情
            let imageUrl = 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400';
            const img = item.images?.[0]?.image;
            if (typeof img === 'object' && img !== null && 'url' in img) {
              imageUrl = img.url;
            } else if (typeof img === 'string') {
              imageUrl = img;
            } else if (typeof img === 'number') {
              // depth 未生效，image 是 media ID，需要单独请求
              try {
                const mediaRes = await fetch(`${API_BASE_URL}/api/media/${img}`, { headers: getHeaders(false) });
                if (mediaRes.ok) {
                  const mediaData = await mediaRes.json();
                  imageUrl = mediaData.url || mediaData.sizes?.thumbnail?.url || imageUrl;
                }
              } catch (e) {
                console.warn(`Failed to fetch media ${img}:`, e);
              }
            } else if (item.coverImage?.url) {
              imageUrl = item.coverImage.url;
            }

            grouped[category].push({
              id: item.id,
              name: item.name,
              nameEn: item.nameEn || item.name,
              image: imageUrl,
              description: item.description || '',
              descriptionEn: item.descriptionEn || item.description || '',
              price: item.price,
          content: item.content,
          contentEn: item.contentEn,
          layout: item.layout,
              attributes: item.attributes,
            });
          }
          setProductsByCategory(grouped);
        } else {
          setProductsByCategory({});
        }
      } catch (err) {
        console.error('获取产品数据失败:', err);
        setProductsByCategory({});
      } finally {
        setLoading(false);
      }
    }

    fetchAllProducts();
  }, []);

  const handleProductClick = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  // 获取当前选中分类对应的产品列表
  const getCurrentProducts = (): Product[] => {
    if (!selectedMaterial) return [];
    
    // 如果有选中的子分类，显示子分类产品
    if (activeSubCategory) {
      return productsByCategory[activeSubCategory] || [];
    }
    
    // 如果有二级菜单，显示该分类下所有子分类的产品
    if (selectedMaterial.subMenu && selectedMaterial.subMenu.length > 0) {
      const allProducts: Product[] = [];
      selectedMaterial.subMenu.forEach(sub => {
        const subProducts = productsByCategory[sub.dbCategory] || [];
        allProducts.push(...subProducts);
      });
      return allProducts;
    }
    
    // 没有二级菜单，直接显示该分类产品
    return productsByCategory[selectedMaterial.dbCategory] || [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-32 -mt-20 pt-[240px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            {t('products.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-blue-100 text-lg max-w-2xl mx-auto"
          >
            {t('products.subtitle')}
          </motion.p>
        </div>
      </div>

      {/* Material Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6">
          {fabricMaterials.map((material, index) => {
            const hasSubMenu = material.subMenu && material.subMenu.length > 0;
            const productCount = hasSubMenu
              ? material.subMenu!.reduce((sum, sub) => sum + (productsByCategory[sub.dbCategory]?.length || 0), 0)
              : (productsByCategory[material.dbCategory]?.length || 0);
            return (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`relative group cursor-pointer bg-white rounded-2xl transition-all duration-300 border-2 card-hover-lift ${
                  activeCategory === material.id
                    ? 'border-blue-500 shadow-lg shadow-blue-100 ring-2 ring-blue-100'
                    : 'border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-lg'
                }`}
              >
                {/* 主菜单内容 */}
                <div onClick={() => handleMaterialClick(material)} className="p-6 pb-5">
                  <div className={`flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md shadow-blue-200 transition-all duration-300 ${
                    activeCategory === material.id ? 'scale-110' : 'group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-200'
                  }`}>
                    {material.icon}
                  </div>
                  <h3 className="text-center font-bold text-gray-900 mb-1.5 text-[15px] group-hover:text-blue-600 transition-colors duration-200">
                    {isZh ? material.name : material.nameEn}
                  </h3>
                  <p className="text-center text-xs text-gray-400 font-medium tracking-wide">
                    {loading ? '...' : `${productCount} ${t('products.productCount')}`}
                  </p>
                </div>
                <div className="h-1 rounded-b-2xl bg-gradient-to-r from-blue-500 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                {/* 子菜单 - 纯CSS hover控制，无需JS定时器 */}
                {hasSubMenu && (
                  <div className="absolute left-0 right-0 top-full z-[60] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {/* 透明桥接区域 - 32px高确保鼠标平滑过渡 */}
                    <div className="h-8 w-full" />
                    <div className="bg-gradient-to-b from-blue-50 to-white rounded-xl shadow-2xl border-2 border-blue-300 py-3 -mt-1">
                      <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-50 border-t-2 border-l-2 border-blue-300 rotate-45"></div>
                      {material.subMenu!.map((subItem, subIdx) => (
                        <div
                          key={subIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMaterialClick(material, subItem.dbCategory);
                          }}
                          className="relative px-4 py-2.5 text-sm font-medium text-blue-800 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 cursor-pointer border-b border-blue-100 last:border-b-0"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            {isZh ? subItem.name : subItem.nameEn}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Product Grid */}
      <AnimatePresence>
        {selectedMaterial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white border-t border-gray-200"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    {selectedMaterial.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {isZh ? selectedMaterial.name : selectedMaterial.nameEn}
                      {activeSubCategory && (
                        <span className="text-blue-600 ml-2">
                          - {isZh 
                            ? selectedMaterial.subMenu?.find(s => s.dbCategory === activeSubCategory)?.name
                            : selectedMaterial.subMenu?.find(s => s.dbCategory === activeSubCategory)?.nameEn
                          }
                        </span>
                      )}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {isZh ? selectedMaterial.description : selectedMaterial.descriptionEn}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMaterial(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-xl overflow-hidden animate-pulse">
                      <div className="aspect-square bg-gray-200" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : getCurrentProducts().length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">{isZh ? '该分类暂无产品' : 'No products in this category yet'}</p>
                </div>
              ) : (
                /* Dynamic Grid */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6">
                  {getCurrentProducts().map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.04 }}
                      onClick={(e) => handleProductClick(product, e)}
                      className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-100 card-hover-lift"
                    >
                      <div className="aspect-square overflow-hidden bg-gray-100 relative">
                        <img
                          src={product.image}
                          alt={isZh ? product.name : product.nameEn}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="p-4 pb-5">
                        <h4 className="font-semibold text-gray-900 mb-1.5 text-[15px] group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
                          {isZh ? product.name : product.nameEn}
                        </h4>
                        <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                          {isZh ? product.description : product.descriptionEn}
                        </p>
                        <div className="mt-3 flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                          {t('products.viewDetails')}
                          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && selectedMaterial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid md:grid-cols-2 h-full">
                {/* Left: Image */}
                <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 p-8 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-20 h-20 rounded-full bg-blue-400/20"
                        initial={{ x: Math.random() * 400, y: Math.random() * 400 }}
                        animate={{
                          x: [Math.random() * 400, Math.random() * 400],
                          y: [Math.random() * 400, Math.random() * 400],
                        }}
                        transition={{
                          duration: 8 + Math.random() * 4,
                          repeat: Infinity,
                          repeatType: 'reverse',
                        }}
                      />
                    ))}
                  </div>
                  
                  <motion.div
                    className="relative z-10"
                    initial={{ rotateY: -15 }}
                    animate={{ rotateY: [0, 5, 0, -5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <motion.img
                      src={selectedProduct.image}
                      alt={isZh ? selectedProduct.name : selectedProduct.nameEn}
                      className="w-64 h-64 object-cover rounded-xl shadow-2xl"
                      whileHover={{ scale: 1.05, rotateY: 10 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    />
                  </motion.div>

                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-sm font-medium text-blue-700">
                    {selectedMaterial.icon}
                    {isZh ? selectedMaterial.name : selectedMaterial.nameEn}
                  </div>
                </div>

                {/* Right: Product Details */}
                <div className="p-8 overflow-y-auto max-h-[90vh]">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {isZh ? selectedProduct.name : selectedProduct.nameEn}
                      </h2>
                      <p className="text-gray-600">
                        {isZh ? selectedProduct.description : selectedProduct.descriptionEn}
                      </p>
                    </div>
                    <button
                      onClick={closeModal}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* 后台真实字段：价格 */}
                  {typeof selectedProduct.price === 'number' && (
                    <div className="mb-6 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                      <span className="text-sm text-gray-500">{isZh ? '价格' : 'Price'}</span>
                      <span className="text-xl font-bold text-blue-700">¥{selectedProduct.price}</span>
                    </div>
                  )}

                  {/* 后台填写的产品属性 */}
                  {selectedProduct.attributes && (
                    <div className="space-y-5 mb-8">
                      {/* 规格参数 */}
                      {selectedProduct.attributes.specifications && selectedProduct.attributes.specifications.length > 0 && selectedProduct.attributes.specifications.some(s => s.value) && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                            {t('products.specifications')}
                          </h3>
                          <div className="space-y-2">
                            {selectedProduct.attributes.specifications.map((spec, i) => (
                              <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-500">{isZh ? spec.label : (spec.labelEn || spec.label)}</span>
                                <span className="font-medium text-gray-900">{isZh ? spec.value : (spec.valueEn || spec.value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 材质 */}
                      {selectedProduct.attributes.materials && selectedProduct.attributes.materials.length > 0 && selectedProduct.attributes.materials.some(m => m.item) && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                            {isZh ? '材质' : 'Materials'}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedProduct.attributes.materials.map((m, i) => (
                              <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                {isZh ? m.item : (m.itemEn || m.item)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 颜色 */}
                      {selectedProduct.attributes.colors && selectedProduct.attributes.colors.length > 0 && selectedProduct.attributes.colors.some(c => c.item) && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                            {isZh ? '颜色' : 'Colors'}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedProduct.attributes.colors.map((c, i) => (
                              <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                {isZh ? c.item : (c.itemEn || c.item)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 特点 */}
                      {selectedProduct.attributes.features && selectedProduct.attributes.features.length > 0 && selectedProduct.attributes.features.some(f => f.item) && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                            {t('products.features')}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedProduct.attributes.features.map((f, i) => (
                              <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                                {isZh ? f.item : (f.itemEn || f.item)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 技术参数 */}
                      {selectedProduct.attributes.techParams && selectedProduct.attributes.techParams.length > 0 && selectedProduct.attributes.techParams.some(tp => tp.value) && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                            {isZh ? '技术参数' : 'Tech Parameters'}
                          </h3>
                          <div className="space-y-2">
                            {selectedProduct.attributes.techParams.map((tp, i) => (
                              <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-500">{isZh ? tp.label : (tp.labelEn || tp.label)}</span>
                                <span className="font-medium text-gray-900">{isZh ? tp.value : (tp.valueEn || tp.value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 应用场景 */}
                      {selectedProduct.attributes.applications && selectedProduct.attributes.applications.length > 0 && selectedProduct.attributes.applications.some(a => a.item) && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                            {t('products.applications')}
                          </h3>
                          <div className="grid grid-cols-2 gap-2">
                            {selectedProduct.attributes.applications.map((app, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                {isZh ? app.item : (app.itemEn || app.item)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 富文本内容 */}
                  {(() => {
                    const descContent = isZh ? selectedProduct.content : (selectedProduct.contentEn || selectedProduct.content);
                    return descContent?.root?.children && descContent.root.children.length > 0 ? (
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                          {isZh ? '产品介绍' : 'Description'}
                        </h3>
                        <div className="prose prose-sm max-w-none text-gray-600">
                          {descContent.root.children.map((node: any, i: number) => {
                            if (node.type === 'paragraph') {
                              return <p key={i} className="mb-2 last:mb-0">{node.children?.map((c: any) => c.text).join('')}</p>;
                            }
                            if (node.type === 'heading') {
                              const Tag = node.tag || 'h3';
                              return <Tag key={i} className="font-bold mb-2">{node.children?.map((c: any) => c.text).join('')}</Tag>;
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Layout Blocks */}
                  {selectedProduct.layout && selectedProduct.layout.length > 0 && (
                    <div className="mb-6 space-y-4">
                      {selectedProduct.layout.map((block: any, i: number) => {
                        if (block.blockType === 'imageText') {
                          return (
                            <div key={i} className="grid grid-cols-2 gap-4 items-center">
                              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                {block.image?.url && <img src={block.image.url} alt={isZh ? (block.title || '') : (block.titleEn || block.title || '')} className="w-full h-full object-cover" />}
                              </div>
                              <div>
                                {(isZh ? block.title : (block.titleEn || block.title)) && <h4 className="font-semibold text-gray-900 mb-1">{isZh ? block.title : (block.titleEn || block.title)}</h4>}
                                {(isZh ? block.content : (block.contentEn || block.content)) && <p className="text-sm text-gray-600">{isZh ? block.content : (block.contentEn || block.content)}</p>}
                              </div>
                            </div>
                          );
                        }
                        if (block.blockType === 'specTable') {
                          return (
                            <div key={i}>
                              {(isZh ? block.title : (block.titleEn || block.title)) && <h4 className="font-semibold text-gray-900 mb-2">{isZh ? block.title : (block.titleEn || block.title)}</h4>}
                              {block.rows && block.rows.length > 0 && (
                                <table className="w-full text-sm">
                                  <tbody>
                                    {block.rows.map((row: any, ri: number) => (
                                      <tr key={ri} className={ri % 2 === 0 ? 'bg-gray-50' : ''}>
                                        <td className="px-3 py-2 font-medium text-gray-700">{isZh ? row.label : (row.labelEn || row.label)}</td>
                                        <td className="px-3 py-2 text-gray-600">{isZh ? row.value : (row.valueEn || row.value)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          );
                        }
                        if (block.blockType === 'richText') {
                          const rtContent = isZh ? block.content : (block.contentEn || block.content);
                          return (
                            <div key={i} className="prose prose-sm max-w-none text-gray-600">
                              {rtContent?.root?.children?.map((node: any, ni: number) => {
                                if (node.type === 'paragraph') {
                                  return <p key={ni} className="mb-2">{node.children?.map((c: any) => c.text).join('')}</p>;
                                }
                                return null;
                              })}
                            </div>
                          );
                        }
                        if (block.blockType === 'gallery') {
                          return (
                            <div key={i} className="grid grid-cols-3 gap-2">
                              {block.images?.map((img: any, gi: number) => (
                                <div key={gi} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                  {img.image?.url && <img src={img.image.url} alt={isZh ? (img.caption || '') : (img.captionEn || img.caption || '')} className="w-full h-full object-cover" />}
                                </div>
                              ))}
                            </div>
                          );
                        }
                        if (block.blockType === 'video') {
                          return (
                            <div key={i}>
                              {block.title && <h4 className="font-semibold text-gray-900 mb-2">{block.title}</h4>}
                              {block.videoUrl && (
                                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                                  <iframe src={block.videoUrl} className="w-full h-full" allowFullScreen title={block.title || 'Video'} />
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: '0 8px 25px -5px rgba(37, 99, 235, 0.4)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        closeModal();
                        navigate('/inquiry');
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {t('products.inquiryNow')}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
