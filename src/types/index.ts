export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'customer' | 'owner' | 'admin';
  createdAt: string;
  profileImage?: string;
  phone?: string;
  favoriteSalons?: string[]; // Array of salonIds
  verifiedOwner?: boolean; // For owner role verification
}

export interface SalonService {
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
  services: SalonService[];
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
}

export interface Booking {
  bookingId: string;
  customerId: string;
  salonId: string;
  service: string;
  slotTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Review {
  reviewId: string;
  salonId: string;
  customerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}