import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy'
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      style={{
        maxWidth: '100%',
        height: 'auto'
      }}
      onError={(e) => {
        // Fallback image jika gambar gagal dimuat
        e.currentTarget.src = '/logo/Logo-JS.png';
      }}
    />
  );
};

export default OptimizedImage;
