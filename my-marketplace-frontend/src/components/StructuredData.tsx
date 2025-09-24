import React from 'react';

interface StructuredDataProps {
  type: 'website' | 'product' | 'organization';
  data: any;
}

const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const getStructuredData = () => {
    switch (type) {
      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "JD'SIGN Marketplace",
          "description": "Marketplace terpercaya untuk jual beli template design premium, source code aplikasi, dan aset digital berkualitas tinggi",
          "url": "https://your-domain.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://your-domain.com/products?search={search_term_string}",
            "query-input": "required name=search_term_string"
          },
          "publisher": {
            "@type": "Organization",
            "name": "JD'SIGN",
            "logo": {
              "@type": "ImageObject",
              "url": "https://your-domain.com/logo/Logo-JS.png"
            }
          }
        };

      case 'product':
        return {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": data.name,
          "description": data.description,
          "image": data.images,
          "brand": {
            "@type": "Brand",
            "name": "JD'SIGN"
          },
          "offers": {
            "@type": "Offer",
            "price": data.price,
            "priceCurrency": "IDR",
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "JD'SIGN Marketplace"
            }
          },
          "aggregateRating": data.rating ? {
            "@type": "AggregateRating",
            "ratingValue": data.rating,
            "reviewCount": data.reviewCount
          } : undefined
        };

      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "JD'SIGN Marketplace",
          "description": "Marketplace terpercaya untuk jual beli template design premium, source code aplikasi, dan aset digital berkualitas tinggi",
          "url": "https://your-domain.com",
          "logo": "https://your-domain.com/logo/Logo-JS.png",
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": "Indonesian"
          },
          "sameAs": [
            "https://instagram.com/jdsign",
            "https://facebook.com/jdsign"
          ]
        };

      default:
        return {};
    }
  };

  const structuredData = getStructuredData();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
};

export default StructuredData;
