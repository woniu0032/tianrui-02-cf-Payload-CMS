import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Calendar, ArrowRight, Newspaper } from 'lucide-react';
import { fetchNews, News as NewsType } from '../services/api';

export default function News() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const isZh = language === 'zh';
  const [newsData, setNewsData] = useState<NewsType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const response = await fetchNews({ limit: 20 });
      if (response.data && response.data.length > 0) {
        setNewsData(response.data);
      } else {
        setNewsData([]);
      }
    } catch (error) {
      console.error('Failed to load news:', error);
      setNewsData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-32 -mt-20 pt-[240px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white text-center"
          >
            {t('nav.news')}
          </motion.h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {newsData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {isZh ? '暂无新闻资讯' : 'No News Available'}
            </h3>
            <p className="text-gray-400">
              {isZh ? '后台尚未发布任何新闻，请联系管理员添加内容' : 'No news has been published yet. Please contact the administrator.'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsData.map((news, index) => (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/news/${news.id}`)}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={news.coverImage?.url || 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=250&fit=crop'}
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    {news.publishedAt
                      ? new Date(news.publishedAt).toLocaleDateString(isZh ? 'zh-CN' : 'en-US')
                      : new Date(news.createdAt).toLocaleDateString(isZh ? 'zh-CN' : 'en-US')}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {isZh ? news.title : (news.titleEn || news.title)}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {isZh ? (news.summary || '') : (news.summaryEn || news.summary || '')}
                  </p>
                  <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                    {t('news.readMore')}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
