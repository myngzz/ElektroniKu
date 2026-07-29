// Types untuk seluruh aplikasi ElektroniKu

export interface Product {
  _id: string;
  name: string;
  brand: string;
  category: Category | string;
  price: number;
  originalPrice?: number;
  stock: number;
  images: string[];
  specifications: Record<string, unknown>;
  description?: string;
  aiGeneratedDescription?: string;
  avgRating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  tags?: string[];
  discountPercent?: number;
  inStock?: boolean;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  specFields: SpecField[];
}

export interface SpecField {
  key: string;
  label: string;
  unit?: string;
  type: 'text' | 'number' | 'boolean' | 'select';
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isActive?: boolean;
  avatar?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    province?: string;
    postalCode?: string;
  };
  createdAt: string;
}

export interface Review {
  _id: string;
  product: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface Cart {
  _id?: string;
  user: string;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user?: string | { _id: string; name: string; email: string };
  items: {
    product: string;
    name: string;
    price: number;
    qty: number;
    image?: string;
  }[];
  shippingAddress: {
    name: string;
    phone?: string;
    street: string;
    city: string;
    province?: string;
    postalCode?: string;
  };
  subtotal: number;
  shippingCost: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface AIAssistantResponse {
  answer: string;
  relatedProducts: Partial<Product>[];
}

export interface AICompareResponse {
  comparison: string;
  products: Partial<Product>[];
}

export interface AIReviewSummary {
  summary: string;
  positives: string[];
  negatives: string[];
  recommendation: string;
  sentimentScore: number;
  reviewCount: number;
  avgRating: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  revenueGrowth: number;
  ordersThisMonth: number;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  order?: string;
  page?: number;
  limit?: number;
  search?: string;
  featured?: string;
}
