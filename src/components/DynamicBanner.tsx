import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Flame, Droplets, Shield, HeartPulse, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const BRAND_GREEN = 'rgb(97, 206, 112)';
const BRAND_GREEN_DARK = 'rgb(79, 184, 94)';

// Scene keys for translation
const sceneKeys = [
  { id: 1, titleKey: 'dynamicBanner.scene.firefighter.title', subtitleKey: 'dynamicBanner.scene.firefighter.subtitle', descKey: 'dynamicBanner.scene.firefighter.desc' },
  { id: 2, titleKey: 'dynamicBanner.scene.oil.title', subtitleKey: 'dynamicBanner.scene.oil.subtitle', descKey: 'dynamicBanner.scene.oil.desc' },
  { id: 3, titleKey: 'dynamicBanner.scene.chemical.title', subtitleKey: 'dynamicBanner.scene.chemical.subtitle', descKey: 'dynamicBanner.scene.chemical.desc' },
  { id: 4, titleKey: 'dynamicBanner.scene.medical.title', subtitleKey: 'dynamicBanner.scene.medical.subtitle', descKey: 'dynamicBanner.scene.medical.desc' },
];

const fabricScenes = [
  {
    id: 1,
    image: 'https://g.cdn.meoo.host/agent-generated-images/hw7y2e86g4p3/6d36.png?auth_key=2bff8d71c7b31d4d2c2c90a21c6aa29fc629b3975e3d3a0f8e17ddffb9d5027d',
    params: { flame: 'EN 11612', heat: '1000°C+', time: '≥15s' },
    icon: Flame,
    color: '#EF4444',
  },
  {
    id: 2,
    image: 'https://g.cdn.meoo.host/agent-generated-images/hw7y2e86g4p3/1b70.png?auth_key=31fcfa7e37788f5e7744d5a631f0f44f4fe7132f55f2158f8ede20eb04955ac2',
    params: { static: 'EN 1149', flame: 'EN 11612', oil: '防油渗透' },
    icon: Droplets,
    color: '#F59E0B',
  },
  {
    id: 3,
    image: 'https://g.cdn.meoo.host/agent-generated-images/hw7y2e86g4p3/65a9.png?auth_key=1e592b66d4ddb0c1a45615d276bf8dab3393fa4fc986ce0e46d81325d03a1d7f',
    params: { acid: '耐强酸碱', chem: '防化渗透', tear: '≥30N' },
    icon: Shield,
    color: '#87CEEB',
  },
  {
    id: 4,
    image: 'https://g.cdn.meoo.host/agent-generated-images/hw7y2e86g4p3/4742.png?auth_key=de7f657133f7cf4f5ded38cf275f45014be4dbcac0e810aab6a68abce3c9a547',
    params: { anti: '抗菌率99%', fluid: '防液体渗透', breath: '透气舒适' },
    icon: HeartPulse,
    color: '#10B981',
  }
];

export default function DynamicBanner() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % fabricScenes.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const currentScene = fabricScenes[currentIndex];
  const currentSceneKeys = sceneKeys[currentIndex];
  const IconComponent = currentScene.icon;

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % fabricScenes.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + fabricScenes.length) % fabricScenes.length);

  return (
    <section 
      className="relative h-[120vh] w-full overflow-hidden bg-slate-900"
      data-section-theme="dark"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image Carousel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          <img 
            src={currentScene.image} 
            alt={t(currentSceneKeys.titleKey)}
            className="w-full h-full object-cover"
          />
          {/* Deep Blue Gradient Overlay - 深蓝色渐变遮罩层，中心透明度降低突出图片 */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/75 via-blue-900/25 to-blue-950/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-900/35" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/35 via-transparent to-slate-900/20" />
        </motion.div>
      </AnimatePresence>

      {/* Animated Fabric Texture Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear'
          }}
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              rgba(97, 206, 112, 0.03) 2px,
              rgba(97, 206, 112, 0.03) 4px
            )`
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" style={{ marginTop: '-50px' }}>
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
              <IconComponent className="w-6 h-6" style={{ color: BRAND_GREEN }} />
            </div>
            <span 
              className="font-semibold tracking-wider uppercase text-sm drop-shadow-lg"
              style={{ color: BRAND_GREEN }}
            >
              {t('dynamicBanner.brandTag')}
            </span>
          </motion.div>

          {/* Main Title */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight"
                style={{ textShadow: '2px 2px 20px rgba(0,0,0,0.5)' }}
              >
                <span style={{ color: BRAND_GREEN }}>[天睿]</span>
                <span className="text-white"> {t(currentSceneKeys.titleKey)}</span>
              </h1>
              <p 
                className="text-xl md:text-2xl text-white/90 mb-4 font-medium"
                style={{ textShadow: '1px 1px 10px rgba(0,0,0,0.4)' }}
              >
                {t(currentSceneKeys.subtitleKey)}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Scene Info with Description and Params */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative mt-6 mb-10"
            >
              {/* Description */}
              <p 
                className="text-white/85 text-base md:text-lg mb-6 max-w-xl leading-relaxed"
                style={{ textShadow: '1px 1px 8px rgba(0,0,0,0.4)' }}
              >
                {t(currentSceneKeys.descKey)}
              </p>

              {/* Params Panel */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="bg-slate-900/60 backdrop-blur-md rounded-xl p-4 border"
                style={{ borderColor: 'rgba(97, 206, 112, 0.3)' }}
              >
                <p 
                  className="text-xs mb-2 uppercase tracking-wider"
                  style={{ color: 'rgba(97, 206, 112, 0.8)' }}
                >
                  {t('dynamicBanner.paramsLabel')}
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(currentScene.params).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div 
                        className="font-bold text-lg drop-shadow-md"
                        style={{ color: BRAND_GREEN }}
                      >
                        {value}
                      </div>
                      <div className="text-white/50 text-xs capitalize">{key}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* CTA Button - 品牌绿色 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <button
              onClick={() => {
                navigate('/products');
                // 确保跳转后滚动到页面顶部
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
              }}
              className="group relative px-10 py-4 rounded-xl font-bold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 text-white"
              style={{
                backgroundColor: BRAND_GREEN,
                boxShadow: '0 4px 20px rgba(97, 206, 112, 0.3)'
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                {t('dynamicBanner.cta.learnMore')}
                <ArrowRight
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  style={{ color: 'white' }}
                />
              </span>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: BRAND_GREEN_DARK }}
              />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute bottom-1/2 translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none z-20">
        <button
          onClick={prevSlide}
          className="pointer-events-auto w-12 h-12 rounded-full bg-slate-800/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-slate-700/60 transition-all duration-300 hover:border-[rgb(97,206,112)]/50"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="pointer-events-auto w-12 h-12 rounded-full bg-slate-800/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-slate-700/60 transition-all duration-300 hover:border-[rgb(97,206,112)]/50"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Slide Indicators - 品牌绿色 */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {fabricScenes.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'w-8' 
                : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
            style={index === currentIndex ? { backgroundColor: BRAND_GREEN } : {}}
          />
        ))}
      </div>

      {/* Category Labels - 品牌绿色选中状态 */}
      <div className="absolute bottom-28 right-8 flex flex-col gap-2 z-20">
        {sceneKeys.map((sceneKey, index) => (
          <motion.button
            key={sceneKey.id}
            onClick={() => setCurrentIndex(index)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 text-left ${
              index === currentIndex 
                ? 'text-slate-900' 
                : 'bg-slate-800/50 text-white/70 hover:bg-slate-700/60 hover:text-white'
            }`}
            style={index === currentIndex ? { backgroundColor: BRAND_GREEN } : {}}
            whileHover={{ x: 4 }}
          >
            <span className="flex items-center gap-2">
              {React.createElement(fabricScenes[index].icon, { className: "w-4 h-4" })}
              {t(sceneKey.titleKey)}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Progress Bar - 品牌绿色 */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <motion.div
          className="h-full"
          style={{ backgroundColor: BRAND_GREEN }}
          initial={{ width: '0%' }}
          animate={{ width: isHovered ? '0%' : '100%' }}
          transition={{ duration: 5, ease: 'linear' }}
          key={currentIndex}
        />
      </div>
    </section>
  );
}
