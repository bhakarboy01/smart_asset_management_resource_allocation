// ─── Enums ─────────────────────────────────────────────────────────────────

export type Role = "ADMIN" | "USER";

export type AssetStatus =
  | "AVAILABLE"
  | "PARTIALLY_AVAILABLE"
  | "UNAVAILABLE"
  | "UNDER_MAINTENANCE";

export type AssetCondition = "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "DAMAGED";

export type BookingStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ISSUED"
  | "RETURNED"
  | "OVERDUE"
  | "CANCELLED";

export type AuditAction =
  | "USER_REGISTERED"
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "ASSET_CREATED"
  | "ASSET_UPDATED"
  | "ASSET_DELETED"
  | "BOOKING_CREATED"
  | "BOOKING_APPROVED"
  | "BOOKING_REJECTED"
  | "BOOKING_CANCELLED"
  | "ASSET_ISSUED"
  | "ASSET_RETURNED"
  | "MAINTENANCE_SCHEDULED"
  | "MAINTENANCE_COMPLETED";

// ─── Core Models ────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  rollNumber?: string | null;
  department?: string | null;
  phone?: string | null;
  avatar?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: { assets: number };
}

export interface Asset {
  id: string;
  name: string;
  description?: string | null;
  categoryId: string;
  category?: Category;
  totalQuantity: number;
  availableQty: number;
  status: AssetStatus;
  condition: AssetCondition;
  location?: string | null;
  serialNumber?: string | null;
  purchaseDate?: Date | null;
  purchasePrice?: number | null;
  warrantyExpiry?: Date | null;
  imageUrl?: string | null;
  qrCode?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  bookings?: Booking[];
  _count?: { bookings: number };
}

export interface Booking {
  id: string;
  userId: string;
  user?: User;
  assetId: string;
  asset?: Asset;
  quantity: number;
  purpose: string;
  eventName?: string | null;
  fromDate: Date;
  toDate: Date;
  issuedAt?: Date | null;
  returnedAt?: Date | null;
  status: BookingStatus;
  adminNotes?: string | null;
  rejectionReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceLog {
  id: string;
  assetId: string;
  asset?: Asset;
  title: string;
  description?: string | null;
  condition: AssetCondition;
  cost?: number | null;
  technicianName?: string | null;
  scheduledAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  user?: User | null;
  action: AuditAction;
  entityType?: string | null;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  createdAt: Date;
}

// ─── API Response Types ──────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Auth Types ──────────────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  rollNumber?: string;
  department?: string;
  phone?: string;
}

// ─── Analytics Types ─────────────────────────────────────────────────────────

export interface DashboardStats {
  totalAssets: number;
  availableAssets: number;
  activeBookings: number;
  pendingRequests: number;
  overdueReturns: number;
  totalUsers: number;
}

export interface AssetUtilization {
  assetId: string;
  assetName: string;
  category: string;
  totalBookings: number;
  utilizationRate: number;
}

export interface BookingTrend {
  date: string;
  bookings: number;
  returns: number;
}

export interface CategoryStats {
  category: string;
  count: number;
  percentage: number;
}
