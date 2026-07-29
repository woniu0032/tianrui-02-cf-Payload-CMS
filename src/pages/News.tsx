import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Calendar, ArrowRight } from 'lucide-react';
import { fetchNews, News as NewsType } from '../services/api';

// 默认新闻数据（当 API 不可用时使用）
const defaultNewsData = [
  {
    id: '1',
    title: '天睿纺织荣获2024年度优秀出口企业称号',
    titleEn: 'Tianrui Textile Wins 2024 Outstanding Export Enterprise Award',
    summary: '凭借卓越的产品质量和优质的客户服务，天睿纺织在国际市场上获得广泛认可...',
    summaryEn: 'With excellent product quality and superior customer service, Tianrui Textile has gained wide recognition...',
    date: '2024-12-15',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=250&fit=crop',
  },
  {
    id: '2',
    title: '新型防火面料技术突破，通过国际权威认证',
    titleEn: 'New Fireproof Fabric Technology Breakthrough Passes International Certification',
    summary: '公司研发团队成功开发出新一代高性能防火面料，已通过欧盟CE认证...',
    summaryEn: 'Our R&D team successfully developed new high-performance fireproof fabric, certified by EU CE...',
    date: '2024-11-28',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
  },
  {
    id: '3',
    title: '天睿纺织参加德国慕尼黑功能性面料展览会',
    titleEn: 'Tianrui Textile Participates in Munich Functional Fabric Exhibition',
    summary: '作为亚洲领先的功能性面料供应商，天睿纺织携最新产品亮相国际展会...',
    summaryEn: 'As Asia\'s leading functional fabric supplier, Tianrui showcases latest products at international exhibition...',
    date: '2024-10-20',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
  },
];

export default function News() {
  const { language, t } = useLanguage();
  const isZh = language === 'zh';
  const [newsData, setNewsData] = useState<any[]>(defaultNewsData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const response = await fetchNews({ isPublished: true, limit: 20 });
      if (response.data && response.data.length > 0) {
        const formattedNews = response.data.map((news: NewsType) => ({
          id: news.id,
          title: news.title,
          titleEn: news.title,
          summary: news.summary || '',
          summaryEn: news.summary || '',
          date: news.publishedAt ? new Date(news.publishedAt).toISOString().split('T')[0] : news.createdAt.split('T')[0],
          image: news.coverImage?.url || 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=250&fit=crop',
        }));
        setNewsData(formattedNews);
      }
    } catch (error) {
      console.error('Failed to load news:', error);
      // 使用默认数据
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsData.map((news, index) => (
            <motion.div
              key={news.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={news.image}
                  alt={isZh ? news.title : news.titleEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  {news.date}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {isZh ? news.title : news.titleEn}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {isZh ? news.summary : news.summaryEn}
                </p>
                <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                  {t('news.readMore')}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
