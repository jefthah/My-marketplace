import React from 'react';
import SEOHead from '../components/SEOHead';
import OptimizedImage from '../components/OptimizedImage';

const BlogPage: React.FC = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Cara Membuat Website dengan Template Premium",
      excerpt: "Panduan lengkap untuk membuat website profesional menggunakan template premium dari marketplace design terpercaya.",
      slug: "cara-membuat-website-template-premium",
      date: "2024-01-15",
      readTime: "5 min read",
      image: "/logo/Logo-JS.png",
      category: "Tutorial"
    },
    {
      id: 2,
      title: "Tips Memilih Source Code Aplikasi yang Berkualitas",
      excerpt: "Pelajari cara memilih source code aplikasi yang aman, berkualitas, dan sesuai kebutuhan proyek Anda.",
      slug: "tips-memilih-source-code-aplikasi-berkualitas",
      date: "2024-01-10",
      readTime: "7 min read",
      image: "/logo/Logo-JS.png",
      category: "Tips"
    },
    {
      id: 3,
      title: "Panduan UI/UX Design untuk Pemula",
      excerpt: "Dasar-dasar UI/UX design yang perlu diketahui oleh pemula untuk menciptakan pengalaman pengguna yang optimal.",
      slug: "panduan-ui-ux-design-untuk-pemula",
      date: "2024-01-05",
      readTime: "10 min read",
      image: "/logo/Logo-JS.png",
      category: "Design"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Blog JD'SIGN - Tips & Tutorial Design, Template, dan Source Code"
        description="Temukan tips, tutorial, dan panduan lengkap tentang design, template premium, dan source code aplikasi di blog JD'SIGN Marketplace."
        keywords="blog design, tutorial template, tips source code, panduan UI/UX, marketplace design blog"
        url="https://your-domain.com/blog"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Blog JD'SIGN
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Temukan tips, tutorial, dan panduan lengkap tentang design, template premium, dan source code aplikasi
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <OptimizedImage
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    {post.category}
                  </span>
                  <span className="text-sm text-gray-500">{post.readTime}</span>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                  {post.title}
                </h2>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <time className="text-sm text-gray-500">
                    {new Date(post.date).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                  <a 
                    href={`/blog/${post.slug}`}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    Baca Selengkapnya →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
