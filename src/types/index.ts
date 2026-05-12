export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'customer' | 'owner' | 'admin';
  createdAt: string;
  profileImage?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  notificationPreferences?: {
    whatsapp: boolean;
    email: boolean;
  };
  verifiedOwner?: boolean;
  bookingReliabilityScore?: number;
}

export interface SalonServiceItem {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
}

// Deprecated, use top-level latitude/longitude instead
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Salon {
  salonId: string;
  ownerId: string;
  name: string;
  description?: string;
  category?: string;
  address: string;
  city?: string;
  state?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  website?: string;
  services: SalonServiceItem[];
  features?: string[];
  openingHours?: string;
  closingHours?: string;
  availableDays?: string[];
  queueLength: number;
  queueCapacity?: number;
  averageServiceTime: number; // in minutes
  estimatedWaitTime: number; // in minutes
  rating: number;
  galleryImages?: string[];
  logoImage?: string;
  bannerImage?: string;
  images: string[]; // Deprecated, keep for backwards compat
  image: string; // Deprecated, keep for backwards compat
  openStatus: boolean;
  yearsOfExperience?: number;
  businessDescription?: string;
  specialties?: string[];
  createdAt: string;
  adminApproved?: boolean; // Admin approval for listing
  gracePeriod?: number; // Minutes after slot time to mark as no-show
}

export interface Booking {
  bookingId: string;
  customerId: string;
  salonId: string;
  salonName: string;
  serviceName: string;
  servicePrice: number;
  duration: number;
  bookingDate: string;
  bookingTime: string;
  queuePosition: number;
  status: 'pending_payment' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'no_show';
  bookingStatus: 'pending_payment' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'no_show';
  createdAt: string;
  // Payment Architecture
  advanceAmount: number;
  remainingAmount: number;
  paymentStatus: 'initiated' | 'processing' | 'success' | 'failed' | 'cancelled' | 'refunded' | 'unpaid' | 'partial_paid' | 'paid' | 'pending_verification' | 'verified';
  paymentMethod?: 'razorpay' | 'upi_manual';
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  paymentTimestamp?: string;
  // Manual UPI Verification
  upiTransactionId?: string;
  upiScreenshotUrl?: string;
  verifiedBy?: string;
  verificationTimestamp?: string;
  rejectionReason?: string;
  // QR Verification
  qrToken?: string;
  checkInTime?: string;
  completedAt?: string;
}

export interface PaymentData {
  amount: number;
  currency: string;
  receipt: string;
  notes: {
    salonId: string;
    serviceName: string;
    customerId: string;
  };
}

export interface Review {
  reviewId: string;
  salonId: string;
  customerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
export interface NotificationLog {
  id: string;
  recipient: string;
  type: string;
  channel: 'whatsapp' | 'email' | 'in_app';
  status: 'sent' | 'failed' | 'retrying';
  retryCount: number;
  timestamp: string;
  bookingId?: string;
  error?: string;
}
export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}
