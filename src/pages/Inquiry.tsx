import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { submitForm } from '../services/api';
import { Send, Package } from 'lucide-react';

const products = [
  { id: '1', name: '阻燃工装面料', nameEn: 'Flame Retardant Fabric' },
  { id: '2', name: '防水透气面料', nameEn: 'Waterproof Fabric' },
  { id: '3', name: '抗静电面料', nameEn: 'Antistatic Fabric' },
  { id: '4', name: '防紫外线面料', nameEn: 'UV Protection Fabric' },
  { id: '5', name: '高透气运动面料', nameEn: 'Breathable Sport Fabric' },
];

export default function Inquiry() {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    product: '',
    quantity: '',
    name: '',
    company: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedProduct = products.find(p => p.id === formData.product);

      await submitForm({
        formType: 'inquiry',
        data: {
          product_id: formData.product,
          product_name: selectedProduct ? (language === 'zh' ? selectedProduct.name : selectedProduct.nameEn) : '',
          quantity: formData.quantity,
          customer_name: formData.name,
          company_name: formData.company,
          email: formData.email,
          phone: formData.phone,
          message: formData.message
        }
      });

      setSubmitted(true);
      setFormData({ product: '', quantity: '', name: '', company: '', email: '', phone: '', message: '' });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Failed to submit inquiry:', error);
      alert('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <Package className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-blue-900">{t('inquiry.title')}</h1>
          </div>

          {submitted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-green-100 text-green-700 p-4 rounded-lg mb-6 text-center"
            >
              {t('inquiry.submitted')}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('inquiry.product')}</label>
              <select
                name="product"
                value={formData.product}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('inquiry.selectProduct')}</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{language === 'zh' ? p.name : p.nameEn}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('inquiry.quantity')}</label>
              <input
                type="text"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                placeholder={t('inquiry.quantityPlaceholder')}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('inquiry.name')}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('inquiry.company')}</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('inquiry.email')}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('inquiry.phone')}</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('inquiry.message')}</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              {loading ? t('inquiry.submitting') : t('inquiry.submit')}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
