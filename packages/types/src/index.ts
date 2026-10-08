export enum UserRole {
  USER = 'USER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum SellerStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum ListingStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  SOLD_OUT = 'SOLD_OUT',
  EXPIRED = 'EXPIRED',
  REJECTED = 'REJECTED',
}

export enum AccessType {
  PRIVATE_PROFILE = 'PRIVATE_PROFILE',
  SHARED_SCREEN = 'SHARED_SCREEN',
  FAMILY_INVITE = 'FAMILY_INVITE',
  PRIVATE_ACCOUNT = 'PRIVATE_ACCOUNT',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  DELIVERED = 'DELIVERED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUND_REQUESTED = 'REFUND_REQUESTED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED',
}

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  REFUND = 'REFUND',
  ADJUSTMENT = 'ADJUSTMENT',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum WithdrawalStatus {
  REQUESTED = 'REQUESTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export enum NotificationType {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  WALLET_CREDIT = 'WALLET_CREDIT',
  WALLET_DEBIT = 'WALLET_DEBIT',
  NEW_MESSAGE = 'NEW_MESSAGE',
  SELLER_APPLICATION = 'SELLER_APPLICATION',
  SELLER_APPROVED = 'SELLER_APPROVED',
  SELLER_REJECTED = 'SELLER_REJECTED',
  REFUND_REQUESTED = 'REFUND_REQUESTED',
  REFUND_APPROVED = 'REFUND_APPROVED',
  REFUND_REJECTED = 'REFUND_REJECTED',
  WITHDRAWAL_REQUESTED = 'WITHDRAWAL_REQUESTED',
  WITHDRAWAL_APPROVED = 'WITHDRAWAL_APPROVED',
  WITHDRAWAL_REJECTED = 'WITHDRAWAL_REJECTED',
}

export enum RefundReason {
  ACCESS_NOT_WORKING = 'ACCESS_NOT_WORKING',
  INCORRECT_PRODUCT = 'INCORRECT_PRODUCT',
  DELIVERY_MISSING = 'DELIVERY_MISSING',
  EXPIRED_ACCESS = 'EXPIRED_ACCESS',
  OTHER = 'OTHER',
}

export enum RefundStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  avatarUrl?: string | null;
  isSuspended: boolean;
  isBanned: boolean;
  createdAt: string;
}

export interface SellerProfileSummary {
  id: string;
  userId: string;
  displayName: string;
  bio?: string | null;
  rating: number;
  totalSales: number;
  completedOrdersCount: number;
  isVerified: boolean;
  status: SellerStatus;
}

export interface ListingCardData {
  id: string;
  slug: string;
  title: string;
  planName: string;
  durationMonths: number;
  price: number;
  originalPrice?: number | null;
  accessType: AccessType;
  deviceLimit: string;
  quality: string;
  region: string;
  availableStock: number;
  totalStock: number;
  status: ListingStatus;
  platform: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  seller: {
    id: string;
    displayName: string;
    rating: number;
    isVerified: boolean;
    totalSales: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  code?: string;
}
