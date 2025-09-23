import React, { useState } from 'react';
import {  CheckCircle, Star, ChevronDown, ChevronUp } from 'lucide-react';

interface ProductInfoProps {
  product: {
    title?: string;
    reviews?: number;
    rating?: number;
  };
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface FAQ {
  question: string;
  answer: string;
}

interface Feature {
  icon: string;
  title: string;
  desc: string;
}

interface ReviewItemProps {
  name: string;
  rating: number;
  date: string;
  comment: string;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ name, rating, date, comment }) => (
  <div className="border-b pb-4">
    <div className="flex items-start justify-between mb-2">
      <div>
        <h5 className="font-semibold">{name}</h5>
        <div className="flex">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
          ))}
        </div>
      </div>
      <span className="text-sm text-gray-500">{date}</span>
    </div>
    <p className="text-gray-600">{comment}</p>
  </div>
);

const ProductInfo: React.FC<ProductInfoProps> = ({ product, activeTab, setActiveTab }) => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const tabs = [
    { id: 'description', label: 'Deskripsi' },
    { id: 'features', label: 'Fitur' },
    { id: 'reviews', label: `Review (${product.reviews})` },
    { id: 'faq', label: 'FAQ' }
  ];

  const features: Feature[] = [
    { icon: '📱', title: '100% Responsive', desc: 'Sempurna di semua ukuran layar' },
    { icon: '⚡', title: 'Super Cepat', desc: 'Optimized untuk performa maksimal' },
    { icon: '🎨', title: 'Mudah Dikustomisasi', desc: 'Ganti warna dan font dengan mudah' },
    { icon: '💻', title: 'Clean Code', desc: 'Kode terstruktur dan well-documented' },
    { icon: '❤️', title: 'SEO Friendly', desc: 'Optimized untuk search engine' },
    { icon: '📚', title: '15+ Sections', desc: 'Berbagai pilihan section siap pakai' }
  ];

  const faqs: FAQ[] = [
    { 
      question: 'Apakah template ini cocok untuk pemula?',
      answer: 'Ya, template ini sangat cocok untuk pemula. Kami menyediakan dokumentasi lengkap dan video tutorial step-by-step.'
    },
    {
      question: 'Apakah bisa digunakan untuk project komersial?',
      answer: 'Tentu saja! Dengan sekali pembelian, Anda bisa menggunakan template ini untuk unlimited project.'
    },
    {
      question: 'Bagaimana dengan update?',
      answer: 'Semua update future akan Anda dapatkan secara gratis.'
    }
  ];

  const includedItems = [
    'Source code HTML, CSS, dan JavaScript lengkap',
    'Fully responsive untuk semua perangkat',
    'Dokumentasi lengkap dan panduan instalasi',
    'Free update selamanya',
    'Support 24/7 via email'
  ];

  const technologies = ['HTML5', 'CSS3', 'JavaScript', 'Tailwind CSS', 'GSAP Animation', 'Responsive Design'];

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Tabs Header */}
      <div className="border-b">
        <div className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 font-semibold relative transition-colors
                ${activeTab === tab.id 
                  ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Description Tab */}
        {activeTab === 'description' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-4">{product.title}</h3>
              <p className="text-gray-600 mb-4">
                Template landing page modern dan profesional yang sempurna untuk bisnis, startup, 
                dan agensi. Didesain dengan pendekatan minimalis namun elegan.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3">Yang Anda Dapatkan:</h4>
              <ul className="space-y-2">
                {includedItems.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3">Teknologi yang Digunakan:</h4>
              <div className="flex flex-wrap gap-2">
                {technologies.map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div>
            <h3 className="text-2xl font-bold mb-6">Fitur Unggulan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start">
                    <div className="text-2xl mr-3">{feature.icon}</div>
                    <div>
                      <h5 className="font-semibold mb-1">{feature.title}</h5>
                      <p className="text-sm text-gray-600">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold">{product.rating}</span>
                  <div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">Based on {product.reviews} reviews</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Write a Review
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <ReviewItem 
                name="Ahmad Rizki"
                rating={5}
                date="2 hari yang lalu"
                comment="Template yang sangat bagus! Clean code dan mudah dikustomisasi."
              />
              <ReviewItem 
                name="Siti Nurhaliza"
                rating={5}
                date="1 minggu yang lalu"
                comment="Perfect untuk project client saya. Design modern dan animasinya smooth."
              />
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div>
            <h3 className="text-2xl font-bold mb-6">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h5 className="font-semibold">{faq.question}</h5>
                    {expandedFAQ === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {expandedFAQ === index && (
                    <p className="mt-3 text-gray-600">{faq.answer}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInfo;