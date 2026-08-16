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

  // 导航文字颜色 - 始终为白色（激活状态为品牌绿色）
  const getNavTextColor = (isActive: boolean) => {
    if (isActive) {
      return 'text-[#61CE70]';
    }
    return 'text-white hover:text-[#61CE70]';
  };

  // Logo 文字颜色 - 始终为白色
  const getLogoTextColor = () => {
    return 'text-white';
  };

  // Logo 副标题颜色 - 始终为白色半透明
  const getLogoSubTextColor = () => {
    return 'text-white/70';
  };

  // 语言按钮样式 - 始终为白色
  const getLangButtonClass = () => {
    return 'text-white border-white/50 hover:text-[#61CE70] hover:border-[#61CE70]';
  };

  // 移动端菜单样式 - 始终为深色
  const getMobileMenuClass = () => {
    return 'bg-slate-900/95 border-white/20';
  };

  // 移动端导航文字颜色 - 始终为白色
  const getMobileNavTextColor = (isActive: boolean) => {
    if (isActive) {
      return 'text-[#61CE70]';
    }
    return 'text-white hover:text-[#61CE70]';
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isHome 
        ? scrolled 
          ? 'bg-slate-900/80 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
        : 'bg-slate-900/80 backdrop-blur-md shadow-lg'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">TR</span>
            </div>
            <div className="hidden sm:block">
              <span className={`text-xl font-bold transition-colors duration-500 ${getLogoTextColor()}`}>天睿纺织</span>
              <span className={`text-xs block transition-colors duration-500 ${getLogoSubTextColor()}`}>TianRui Textile</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center ml-auto">
            <nav className="flex items-center space-x-1 mr-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 text-base font-medium transition-all duration-500 rounded-md ${getNavTextColor(location.pathname === item.path)}`}
                >
                  {t(item.label)}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleLanguage}
                className={`flex items-center space-x-1 px-3 py-1.5 text-sm font-medium transition-all duration-500 border rounded-full ${getLangButtonClass()}`}
              >
                <Globe className="w-4 h-4" />
                <span>{language === 'zh' ? 'EN' : '中'}</span>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 transition-colors duration-500 text-white hover:text-[#61CE70]"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className={`lg:hidden border-t backdrop-blur-sm ${getMobileMenuClass()}`}>
          <nav className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 text-base font-medium rounded-md transition-colors duration-300 ${getMobileNavTextColor(location.pathname === item.path)}`}
              >
                {t(item.label)}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
