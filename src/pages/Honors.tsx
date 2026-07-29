import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Award, FileCheck, Medal, Trophy } from 'lucide-react';

const honors = [
  { id: 1, title: 'honors.iso9001', year: '2023', icon: FileCheck },
  { id: 2, title: 'honors.iso14001', year: '2023', icon: FileCheck },
  { id: 3, title: 'honors.oekotex', year: '2022', icon: Award },
  { id: 4, title: 'honors.hightech', year: '2022', icon: Trophy },
  { id: 5, title: 'honors.ce', year: '2021', icon: Medal },
  { id: 6, title: 'honors.ul', year: '2021', icon: Award },
  { id: 7, title: 'honors.textileaward', year: '2020', icon: Trophy },
  { id: 8, title: 'honors.famoustrademark', year: '2019', icon: Medal },
];

export default function Honors() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-32 -mt-20 pt-[240px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white text-center"
          >
            {t('nav.honors')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-blue-100 text-center max-w-2xl mx-auto mt-4"
          >
            {t('honors.subtitle')}
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {honors.map((honor, index) => {
            const IconComponent = honor.icon;
            return (
              <motion.div
                key={honor.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white rounded-xl shadow-lg p-8 text-center border border-slate-100 hover:shadow-2xl transition-all duration-300"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{t(honor.title)}</h3>
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                  {honor.year}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
