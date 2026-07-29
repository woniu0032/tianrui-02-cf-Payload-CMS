import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { MapPin, Phone, Mail, Facebook, Linkedin, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  const { t, language } = useLanguage();

  const quickLinks = [
    { label: t('nav.home'), href: '#/' },
    { label: t('nav.products'), href: '#/products' },
    { label: t('nav.about'), href: '#/about' },
    { label: t('nav.contact'), href: '#/contact' },
  ];

  const products = [
    t('products.fireproof'),
    t('products.waterproof'),
    t('products.antistatic'),
    t('products.uv'),
  ];

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">{language === 'zh' ? '天睿纺织' : 'Tianrui Textile'}</h3>
            <p className="text-slate-300 text-sm mb-4">
              {language === 'zh' 
                ? '专业的功能性面料研发与出口企业，致力于为全球客户提供高品质纺织解决方案。'
                : 'Professional functional fabric R&D and export enterprise, dedicated to providing high-quality textile solutions for global customers.'}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Linkedin size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Instagram size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">{language === 'zh' ? '快速链接' : 'Quick Links'}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-slate-300 hover:text-white transition-colors text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">{language === 'zh' ? '产品系列' : 'Products'}</h4>
            <ul className="space-y-2">
              {products.map((product) => (
                <li key={product}>
                  <a href="#/products" className="text-slate-300 hover:text-white transition-colors text-sm">
                    {product}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">{language === 'zh' ? '联系我们' : 'Contact Us'}</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300 text-sm">{t('footer.address')}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-blue-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">{t('footer.phone')}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-blue-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">{t('footer.email')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © 2024 {language === 'zh' ? '天睿纺织' : 'Tianrui Textile'}. {language === 'zh' ? '保留所有权利' : 'All rights reserved.'}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">
                {language === 'zh' ? '隐私政策' : 'Privacy Policy'}
              </a>
              <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">
                {language === 'zh' ? '服务条款' : 'Terms of Service'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
