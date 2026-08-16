import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { submitForm } from '../services/api';
import { Phone, Mail, MapPin, Send, CheckCircle, AlertCircle, X } from 'lucide-react';

const contacts = [
  {
    name: '吕女士',
    phone: '18737369130',
    wechat: '18737369130',
    email: 'tianrui003@xxtrfz.com',
  },
  {
    name: '雷先生',
    phone: '15803848995',
    wechat: '15803848995',
    email: 'tianrui012@xxtrfz.com',
  },
  {
    name: '原女士',
    phone: '18937396102',
    wechat: '15303731680',
    email: 'tianrui010@xxtrfz.com',
  },
];

const salesAddress = '河南省新乡市红旗区金穗大道跨境贸易大厦3501';

export default function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t('message.error.nameRequired') || '请输入姓名';
    if (!formData.email.trim()) {
      newErrors.email = t('message.error.emailRequired') || '请输入邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('message.error.emailInvalid') || '邮箱格式不正确';
    }
    if (!formData.message.trim()) newErrors.message = t('message.error.messageRequired') || '请输入留言内容';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      await submitForm({
        formType: 'message',
        data: {
          customer_name: formData.name,
          company_name: formData.company,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        },
      });

      setSubmitStatus('success');
      setFormData({ name: '', company: '', email: '', phone: '', message: '' });
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error: any) {
      console.error('Failed to submit message:', error);
      setSubmitStatus('error');
      setErrorMessage(error?.message || t('inquiry.submitError') || '提交失败，请稍后重试');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-32 -mt-20 pt-[240px]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-4"
          >
            {t('nav.contact')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-blue-100 text-lg"
          >
            欢迎随时与我们取得联系
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Left: Contact Info + QR Code */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Contact + Address Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 h-full flex flex-col">
              <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                <Phone className="w-6 h-6" />
                联系方式
              </h2>
              <div className="space-y-6">
                {contacts.map((c, i) => (
                  <div key={i} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                    <p className="font-semibold text-gray-900 text-lg mb-2">{c.name}</p>
                    <div className="space-y-1.5 text-sm text-gray-600">
                      <p className="flex items-start gap-2">
                        <Phone className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                        <span>{c.phone}（微信同号）</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <Mail className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                        <span>{c.email}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Address Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  销售地址
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">{salesAddress}</p>
              </div>
            </div>
          </motion.div>

          {/* Right: Message Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-28">
              <h2 className="text-2xl font-bold text-blue-900 mb-2 flex items-center gap-2">
                <Send className="w-6 h-6" />
                在线留言
              </h2>
              <p className="text-gray-500 mb-6">填写以下信息，我们将尽快与您联系</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      姓名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="您的姓名"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">公司名称</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="公司名称（选填）"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      邮箱 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="your@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">电话</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="联系电话（选填）"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    留言内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.message ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all`}
                    placeholder="请描述您的需求或问题..."
                  />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                  {loading ? '提交中...' : '提交留言'}
                </button>
              </form>

              {/* Success / Error Toast */}
              <AnimatePresence>
                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mt-6 flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">留言已提交</p>
                      <p className="text-sm text-green-600 mt-1">我们会尽快与您联系</p>
                    </div>
                    <button onClick={() => setSubmitStatus('idle')} className="text-green-400 hover:text-green-600">
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mt-6 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">提交失败</p>
                      <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
                    </div>
                    <button onClick={() => setSubmitStatus('idle')} className="text-red-400 hover:text-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
