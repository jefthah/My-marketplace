export interface Design {
  id: number
  title: string
  price: string
  rating: number
  views: number
  category: string
  image: string
  description?: string
  features?: string[]
  preview?: string[]
  author?: string
  downloadCount?: number
  tags?: string[]
}

export interface Category {
  id: string
  name: string
  icon: string
}

// API Product interfaces
export interface User {
  _id: string;
  username: string;
  photo: string | null;
}

export interface Product {
  _id: string;
  userID: User;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  videoUrl: string[]; // Field yang sudah ada - array of YouTube URLs
  benefit1: string;
  benefit2: string;
  benefit3: string;
  rating: number;
  totalReviews: number;
  isActive: boolean;
  hasSourceCode: boolean;
  createdAt: string;
  updatedAt: string;
  // Review statistics from backend aggregation
  averageRating?: number;
  // YouTube Video Preview fields (new - from backend transformation)
  hasPreviewVideo?: boolean;
  embedVideoUrl?: string | null;
  videoThumbnail?: string | null;
  previewVideo?: {
    youtubeUrl?: string;
    videoId?: string;
    embedUrl?: string;
    thumbnail?: string;
    title?: string;
    duration?: string;
  };
  // Seller info from backend transformation
  seller?: {
    id: string;
    username: string;
    email: string;
    profileImage?: string;
    verified?: boolean;
    positiveRating?: number;
  };
}

export interface ProductsResponse {
  statusCode: number;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message: string;
  success: boolean;
}

// Order interfaces
export interface OrderItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  downloadUrl?: string;
  image: string;
  category: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  paymentMethod: string;
  isGuestOrder: boolean;
  userID?: string;
  productID?: {
    _id: string;
    title: string;
    images: string[];
    category: string;
    price: number;
  };
  unitPrice?: number;
  quantity?: number;
  orderDate?: string;
}

export interface OrdersResponse {
  statusCode: number;
  data: {
    orders: Order[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalOrders: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message: string;
  success: boolean;
}
