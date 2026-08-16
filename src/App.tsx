import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home';
import News from './pages/News';
import About from './pages/About';
import Products from './pages/Products';
import Honors from './pages/Honors';
import Factory from './pages/Factory';
import Contact from './pages/Contact';
import ProductDetail from './pages/ProductDetail';
import NewsDetail from './pages/NewsDetail';
import Inquiry from './pages/Inquiry';
import AdminLogin from './pages/AdminLogin';
import AdminProducts from './pages/AdminProducts';
// 管理后台页面
import AdminNews from './pages/AdminNews';
import AdminForms from './pages/AdminForms';
import AdminChat from './pages/AdminChat';
import { LanguageProvider } from './contexts/LanguageContext';

function AppContent() {
  const [showChat, setShowChat] = useState(false);
  const location = useLocation();

  // 判断是否是管理后台页面
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    const timer = setTimeout(() => setShowChat(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {!isAdminPage && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<News />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/honors" element={<Honors />} />
          <Route path="/factory" element={<Factory />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/inquiry" element={<Inquiry />} />
          {/* 管理后台路由 */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/news" element={<AdminNews />} />
          <Route path="/admin/forms" element={<AdminForms />} />
          <Route path="/admin/chat" element={<AdminChat />} />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
      {showChat && !isAdminPage && <ChatWidget />}
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </LanguageProvider>
  );
}

export default App;
