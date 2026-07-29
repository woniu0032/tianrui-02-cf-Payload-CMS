import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function ChatWidget() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: '您好！有什么可以帮助您的吗？', isUser: false },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { text: input, isUser: true }]);
    setInput('');
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: '感谢您的留言，我们的客服会尽快回复您！', isUser: false },
      ]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 flex justify-between items-center">
            <span className="text-white font-semibold">{t('chat.title')}</span>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-blue-200">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="h-64 p-4 overflow-y-auto bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`mb-3 flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3/4 p-3 rounded-xl text-sm ${
                  msg.isUser ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('chat.placeholder')}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              {t('chat.send')}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform"
        >
          <i className="fas fa-comments text-xl"></i>
        </button>
      )}
    </div>
  );
}
