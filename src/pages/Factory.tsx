import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const equipment = [
  { name: '智能织机', nameEn: 'Smart Loom', desc: '高速自动化生产', descEn: 'High-speed automated production' },
  { name: '数码印花机', nameEn: 'Digital Printer', desc: '精准色彩控制', descEn: 'Precise color control' },
  { name: '涂层设备', nameEn: 'Coating Machine', desc: '功能性处理', descEn: 'Functional treatment' },
];

const gallery = [
  { title: '纺纱车间', titleEn: 'Spinning Workshop', image: 'https://conversation.cdn.meoo.host/conversations/314004577148157952/image/2026-06-13/1781357288647-纺纱车间.webp?auth_key=b6caaf9a539e8669c072d05e05ce0749486125446251c394448a9328c2472508' },
  { title: '印染车间', titleEn: 'Dyeing Workshop', image: 'https://conversation.cdn.meoo.host/conversations/314004577148157952/image/2026-06-13/1781357288655-印染车间.webp?auth_key=19ac6669f3a571b321f4248106069b8df4569883ddb6867a2f9605db7ec351cb' },
  { title: '织布车间', titleEn: 'Weaving Workshop', image: 'https://conversation.cdn.meoo.host/conversations/314004577148157952/image/2026-06-13/1781357288658-织布车间.webp?auth_key=e1834cebec94d3146e8fe8120220671699c3e51c31484989da44d91ad7618da4' },
  { title: '质检中心', titleEn: 'QC Center', image: 'https://conversation.cdn.meoo.host/conversations/314004577148157952/image/2026-06-13/1781358081559-质检中心.webp?auth_key=e6479de8279dc89cb78a93807a9fffe331dda6d0b809edf7147a5da76cc2fd17' },
];

export default function Factory() {
  const { language, t } = useLanguage();
  const isZh = language === 'zh';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-[600px] overflow-hidden">
        <img
          src="https://conversation.cdn.meoo.host/conversations/314004577148157952/image/2026-06-13/1781345791110-厂房大图留白多_拷贝.webp?auth_key=7f28232c72c098ad50acd72b76b382edaca8b603fe8f22dd73fec17fb308bd89"
          alt="Factory"
          className="w-full h-full object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">{t('factory.title')}</h1>
          <p className="text-lg opacity-90">{t('factory.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-blue-900 mb-8 text-center">
            {t('factory.equipment')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {equipment.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-cog text-2xl text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">{isZh ? item.name : item.nameEn}</h3>
                <p className="text-gray-600">{isZh ? item.desc : item.descEn}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-blue-900 mb-8 text-center">
            {t('factory.productionLines')}
          </h2>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl font-bold mb-4 text-blue-800">
                  {t('factory.intelligentLine')}
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-2">
                    <i className="fas fa-check text-green-500" />
                    {t('factory.capacity')}
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fas fa-check text-green-500" />
                    {t('factory.automation')}
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fas fa-check text-green-500" />
                    {t('factory.passRate')}
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg h-64 flex items-center justify-center">
                <i className="fas fa-industry text-6xl text-blue-400" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-blue-900 mb-8 text-center">
            {t('factory.environment')}
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {gallery.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden group cursor-pointer"
              >
                <div className="h-40 overflow-hidden group-hover:scale-105 transition-transform">
                  <img
                    src={item.image}
                    alt={isZh ? item.title : item.titleEn}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-center">{isZh ? item.title : item.titleEn}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
