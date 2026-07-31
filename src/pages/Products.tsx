import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { X, ChevronRight, Flame, Droplets, Shield, Zap, HeartPulse, Layers, Move, Sun, Palette, Leaf, CircleDot } from 'lucide-react';
import { fetchProducts } from '../services/api';

interface FabricMaterial {
  id: string;
  name: string;
  nameEn: string;
  icon: React.ReactNode;
  subMenu?: { name: string; nameEn: string }[];
  description: string;
  descriptionEn: string;
  features: string[];
  featuresEn: string[];
  specs: { label: string; labelEn: string; value: string }[];
  applications: string[];
  applicationsEn: string[];
  products: Product[];
  dbCategory?: string;
}

interface Product {
  id: string;
  name: string;
  nameEn: string;
  image: string;
  description: string;
  descriptionEn: string;
}

interface SubMenuItem {
  name: string;
  nameEn: string;
}

const fabricMaterials: FabricMaterial[] = [
  {
    id: 'flame-retardant',
    name: '阻燃面料',
    nameEn: 'Flame Retardant Fabric',
    icon: <Flame className="w-6 h-6" />,
    subMenu: [
      { name: '芳纶', nameEn: 'Aramid' },
      { name: '后整理阻燃', nameEn: 'Finished FR' }
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
    products: [], // 芳纶产品将从数据库动态获取
    dbCategory: '芳纶', // 标记需要从数据库获取产品的分类
  },
  {
    id: 'three-proof',
    name: '三防面料',
    nameEn: 'Three-Proof Fabric',
    icon: <Shield className="w-6 h-6" />,
    subMenu: [
      { name: '防水面料', nameEn: 'Waterproof' },
      { name: '防油面料', nameEn: 'Oil Resistant' },
      { name: '易去污面料', nameEn: 'Stain Resistant' }
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
    products: [
      { id: 'tp-1', name: '涤纶三防面料', nameEn: 'Polyester Three-Proof', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '高强度涤纶，耐磨防水', descriptionEn: 'High-strength polyester, wear-resistant' },
      { id: 'tp-2', name: '尼龙三防面料', nameEn: 'Nylon Three-Proof', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '轻盈柔软，强力防水', descriptionEn: 'Light and soft, strong waterproof' },
      { id: 'tp-3', name: '棉质三防面料', nameEn: 'Cotton Three-Proof', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '天然舒适，三防处理', descriptionEn: 'Natural comfort, three-proof treated' },
      { id: 'tp-4', name: '复合三防面料', nameEn: 'Composite Three-Proof', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '多层复合，功能全面', descriptionEn: 'Multi-layer composite, full function' },
    ],
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
    products: [
      { id: 'aa-1', name: '涤纶防酸碱面料', nameEn: 'Polyester Acid-Resistant', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '化学稳定性好', descriptionEn: 'Good chemical stability' },
      { id: 'aa-2', name: 'PVC涂层防酸碱', nameEn: 'PVC Coated Acid-Resistant', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '完全密封防护', descriptionEn: 'Complete sealed protection' },
      { id: 'aa-3', name: '橡胶防酸碱面料', nameEn: 'Rubber Acid-Resistant', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '弹性好耐腐蚀', descriptionEn: 'Elastic and corrosion-resistant' },
      { id: 'aa-4', name: '复合防酸碱面料', nameEn: 'Composite Acid-Resistant', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '多层复合结构', descriptionEn: 'Multi-layer composite' },
    ],
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
      { label: '表面电阻', labelEn: 'Surface Resistance', value: '10⁶-10⁹Ω' },
      { label: '电荷密度', labelEn: 'Charge Density', value: '<7μc/m²' },
      { label: '洗涤耐久', labelEn: 'Wash Durability', value: '≥50次' },
    ],
    applications: ['电子车间工装', '防爆环境', '无尘车间', '石油化工'],
    applicationsEn: ['Electronics Workshop', 'Explosion-proof', 'Cleanroom', 'Petrochemical'],
    products: [
      { id: 'as-1', name: '涤纶防静电面料', nameEn: 'Polyester Antistatic', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '导电丝编织', descriptionEn: 'Conductive yarn woven' },
      { id: 'as-2', name: '棉质防静电面料', nameEn: 'Cotton Antistatic', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '舒适抗静电', descriptionEn: 'Comfortable antistatic' },
      { id: 'as-3', name: '网格防静电面料', nameEn: 'Grid Antistatic', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '网格导电设计', descriptionEn: 'Grid conductive design' },
      { id: 'as-4', name: '条纹防静电面料', nameEn: 'Stripe Antistatic', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '条纹导电丝', descriptionEn: 'Stripe conductive yarn' },
    ],
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
    products: [
      { id: 'med-1', name: '涤棉医护面料', nameEn: 'Poly-cotton Medical', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '舒适耐用', descriptionEn: 'Comfortable and durable' },
      { id: 'med-2', name: '全棉医护面料', nameEn: 'Cotton Medical', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '天然亲肤', descriptionEn: 'Natural skin-friendly' },
      { id: 'med-3', name: '抗菌医护面料', nameEn: 'Antibacterial Medical', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '银离子抗菌', descriptionEn: 'Silver ion antibacterial' },
      { id: 'med-4', name: '手术服面料', nameEn: 'Surgical Fabric', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '高阻隔性', descriptionEn: 'High barrier property' },
    ],
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
    products: [
      { id: 'pc-1', name: 'T/C 65/35面料', nameEn: 'T/C 65/35 Fabric', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '标准工装面料', descriptionEn: 'Standard workwear fabric' },
      { id: 'pc-2', name: 'T/C 80/20面料', nameEn: 'T/C 80/20 Fabric', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '高涤含量', descriptionEn: 'High polyester content' },
      { id: 'pc-3', name: 'CVC 60/40面料', nameEn: 'CVC 60/40 Fabric', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '棉含量高', descriptionEn: 'High cotton content' },
      { id: 'pc-4', name: '涤棉斜纹面料', nameEn: 'Poly-cotton Twill', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '经典斜纹', descriptionEn: 'Classic twill' },
    ],
  },
  {
    id: 'elastic',
    name: '弹力面料',
    nameEn: 'Elastic Fabric',
    icon: <Move className="w-6 h-6" />,
    subMenu: [
      { name: 'T400面料', nameEn: 'T400 Fabric' },
      { name: '氨纶面料', nameEn: 'Spandex Fabric' }
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
    products: [
      { id: 'el-1', name: '涤纶弹力面料', nameEn: 'Polyester Elastic', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '四面弹力', descriptionEn: '4-way stretch' },
      { id: 'el-2', name: '尼龙弹力面料', nameEn: 'Nylon Elastic', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '高弹耐磨', descriptionEn: 'High elastic and durable' },
      { id: 'el-3', name: '棉质弹力面料', nameEn: 'Cotton Elastic', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '舒适弹力', descriptionEn: 'Comfortable elastic' },
      { id: 'el-4', name: '弹力斜纹面料', nameEn: 'Elastic Twill', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '工装弹力', descriptionEn: 'Workwear elastic' },
    ],
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
    products: [
      { id: 'fl-1', name: '荧光黄面料', nameEn: 'Fluorescent Yellow', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '高亮黄色', descriptionEn: 'Bright yellow' },
      { id: 'fl-2', name: '荧光橙面料', nameEn: 'Fluorescent Orange', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '警示橙色', descriptionEn: 'Warning orange' },
      { id: 'fl-3', name: '反光条面料', nameEn: 'Reflective Strip Fabric', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '带反光条', descriptionEn: 'With reflective strips' },
      { id: 'fl-4', name: '荧光涤棉面料', nameEn: 'Fluorescent Poly-cotton', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '舒适荧光', descriptionEn: 'Comfortable fluorescent' },
    ],
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
    products: [
      { id: 'pr-1', name: '迷彩印花面料', nameEn: 'Camouflage Print', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '军用迷彩', descriptionEn: 'Military camouflage' },
      { id: 'pr-2', name: '数码印花面料', nameEn: 'Digital Print', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '高清数码', descriptionEn: 'HD digital print' },
      { id: 'pr-3', name: '圆网印花面料', nameEn: 'Rotary Print', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '大批量印花', descriptionEn: 'Mass production print' },
      { id: 'pr-4', name: '转移印花面料', nameEn: 'Transfer Print', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '精细图案', descriptionEn: 'Fine patterns' },
    ],
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
    products: [
      { id: 'ln-1', name: '纯亚麻面料', nameEn: 'Pure Linen', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '100%天然亚麻', descriptionEn: '100% natural linen' },
      { id: 'ln-2', name: '亚麻棉混纺', nameEn: 'Linen Cotton Blend', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '柔软舒适', descriptionEn: 'Soft and comfortable' },
      { id: 'ln-3', name: '亚麻粘胶', nameEn: 'Linen Viscose', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '光泽度好', descriptionEn: 'Good luster' },
      { id: 'ln-4', name: '雨露麻面料', nameEn: 'Dew-retted Linen', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '高品质亚麻', descriptionEn: 'Premium linen' },
    ],
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
    products: [
      { id: 'wl-1', name: '精纺羊毛面料', nameEn: 'Worsted Wool', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '细腻光滑', descriptionEn: 'Fine and smooth' },
      { id: 'wl-2', name: '粗纺羊毛面料', nameEn: 'Woolen Fabric', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '厚实保暖', descriptionEn: 'Thick and warm' },
      { id: 'wl-3', name: '羊毛涤纶混纺', nameEn: 'Wool Polyester', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '易打理', descriptionEn: 'Easy care' },
      { id: 'wl-4', name: '羊绒面料', nameEn: 'Cashmere Fabric', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', description: '奢华柔软', descriptionEn: 'Luxuriously soft' },
    ],
  },
];

export default function Products() {
  const { language, t } = useLanguage();
  const isZh = language === 'zh';
  const location = useLocation();
  const [selectedMaterial, setSelectedMaterial] = useState<FabricMaterial | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [hoveredMaterial, setHoveredMaterial] = useState<string | null>(null);
  const [aramidProducts, setAramidProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoverTimeout, setHoverTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // 路由切换时重置所有状态
  useEffect(() => {
    // 清理定时器
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    // 重置悬停状态
    setHoveredMaterial(null);
    // 注意：保留 selectedMaterial 和 activeCategory，因为用户可能从首页直接跳转到特定分类
  }, [location.pathname]);

  // 从 Payload CMS 获取芳纶产品
  useEffect(() => {
    async function fetchAramidProducts() {
      try {
        const response = await fetchProducts({
          category: '芳纶',
          limit: 100,
        });

        if (response.data) {
          const formattedProducts: Product[] = response.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            nameEn: item.nameEn || item.name,
            image: item.images?.[0]?.image?.url || item.coverImage?.url || 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400',
            description: item.description || '',
            descriptionEn: item.descriptionEn || item.description || '',
          }));
          setAramidProducts(formattedProducts);
        }
      } catch (err) {
        console.error('获取芳纶产品失败:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAramidProducts();
  }, []);

  const handleMaterialClick = (material: FabricMaterial) => {
    setSelectedMaterial(material);
    setActiveCategory(material.id);
  };

  // 子菜单延迟消失处理
  const handleMouseEnter = (materialId: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setHoveredMaterial(materialId);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setHoveredMaterial(null);
    }, 450); // 450ms 延迟，给用户足够时间移动到子菜单并点击
    setHoverTimeout(timeout);
  };

  const handleSubMenuMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handleSubMenuMouseLeave = () => {
    setHoveredMaterial(null);
  };

  const handleProductClick = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedMaterial(null);
    setSelectedProduct(null);
    setActiveCategory(null);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {fabricMaterials.map((material, index) => {
            const hasSubMenu = material.subMenu && material.subMenu.length > 0;
            const isHovered = hoveredMaterial === material.id;
            return (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onMouseEnter={() => hasSubMenu && handleMouseEnter(material.id)}
                onMouseLeave={handleMouseLeave}
                className={`relative group cursor-pointer bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 ${
                  activeCategory === material.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent'
                } ${hasSubMenu ? '' : 'overflow-hidden'}`}
              >
                <div onClick={() => handleMaterialClick(material)} className="p-6">
                  <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white group-hover:scale-110 transition-transform duration-300">
                    {material.icon}
                  </div>
                  <h3 className="text-center font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {isZh ? material.name : material.nameEn}
                  </h3>
                  <p className="text-center text-xs text-gray-500">
                    {material.products.length} {t('products.productCount')}
                  </p>
                </div>
                <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

                {/* 子菜单 - 扩大触发区域，消除间隙 */}
                {hasSubMenu && isHovered && (
                  <div
                    className="absolute left-0 right-0 top-full z-50"
                    onMouseEnter={handleSubMenuMouseEnter}
                    onMouseLeave={handleSubMenuMouseLeave}
                  >
                    {/* 透明桥接区域，消除主菜单和子菜单之间的间隙 */}
                    <div className="h-4 w-full" />
                    <div className="bg-gradient-to-b from-blue-50 to-white rounded-xl shadow-2xl border-2 border-blue-300 py-3 -mt-2">
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-50 border-t-2 border-l-2 border-blue-300 rotate-45"></div>
                      {material.subMenu!.map((subItem, subIdx) => (
                        <div
                          key={subIdx}
                          onClick={() => handleMaterialClick(material)}
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

              {/* Dynamic Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* 如果该分类有dbCategory，使用从数据库获取的产品 */}
                {(selectedMaterial.dbCategory === '芳纶' && aramidProducts.length > 0
                  ? aramidProducts
                  : selectedMaterial.products
                ).map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={(e) => handleProductClick(product, e)}
                    className="group cursor-pointer bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-square overflow-hidden bg-gray-200">
                      <img
                        src={product.image}
                        alt={isZh ? product.name : product.nameEn}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {isZh ? product.name : product.nameEn}
                      </h4>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {isZh ? product.description : product.descriptionEn}
                      </p>
                      <div className="mt-3 flex items-center text-blue-600 text-sm font-medium">
                        {t('products.viewDetails')}
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Detail Modal with Material Animation */}
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
                {/* Left: Image with Material Animation */}
                <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 p-8 flex items-center justify-center overflow-hidden">
                  {/* Animated background particles */}
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
                  
                  {/* Main product image with material texture animation */}
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
                    {/* Material shine effect */}
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    />
                  </motion.div>

                  {/* Material category badge */}
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

                  {/* Features */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                      {t('products.features')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(isZh ? selectedMaterial.features : selectedMaterial.featuresEn).map((feature, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {feature}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                      {t('products.specifications')}
                    </h3>
                    <div className="space-y-2">
                      {selectedMaterial.specs.map((spec, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex justify-between py-2 border-b border-gray-100"
                        >
                          <span className="text-gray-500">{isZh ? spec.label : spec.labelEn}</span>
                          <span className="font-medium text-gray-900">{spec.value}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Applications */}
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                      {t('products.applications')}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {(isZh ? selectedMaterial.applications : selectedMaterial.applicationsEn).map((app, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {app}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      {t('products.inquiryNow')}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      {t('products.download')}
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
