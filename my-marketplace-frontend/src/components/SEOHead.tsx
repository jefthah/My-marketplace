import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: any;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "JD'SIGN Marketplace - Jual Beli Template Design Premium & Source Code Indonesia",
  description = "JD'SIGN Marketplace - Platform jual beli template design premium, source code aplikasi, dan aset digital berkualitas tinggi. Temukan template website, mobile app, UI/UX design dengan harga terbaik di Indonesia.",
  keywords = "jd sign marketplace, marketplace design, template premium, source code, jual beli template, design assets, template website, mobile app template, UI/UX design, marketplace Indonesia, jd'sign, template design premium",
  image = "https://my-marketplace-sigma.vercel.app/logo/Logo-JS.png",
  url = "https://my-marketplace-sigma.vercel.app",
  type = "website",
  structuredData
}) => {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="JD'SIGN Marketplace" />
      <meta property="og:locale" content="id_ID" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
