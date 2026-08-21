import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Flame, Droplets, Shield, Zap, HeartPulse, Layers, Move, Sun, Palette, Leaf, CircleDot, ArrowRight, Factory, Newspaper, Users, Award, Globe } from 'lucide-react';
import DynamicBanner from '../components/DynamicBanner';
import FactoryShowcase from '../components/FactoryShowcase';

const advantages = [
  { icon: Shield, titleKey: 'home.advantage.iso', descKey: 'home.advantage.iso.desc' },
  { icon: Zap, titleKey: 'home.advantage.sampling', descKey: 'home.advantage.sampling.desc' },
  { icon: Award, titleKey: 'home.advantage.experience', descKey: 'home.advantage.experience.desc' },
  { icon: Globe, titleKey: 'home.advantage.global', descKey: 'home.advantage.global.desc' },
];

const fabricCategories = [
  { id: 'flame-retardant', nameKey: 'home.fabric.flameretardant', icon: Flame, descKey: 'home.fabric.flameretardant.desc', subMenuKeys: ['home.fabric.aramid', 'home.fabric.finishedFR'] },
  { id: 'three-proof', nameKey: 'home.fabric.threeproof', icon: Shield, descKey: 'home.fabric.threeproof.desc', subMenuKeys: ['home.fabric.waterproof', 'home.fabric.oilproof', 'home.fabric.stainresistant'] },
  { id: 'acid-alkali', nameKey: 'home.fabric.acidalkali', icon: Droplets, descKey: 'home.fabric.acidalkali.desc' },
  { id: 'antistatic', nameKey: 'home.fabric.antistatic', icon: Zap, descKey: 'home.fabric.antistatic.desc' },
  { id: 'medical', nameKey: 'home.fabric.medical', icon: HeartPulse, descKey: 'home.fabric.medical.desc' },
  { id: 'poly-cotton', nameKey: 'home.fabric.polycotton', icon: Layers, descKey: 'home.fabric.polycotton.desc' },
  { id: 'elastic', nameKey: 'home.fabric.elastic', icon: Move, descKey: 'home.fabric.elastic.desc', subMenuKeys: ['home.fabric.t400', 'home.fabric.spandex'] },
  { id: 'fluorescent', nameKey: 'home.fabric.fluorescent', icon: Sun, descKey: 'home.fabric.fluorescent.desc' },
  { id: 'printed', nameKey: 'home.fabric.printed', icon: Palette, descKey: 'home.fabric.printed.desc' },
  { id: 'linen', nameKey: 'home.fabric.linen', icon: Leaf, descKey: 'home.fabric.linen.desc' },
  { id: 'wool', nameKey: 'home.fabric.wool', icon: CircleDot, descKey: 'home.fabric.wool.desc' },
];

const news = [
  { id: 1, titleKey: 'home.news.1.title', date: '2024-03-15', summaryKey: 'home.news.1.summary' },
  { id: 2, titleKey: 'home.news.2.title', date: '2024-02-28', summaryKey: 'home.news.2.summary' },
  { id: 3, titleKey: 'home.news.3.title', date: '2024-02-10', summaryKey: 'home.news.3.summary' },
];

const partners = ['Brand A', 'Brand B', 'Brand C', 'Brand D', 'Brand E', 'Brand F'];

export default function Home() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const shipImage = new URL('../../assets/船11.jpg', import.meta.url).href;
  const factoryImage = new URL('../../assets/工厂全景科技图_-_副本.webp', import.meta.url).href;
  const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = React.useState<ReturnType<typeof setTimeout> | null>(null);

  // 子菜单延迟消失处理
  const handleMouseEnter = (categoryId: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setHoveredCategory(categoryId);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setHoveredCategory(null);
    }, 800); // 增加到800ms延迟，给用户更多时间移动鼠标
    setHoverTimeout(timeout);
  };

  const handleSubMenuMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handleSubMenuMouseLeave = () => {
    setHoveredCategory(null);
  };

  return (
    <div className="w-full">
      {/* Dynamic Banner */}
      <DynamicBanner />

      {/* Hero Section - 视差滚动效果 */}
      <section className="relative h-[120vh] w-full overflow-hidden -mt-20" data-section-theme="dark">
        <div
          className="absolute inset-0 bg-fixed bg-cover bg-center rounded-t-[80px]"
          style={{
            backgroundImage: `url(${shipImage})`
          }}
        />
        {/* Deep Blue Gradient Overlay - 深蓝色渐变遮罩层，参考 DynamicBanner */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 via-blue-900/15 to-blue-950/25 rounded-t-[80px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-slate-900/20 rounded-t-[80px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-slate-900/10 rounded-t-[80px]" />
        <div className="relative z-10 flex items-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-80">
          <div className="w-full lg:w-2/3">
            {/* Brand Tag */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-6"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm border-2"
                style={{ backgroundColor: 'rgba(97, 206, 112, 0.2)', borderColor: 'rgba(97, 206, 112, 0.4)' }}
              >
                <span className="text-lg font-bold" style={{ color: 'rgb(97, 206, 112)' }}>TR</span>
              </div>
              <span
                className="font-semibold tracking-wider uppercase text-sm drop-shadow-lg"
                style={{ color: 'rgb(97, 206, 112)' }}
              >
                {t('hero.brandTag')}
              </span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl lg:text-7xl text-white mb-4 leading-tight"
              style={{ textShadow: '2px 2px 20px rgba(0,0,0,0.5)', fontSize: '58px', fontWeight: 600 }}
            >
              <span className="text-white">{t('hero.title')}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl md:text-2xl text-white/90 mb-4 font-medium"
              style={{ textShadow: '1px 1px 10px rgba(0,0,0,0.4)' }}
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <button
                onClick={() => navigate('/contact')}
                className="group relative px-10 py-4 rounded-xl font-bold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 text-white"
                style={{
                  backgroundColor: 'rgb(97, 206, 112)',
                  boxShadow: '0 4px 20px rgba(97, 206, 112, 0.3)'
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {t('hero.cta.contact')}
                  <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                </span>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ backgroundColor: 'rgb(79, 184, 94)' }}
                />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Parallax Factory Section - DynamicBanner Style */}
      <section className="relative h-screen w-full overflow-hidden -mt-20" data-section-theme="dark">
        <div
          className="absolute inset-0 bg-fixed bg-cover bg-center rounded-t-[80px]"
          style={{
            backgroundImage: `url(${new URL('../../assets/厂房大图留白多_拷贝.webp', import.meta.url).href})`
          }}
        />
        {/* Deep Blue Gradient Overlay - 深蓝色渐变遮罩层，参考 DynamicBanner */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 via-blue-900/15 to-blue-950/25 rounded-t-[80px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-slate-900/20 rounded-t-[80px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-slate-900/10 rounded-t-[80px]" />
        <div className="relative z-10 flex items-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-80">
          <div className="w-full lg:w-2/3">
            {/* Brand Tag */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-6"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm border-2"
                style={{ backgroundColor: 'rgba(97, 206, 112, 0.2)', borderColor: 'rgba(97, 206, 112, 0.4)' }}
              >
                <span className="text-lg font-bold" style={{ color: 'rgb(97, 206, 112)' }}>TR</span>
              </div>
              <span
                className="font-semibold tracking-wider uppercase text-sm drop-shadow-lg"
                style={{ color: 'rgb(97, 206, 112)' }}
              >
                {t('hero.brandTag')}
              </span>
            </motion.div>

            {/* Main Title */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl lg:text-7xl text-white mb-4 leading-tight"
              style={{ textShadow: '2px 2px 20px rgba(0,0,0,0.5)', fontSize: '58px', fontWeight: 600 }}
            >
              <span className="text-white">{t('hero.companyName')}</span>
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl md:text-2xl text-white/90 mb-4 font-medium"
              style={{ textShadow: '1px 1px 10px rgba(0,0,0,0.4)' }}
            >
              {t('hero.companyDesc')}
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <button
                onClick={() => {
                  navigate('/about');
                  // 确保跳转后滚动到页面顶部
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 100);
                }}
                className="group relative px-10 py-4 rounded-xl font-bold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 text-white"
                style={{
                  backgroundColor: 'rgb(97, 206, 112)',
                  boxShadow: '0 4px 20px rgba(97, 206, 112, 0.3)'
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {t('hero.cta.learnMore')}
                  <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                </span>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ backgroundColor: 'rgb(79, 184, 94)' }}
                />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section id="advantages-section" className="py-24 bg-white" data-section-theme="light">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4 tracking-wide">
              {t('home.advantages.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('home.advantages.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -8 }}
              className="group relative py-14 px-10 rounded-2xl border border-blue-600 shadow-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://conversation.cdn.meoo.host/conversations/314004577148157952/image/2026-06-13/1781361215730-厂房大图留白多.webp?auth_key=2021c39804802851767996a7542d8a719aa9355698a980ad94a19ce38a8c06cc')` }} />
              <div className="absolute inset-0 bg-blue-900/70" />
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 to-emerald-500/0 group-hover:from-emerald-400/10 group-hover:to-emerald-500/5 transition-all duration-500" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-500" />
              <div className="relative text-center">
                <div className="flex flex-col items-center gap-5 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                    <Factory className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{t('home.advantages.strength.title')}</h3>
                </div>
                <p className="text-blue-100 leading-relaxed text-base max-w-md mx-auto">
                  {t('home.advantages.strength.desc')}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -8 }}
              className="group relative py-14 px-10 rounded-2xl border border-blue-600 shadow-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://conversation.cdn.meoo.host/conversations/314004577148157952/image/2026-06-13/1781361215730-厂房大图留白多.webp?auth_key=2021c39804802851767996a7542d8a719aa9355698a980ad94a19ce38a8c06cc')` }} />
              <div className="absolute inset-0 bg-blue-900/70" />
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 to-cyan-500/0 group-hover:from-cyan-400/10 group-hover:to-cyan-500/5 transition-all duration-500" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-cyan-500" />
              <div className="relative text-center">
                <div className="flex flex-col items-center gap-5 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{t('home.advantages.technology.title')}</h3>
                </div>
                <p className="text-blue-100 leading-relaxed text-base max-w-md mx-auto">
                  {t('home.advantages.technology.desc')}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-gray-50" data-section-theme="light">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-blue-900 mb-4">{t('products.title')}</h2>
          <p className="text-center text-gray-600 text-lg mb-12 max-w-2xl mx-auto">
            {t('home.products.subtitle')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {fabricCategories.map((category, idx) => {
              const IconComponent = category.icon;
              const hasSubMenu = category.subMenuKeys && category.subMenuKeys.length > 0;
              const isHovered = hoveredCategory === category.id;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  onMouseEnter={() => hasSubMenu && handleMouseEnter(category.id)}
                  onMouseLeave={handleMouseLeave}
                  className={`relative bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer group border border-gray-100 ${hasSubMenu ? '' : 'overflow-hidden'}`}
                >
                  <div onClick={() => navigate('/products')} className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <h3 className="font-semibold text-blue-900 mb-2">{t(category.nameKey)}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{t(category.descKey)}</p>
                  </div>
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

                  {/* 子菜单 - 扩大触发区域，消除间隙 */}
                  {hasSubMenu && isHovered && (
                    <div
                      className="absolute left-0 right-0 top-full z-50"
                      onMouseEnter={handleSubMenuMouseEnter}
                      onMouseLeave={handleSubMenuMouseLeave}
                    >
                      {/* 透明桥接区域 - 增加到48px确保鼠标平滑过渡 */}
                      <div className="h-12 w-full" />
                      <div className="bg-gradient-to-b from-blue-50 to-white rounded-xl shadow-2xl border-2 border-blue-300 py-3 -mt-2 animate-fadeIn">
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-50 border-t-2 border-l-2 border-blue-300 rotate-45"></div>
                        {category.subMenuKeys!.map((subItemKey, subIdx) => {
                          // 根据翻译键映射到对应的 dbCategory
                          const categoryToDbMap: Record<string, string> = {
                            'home.fabric.aramid': '芳纶',
                            'home.fabric.finishedFR': '后整理阻燃',
                            'home.fabric.waterproof': '防水面料',
                            'home.fabric.oilproof': '防油面料',
                            'home.fabric.stainresistant': '易去污面料',
                            'home.fabric.t400': 'T400面料',
                            'home.fabric.spandex': '氨纶面料',
                          };
                          const dbCategory = categoryToDbMap[subItemKey] || '';
                          return (
                            <div
                              key={subIdx}
                              onClick={() => navigate(`/products?category=${encodeURIComponent(dbCategory)}`)}
                              className="relative px-4 py-2.5 text-sm font-medium text-blue-800 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 cursor-pointer border-b border-blue-100 last:border-b-0"
                            >
                              <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                {t(subItemKey)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
            {/* 查看全部产品按钮 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: fabricCategories.length * 0.05 }}
              onClick={() => navigate('/products')}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer group border border-gray-100"
            >
              <div className="p-6 text-center h-full flex flex-col items-center justify-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                  <ArrowRight className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">{t('home.products.viewAll')}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{t('home.products.viewAllDesc')}</p>
              </div>
              <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Factory Showcase Section */}
      <FactoryShowcase />

      {/* News Section */}
      <section className="py-20 bg-gray-50" data-section-theme="light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-12">
            <Newspaper className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-blue-900">{t('news.title')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {news.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => navigate('/news')}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
              >
                <div className="text-sm text-blue-600 mb-2">{item.date}</div>
                <h3 className="font-semibold text-blue-900 mb-2 line-clamp-2">{t(item.titleKey)}</h3>
                <p className="text-gray-600 text-sm">{t(item.summaryKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
