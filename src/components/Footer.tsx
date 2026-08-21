import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { MapPin, Phone, Mail, Facebook, Linkedin, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  const { t, language } = useLanguage();

  const quickLinks = [
    { label: t('nav.home'), href: '#/' },
    { label: t('nav.products'), href: '#/products' },
    { label: t('nav.about'), href: '#/about' },
    { label: '厂区厂貌', href: '#/factory' },
  ];

  const products = [
    '阻燃面料',
    '三防面料',
    '防静电面料',
    '防酸碱面料',
    '医护面料',
  ];

  return (
    <footer className="bg-slate-900 text-white relative overflow-hidden">
      {/* Subtle top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand column - wider */}
          <div className="lg:col-span-3">
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
                <span className="text-white font-bold text-lg tracking-tight">TR</span>
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">{language === 'zh' ? '天睿纺织' : 'Tianrui Textile'}</h3>
                <span className="text-[10px] text-slate-500 tracking-widest uppercase">Since 2013</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4 max-w-sm">
              {language === 'zh'
                ? '专业的功能性面料研发与出口企业，致力于为全球客户提供高品质纺织解决方案。'
                : 'Professional functional fabric R&D and export enterprise, dedicated to providing high-quality textile solutions for global customers.'}
            </p>
            <div className="flex space-x-2 mt-auto">
              {[Facebook, Linkedin, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600/20 transition-all duration-200">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-5">{language === 'zh' ? '快速链接' : 'Quick Links'}</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-slate-400 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                    <span className="w-0 h-px bg-blue-400 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-200" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-5">{language === 'zh' ? '产品系列' : 'Products'}</h4>
            <ul className="space-y-3">
              {products.map((product) => (
                <li key={product}>
                  <a href="#/products" className="text-slate-400 hover:text-white transition-colors duration-200 text-sm flex items-center group">
                    <span className="w-0 h-px bg-blue-400 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-200" />
                    {product}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-5">{language === 'zh' ? '联系我们' : 'Contact Us'}</h4>

              {/* Phone + Email columns - 3 columns for vertical alignment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3 mb-5">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Phone size={14} className="text-blue-400 flex-shrink-0" />
                    <span>+86 18737369130</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Mail size={14} className="text-blue-400 flex-shrink-0" />
                    <span>tianrui003@xxtrfz.com</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Phone size={14} className="text-blue-400 flex-shrink-0" />
                    <span>+86 15803848995</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Mail size={14} className="text-blue-400 flex-shrink-0" />
                    <span>tianrui012@xxtrfz.com</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Phone size={14} className="text-blue-400 flex-shrink-0" />
                    <span>+86 18937396102</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Mail size={14} className="text-blue-400 flex-shrink-0" />
                    <span>tianrui010@xxtrfz.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Address */}
            <div className="pt-5 border-t border-slate-700">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-300 mb-1">销售地址</p>
                  <p className="text-slate-400 text-sm leading-relaxed">河南省新乡市红旗区金穗大道跨境贸易大厦3501</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2013 {language === 'zh' ? '天睿纺织' : 'Tianrui Textile'}. {language === 'zh' ? '保留所有权利' : 'All rights reserved.'}
            </p>
            <div className="flex space-x-8">
              <a href="#" className="text-slate-500 hover:text-slate-300 text-sm transition-colors duration-200">
                {language === 'zh' ? '隐私政策' : 'Privacy Policy'}
              </a>
              <a href="#" className="text-slate-500 hover:text-slate-300 text-sm transition-colors duration-200">
                {language === 'zh' ? '服务条款' : 'Terms of Service'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
