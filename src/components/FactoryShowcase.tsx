import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, MapPin, Factory, Cog, Droplets, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FactoryScene {
  id: string;
  titleKey: string;
  titleEnKey: string;
  image: string;
  icon: React.ElementType;
  stats: { labelKey: string; value: string; unit?: string }[];
  descriptionKey: string;
}

const factoryScenes: FactoryScene[] = [
  {
    id: 'panorama',
    titleKey: 'factoryShowcase.scene.panorama.title',
    titleEnKey: 'factoryShowcase.scene.panorama.titleEn',
    image: 'https://conversation.cdn.meoo.host/conversations/314004577148157952/image/2026-08-20/1787191557711-工厂全景科技图_拷贝2.webp?auth_key=d2052e9342418e889bf5cb4e7d4c76392faf48deb5a31167e6c66d9e71d35be6',
    icon: MapPin,
    stats: [
      { labelKey: 'factoryShowcase.stat.area', value: '120', unit: '亩' },
      { labelKey: 'factoryShowcase.stat.buildingArea', value: '8.5', unit: '万㎡' },
      { labelKey: 'factoryShowcase.stat.greenRate', value: '35', unit: '%' },
    ],
    descriptionKey: 'factoryShowcase.scene.panorama.desc',
  },
  {
    id: 'weaving',
    titleKey: 'factoryShowcase.scene.weaving.title',
    titleEnKey: 'factoryShowcase.scene.weaving.titleEn',
    image: 'https://conversation.cdn.meoo.host/conversations/314004577148157952/image/2026-06-13/1781357288658-织布车间.webp?auth_key=e1834cebec94d3146e8fe8120220671699c3e51c31484989da44d91ad7618da4',
    icon: Factory,
    stats: [
      { labelKey: 'factoryShowcase.stat.looms', value: '416', unit: '台' },
      { labelKey: 'factoryShowcase.stat.capacity', value: '5000', unit: '万米' },
      { labelKey: 'factoryShowcase.stat.automation', value: '95', unit: '%' },
    ],
    descriptionKey: 'factoryShowcase.scene.weaving.desc',
  },
  {
    id: 'spinning',
    titleKey: 'factoryShowcase.scene.spinning.title',
    titleEnKey: 'factoryShowcase.scene.spinning.titleEn',
    image: 'https://conversation.cdn.meoo.host/conversations/314004577148157952/image/2026-06-13/1781357288647-纺纱车间.webp?auth_key=b6caaf9a539e8669c072d05e05ce0749486125446251c394448a9328c2472508',
    icon: Cog,
    stats: [
      { labelKey: 'factoryShowcase.stat.spindles', value: '30000', unit: '锭' },
      { labelKey: 'factoryShowcase.stat.dailyOutput', value: '25', unit: '吨' },
      { labelKey: 'factoryShowcase.stat.varieties', value: '200', unit: '+' },
    ],
    descriptionKey: 'factoryShowcase.scene.spinning.desc',
  },
  {
    id: 'dyeing',
    titleKey: 'factoryShowcase.scene.dyeing.title',
    titleEnKey: 'factoryShowcase.scene.dyeing.titleEn',
    image: 'https://conversation.cdn.meoo.host/conversations/314004577148157952/image/2026-06-13/1781357288655-印染车间.webp?auth_key=19ac6669f3a571b321f4248106069b8df4569883ddb6867a2f9605db7ec351cb',
    icon: Droplets,
    stats: [
      { labelKey: 'factoryShowcase.stat.dyeingLines', value: '4', unit: '条' },
      { labelKey: 'factoryShowcase.stat.printingLines', value: '1', unit: '条' },
      { labelKey: 'factoryShowcase.stat.processingCapacity', value: '80', unit: '吨' },
    ],
    descriptionKey: 'factoryShowcase.scene.dyeing.desc',
  },
];

export default function FactoryShowcase() {
  const { t } = useLanguage();
  const [selectedScene, setSelectedScene] = useState<FactoryScene | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.8]);

  const openLightbox = (scene: FactoryScene, index: number) => {
    setSelectedScene(scene);
    setCurrentImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedScene(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev'
      ? (currentImageIndex - 1 + factoryScenes.length) % factoryScenes.length
      : (currentImageIndex + 1) % factoryScenes.length;
    setCurrentImageIndex(newIndex);
    setSelectedScene(factoryScenes[newIndex]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedScene) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateImage('prev');
      if (e.key === 'ArrowRight') navigateImage('next');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedScene, currentImageIndex]);

  // Bottom stats data with translation keys
  const bottomStats = [
    { value: '20+', labelKey: 'about.yearsExp', icon: '年' },
    { value: '110000', labelKey: 'factoryShowcase.stat.spindles', icon: '锭' },
    { value: '500+', labelKey: 'about.globalClients', icon: '人' },
    { value: '50+', labelKey: 'about.exportCountries', icon: '国' },
  ];

  return (
    <>
      <section
        ref={containerRef}
        className="relative py-32 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50"
      >
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            style={{ y: backgroundY }}
            className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-blue-100/40 to-transparent blur-3xl"
          />
          <motion.div
            style={{ y: backgroundY }}
            className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-emerald-50/50 to-transparent blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            style={{ y: textY, opacity }}
            className="text-center mb-20"
          >
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-blue-900 mb-6 tracking-tight"
            >
              {t('factoryShowcase.sectionTitle')}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
            >
              {t('factoryShowcase.sectionSubtitle')}
            </motion.p>
          </motion.div>

          {/* Main Featured Scene - Panorama */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div
              onClick={() => openLightbox(factoryScenes[0], 0)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-200/50"
            >
              <div className="aspect-[21/9] relative">
                <img
                  src={factoryScenes[0].image}
                  alt={t(factoryScenes[0].titleKey)}
                  className="w-full h-full object-cover object-[center_85%] transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                
                {/* Content Overlay */}
                <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl md:text-3xl font-bold text-white">{t(factoryScenes[0].titleKey)}</h3>
                          <p className="text-sm text-white/70">{t(factoryScenes[0].titleEnKey)}</p>
                        </div>
                      </div>
                      <p className="text-white/80 text-sm md:text-base max-w-xl">{t(factoryScenes[0].descriptionKey)}</p>
                    </div>
                    
                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-8">
                      {factoryScenes[0].stats.map((stat, idx) => (
                        <div key={idx} className="text-center">
                          <div className="text-3xl font-bold text-white">
                            {stat.value}<span className="text-lg text-white/70">{stat.unit}</span>
                          </div>
                          <div className="text-xs text-white/60 uppercase tracking-wider">{t(stat.labelKey)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Zoom Icon */}
                <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ZoomIn className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Grid of Other Scenes */}
          <div className="grid md:grid-cols-3 gap-6">
            {factoryScenes.slice(1).map((scene, index) => {
              const IconComponent = scene.icon;
              return (
                <motion.div
                  key={scene.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  onClick={() => openLightbox(scene, index + 1)}
                  className="group cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500">
                    <div className="aspect-[4/3] relative">
                      <img
                        src={scene.image}
                        alt={t(scene.titleKey)}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                      
                      {/* Content */}
                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{t(scene.titleKey)}</h3>
                            <p className="text-xs text-white/60">{t(scene.titleEnKey)}</p>
                          </div>
                        </div>
                        
                        {/* Stats Row */}
                        <div className="flex items-center gap-4 mb-3">
                          {scene.stats.slice(0, 2).map((stat, idx) => (
                            <div key={idx} className="flex items-baseline gap-1">
                              <span className="text-lg font-bold text-white">{stat.value}</span>
                              <span className="text-xs text-white/70">{stat.unit}</span>
                            </div>
                          ))}
                        </div>
                        
                        <p className="text-sm text-white/70 line-clamp-2">{t(scene.descriptionKey)}</p>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors duration-300" />
                      
                      {/* Corner Accent */}
                      <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent transform rotate-45 translate-x-16 -translate-y-16 group-hover:translate-x-12 group-hover:-translate-y-12 transition-transform duration-500" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {bottomStats.map((item, idx) => (
              <div
                key={idx}
                className="text-center p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{item.value}</div>
                <div className="text-sm text-slate-500">{t(item.labelKey)}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedScene && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation */}
            <button
              onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Image Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute inset-0 flex items-center justify-center p-8 md:p-16"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative max-w-6xl w-full">
                <img
                  src={selectedScene.image}
                  alt={t(selectedScene.titleKey)}
                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg shadow-2xl"
                />
                
                {/* Image Info */}
                <div className="mt-6 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">{t(selectedScene.titleKey)}</h3>
                  <p className="text-white/60 mb-4">{t(selectedScene.descriptionKey)}</p>
                  <div className="flex items-center justify-center gap-8">
                    {selectedScene.stats.map((stat, idx) => (
                      <div key={idx} className="text-center">
                        <div className="text-xl font-bold text-white">
                          {stat.value}<span className="text-sm text-white/60">{stat.unit}</span>
                        </div>
                        <div className="text-xs text-white/40 uppercase tracking-wider">{t(stat.labelKey)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Thumbnail Navigation */}
                <div className="mt-8 flex items-center justify-center gap-3">
                  {factoryScenes.map((scene, idx) => (
                    <button
                      key={scene.id}
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); setSelectedScene(scene); }}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        idx === currentImageIndex ? 'border-blue-500 scale-110' : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      <img
                        src={scene.image}
                        alt={t(scene.titleKey)}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Image Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-sm">
              {currentImageIndex + 1} / {factoryScenes.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
