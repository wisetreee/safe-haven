// Housing types
export type AvailabilityStatus = "available" | "limited" | "unavailable";

export interface Housing {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  images?: string[];
  location: string;
  latitude: number;
  longitude: number;
  distance: number;
  rooms: number;
  capacity: number;
  availability: AvailabilityStatus;
  availableFrom: string;
  amenities?: string[];
  support?: string[];
}

// Booking types
export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface Booking {
  id: number;
  userId?: number;  // Link to user account
  housingId: number;
  housingName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  bookingDate: string;
  bookingNumber: string;
  status: BookingStatus;
  guestName: string;
  guestPhone: string;
  guestCount: number;
  specialNeeds?: string;
}

// API request/response types
export interface BookingRequest {
  housingId: number;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestPhone: string;
  guestCount: number;
  specialNeeds?: string;
  userId?: number;
}

export interface BookingResponse {
  id: number;
  bookingNumber: string;
  status: BookingStatus;
}

// User types
export type UserRole = "user" | "staff";

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  phone?: string;
  email?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}

// Chat types
export interface Message {
  id: number;
  bookingId: number;
  senderId: number;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface SendMessageRequest {
  bookingId: number;
  senderId: number;
  senderName: string;
  senderRole: UserRole;
  content: string;
}
