import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Menu, X, Globe } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'nav.home' },
    { path: '/news', label: 'nav.news' },
    { path: '/about', label: 'nav.about' },
    { path: '/products', label: 'nav.products' },
    { path: '/honors', label: 'nav.honors' },
    { path: '/factory', label: 'nav.factory' },
    { path: '/contact', label: 'nav.contact' },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  const isHome = location.pathname === '/';

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }

    const handleScroll = () => {
      // 检测是否滚动超过一定距离，添加背景
      setScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  // 导航文字颜色 - 白色，激活状态为品牌绿色
  const getNavTextColor = (isActive: boolean) => {
    if (isActive) {
      return 'text-[#61CE70] font-semibold';
    }
    return 'text-white/90 hover:text-white';
  };

  // Logo 文字颜色 - 始终为白色
  const getLogoTextColor = () => {
    return 'text-white';
  };

  // Logo 副标题颜色 - 始终为白色半透明
  const getLogoSubTextColor = () => {
    return 'text-white/70';
  };


  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isHome
        ? scrolled
          ? 'bg-slate-900/90 backdrop-blur-lg shadow-xl shadow-black/10'
          : 'bg-gradient-to-b from-black/30 to-transparent'
        : 'bg-slate-900/95 backdrop-blur-lg shadow-xl shadow-black/10'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/30 transition-transform duration-300 group-hover:scale-105">
              <span className="text-white font-bold text-lg tracking-tight">TR</span>
            </div>
            <div className="hidden sm:block">
              <span className={`text-xl font-bold tracking-tight transition-colors duration-500 ${getLogoTextColor()}`}>天睿纺织</span>
              <span className={`text-[11px] block -mt-0.5 tracking-widest uppercase transition-colors duration-500 ${getLogoSubTextColor()}`}>TianRui Textile</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center ml-auto">
            <nav className="flex items-center space-x-0.5 mr-8">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 text-[15px] font-medium transition-all duration-300 rounded-lg ${getNavTextColor(isActive)}`}
                  >
                    {t(item.label)}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 text-sm font-medium transition-all duration-300 border border-white/20 rounded-full text-white/80 hover:text-white hover:border-white/50 hover:bg-white/5 btn-press"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{language === 'zh' ? 'EN' : '中'}</span>
              </button>
            </div>
          </div>

          {/* 移动端汉堡菜单按钮 - 始终显示 */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 transition-all duration-300 text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-slate-900/98 backdrop-blur-xl">
          <nav className="px-4 py-4 space-y-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'text-[#61CE70] bg-[#61CE70]/10'
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t(item.label)}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
