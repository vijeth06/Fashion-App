// Type definitions for VF-TryOn application

// User and Authentication Types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  provider: string;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
  preferences?: UserPreferences;
  profile?: UserProfile;
}

export interface UserPreferences {
  favoriteColors: string[];
  preferredStyle: StyleType;
  sizePreferences: SizePreferences;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  phoneNumber?: string;
  address?: Address;
  measurements?: BodyMeasurements;
}

// Product and Catalog Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  category: CategoryType;
  subcategory?: string;
  brand: string;
  images: ProductImage[];
  sizes: Size[];
  colors: Color[];
  materials: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  createdAt: string;
  updatedAt: string;
  metadata?: ProductMetadata;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  type: 'main' | 'detail' | '360' | 'ar_model';
  order: number;
}

export interface Size {
  id: string;
  name: string;
  value: string;
  measurements?: SizeMeasurements;
  available: boolean;
}

export interface Color {
  id: string;
  name: string;
  hex: string;
  available: boolean;
}

// AR and Try-On Types
export interface TryOnSession {
  id: string;
  userId: string;
  productId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  interactions: TryOnInteraction[];
  photos: TryOnPhoto[];
  rating?: number;
  feedback?: string;
}

export interface TryOnInteraction {
  type: 'gesture' | 'touch' | 'voice' | 'eye_tracking';
  timestamp: string;
  data: any;
}

export interface TryOnPhoto {
  id: string;
  url: string;
  timestamp: string;
  filters?: string[];
  shared: boolean;
}

export interface ARSettings {
  handTracking: boolean;
  gestureControls: boolean;
  physicsEnabled: boolean;
  lightingAdjustment: number;
  backgroundBlur: boolean;
  mirrorMode: boolean;
}

// AI and Recommendation Types
export interface StyleRecommendation {
  id: string;
  productIds: string[];
  confidence: number;
  reason: string;
  tags: string[];
  occasion: string;
  season: string;
}

export interface OutfitCombination {
  id: string;
  name: string;
  products: Product[];
  style: StyleType;
  occasion: string;
  season: string;
  confidence: number;
  createdBy: 'ai' | 'user' | 'stylist';
  likes: number;
  saves: number;
}

export interface BiometricData {
  bodyType: BodyType;
  measurements: BodyMeasurements;
  skinTone: SkinTone;
  faceShape: FaceShape;
  preferences: StylePreferences;
}

// Shopping and Commerce Types
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
  price: number;
  addedAt: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: Address;
  billingAddress: Address;
  tracking?: TrackingInfo;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

// Enum Types
export type CategoryType = 
  | 'tops' 
  | 'bottoms' 
  | 'dresses' 
  | 'outerwear' 
  | 'shoes' 
  | 'accessories' 
  | 'bags' 
  | 'jewelry';

export type StyleType = 
  | 'casual' 
  | 'formal' 
  | 'business' 
  | 'party' 
  | 'sporty' 
  | 'vintage' 
  | 'minimalist' 
  | 'bohemian' 
  | 'edgy' 
  | 'romantic';

export type BodyType = 
  | 'hourglass' 
  | 'pear' 
  | 'apple' 
  | 'rectangle' 
  | 'inverted_triangle';

export type SkinTone = 
  | 'very_light' 
  | 'light' 
  | 'medium_light' 
  | 'medium' 
  | 'medium_dark' 
  | 'dark' 
  | 'very_dark';

export type FaceShape = 
  | 'oval' 
  | 'round' 
  | 'square' 
  | 'heart' 
  | 'diamond' 
  | 'oblong';

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'returned';

// Utility Types
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface BodyMeasurements {
  height: number;
  weight: number;
  chest: number;
  waist: number;
  hips: number;
  shoulderWidth: number;
  armLength: number;
  legLength: number;
  unit: 'metric' | 'imperial';
}

export interface SizeMeasurements {
  chest?: number;
  waist?: number;
  hips?: number;
  length?: number;
  width?: number;
}

export interface SizePreferences {
  preferredFit: 'tight' | 'fitted' | 'regular' | 'loose' | 'oversized';
  brandSizes: Record<string, string>;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  promotions: boolean;
  orderUpdates: boolean;
  newArrivals: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  shareActivity: boolean;
  dataCaching: boolean;
  analytics: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay';
  provider: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  billingAddress: Address;
}

export interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  status: string;
  updates: TrackingUpdate[];
}

export interface TrackingUpdate {
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

export interface ProductMetadata {
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  careInstructions: string[];
  sustainabilityScore: number;
  ethicalRating: number;
}

export interface StylePreferences {
  preferredColors: string[];
  avoidedColors: string[];
  preferredPatterns: string[];
  preferredFabrics: string[];
  stylePersonality: StyleType[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Component Props Types
export interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  message?: string;
  overlay?: boolean;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<any>;
  onError?: (error: Error, errorInfo: any) => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
}

// Event Types
export interface ProductInteractionEvent {
  type: 'view' | 'add_to_cart' | 'add_to_wishlist' | 'try_on' | 'share';
  productId: string;
  userId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface SearchEvent {
  query: string;
  filters: Record<string, any>;
  results: number;
  timestamp: string;
  userId?: string;
}