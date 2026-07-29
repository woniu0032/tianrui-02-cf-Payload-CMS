import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const milestones = [
  { year: '2013', title: 'about.milestone.2013' },
  { year: '2014', title: 'about.milestone.2014' },
  { year: '2018', title: 'about.milestone.2018' },
  { year: '2020', title: 'about.milestone.2020' },
  { year: '2026', title: 'about.milestone.2026' },
];

const values = [
  { icon: 'fa-lightbulb', title: 'about.value.innovation', desc: 'about.value.innovation.desc' },
  { icon: 'fa-medal', title: 'about.value.quality', desc: 'about.value.quality.desc' },
  { icon: 'fa-handshake', title: 'about.value.integrity', desc: 'about.value.integrity.desc' },
  { icon: 'fa-globe', title: 'about.value.winwin', desc: 'about.value.winwin.desc' },
];

const team = [
  { name: '张明', nameEn: 'Zhang Ming', role: 'about.team.founder', roleEn: 'about.team.founder.en' },
  { name: '李华', nameEn: 'Li Hua', role: 'about.team.cto', roleEn: 'about.team.cto.en' },
  { name: '王芳', nameEn: 'Wang Fang', role: 'about.team.sales', roleEn: 'about.team.sales.en' },
  { name: '陈强', nameEn: 'Chen Qiang', role: 'about.team.production', roleEn: 'about.team.production.en' },
];

export default function About() {
  const { language, t } = useLanguage();
  const isZh = language === 'zh';

  return (
    <div>
      <div className="relative py-32 overflow-hidden -mt-20 pt-[240px]">
        <div
          className="absolute inset-0 bg-cover bg-bottom"
          style={{ backgroundImage: `url('https://conversation.cdn.meoo.host/conversations/314004577148157952/image/2026-06-13/1781361446689-厂房大图留白多.webp?auth_key=55746025718d3ddbec6ea4d1b53b3ff7f1aa115cb7cd371ebe8a0d0e698543ff')` }}
        />
        <div className="absolute inset-0 bg-blue-900/60" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            {t('nav.about')}
          </h1>
          <p className="text-blue-100 text-lg">
            {t('about.intro')}
          </p>
        </div>
      </div>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t('about.profileTitle')}
            </h2>
            <p className="text-gray-600 mb-4" style={{ textIndent: '2em' }}>
              {t('about.companyDesc')}
            </p>
            <p className="text-gray-600" style={{ textIndent: '2em' }}>
              {t('about.companyPhilosophy')}
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-blue-50 rounded-2xl p-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">10+</div>
                <div className="text-gray-600 mt-2">{t('about.yearsExp')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">20+</div>
                <div className="text-gray-600 mt-2">{t('about.exportCountries')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">200+</div>
                <div className="text-gray-600 mt-2">{t('about.globalClients')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">20+</div>
                <div className="text-gray-600 mt-2">{t('about.patents')}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('about.milestones')}
          </h2>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200"></div>
            <div className="space-y-12">
              {milestones.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center"
                >
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8' : 'pr-8 opacity-0'}`}>
                    {index % 2 === 0 && (
                      <div className="bg-white p-4 rounded-lg shadow-md text-center">
                        <div className="text-2xl font-bold text-blue-600">{item.year}</div>
                        <div className="text-gray-700">{t(item.title)}</div>
                      </div>
                    )}
                  </div>
                  <div className="w-2/12 flex justify-center">
                    <div className="w-4 h-4 bg-blue-600 rounded-full relative z-10 ring-4 ring-white"></div>
                  </div>
                  <div className={`w-5/12 ${index % 2 === 1 ? 'pl-8' : 'pl-8 opacity-0'}`}>
                    {index % 2 === 1 && (
                      <div className="bg-white p-4 rounded-lg shadow-md text-center">
                        <div className="text-2xl font-bold text-blue-600">{item.year}</div>
                        <div className="text-gray-700">{t(item.title)}</div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {t('about.culture')}
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          {values.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <i className={`fas ${item.icon} text-4xl text-blue-600 mb-4`}></i>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t(item.title)}</h3>
              <p className="text-gray-600">{t(item.desc)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('about.team')}
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <i className="fas fa-user text-5xl text-white"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{isZh ? member.name : member.nameEn}</h3>
                <p className="text-blue-600">{t(isZh ? member.role : member.roleEn)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
