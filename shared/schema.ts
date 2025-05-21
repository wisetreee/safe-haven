import { pgTable, text, serial, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the users table with role for staff accounts
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"), // "user" or "staff"
  phone: text("phone"),
  email: text("email"), // Keep it but make it optional
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
  phone: true,
  email: true,
});

// Define housings table
export const housings = pgTable("housings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  images: text("images").array(),
  location: text("location").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  distance: text("distance").notNull().default("5"), // Temporarily constant value in km
  rooms: integer("rooms").notNull(),
  capacity: integer("capacity").notNull(),
  availability: text("availability").notNull(), // "available", "limited", "unavailable"
  availableFrom: text("available_from").notNull(),
  amenities: text("amenities").array(),
  support: text("support").array(),
});

export const insertHousingSchema = createInsertSchema(housings).omit({
  id: true,
});

// Define bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // Can be null for anonymous bookings
  housingId: integer("housing_id").notNull(),
  housingName: text("housing_name").notNull(),
  location: text("location").notNull(),
  checkIn: text("check_in").notNull(), // Changed from date to text to match client-side
  checkOut: text("check_out").notNull(), // Changed from date to text to match client-side
  bookingDate: text("booking_date").notNull(), // Changed from timestamp to text to match client-side
  bookingNumber: text("booking_number").notNull(),
  status: text("status").notNull(), // "pending", "confirmed", "cancelled"
  guestName: text("guest_name").notNull(),
  guestPhone: text("guest_phone").notNull(),
  guestCount: integer("guest_count").notNull(),
  specialNeeds: text("special_needs"),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  bookingDate: true,
  bookingNumber: true,
});

// Define messages table for chat
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  senderId: integer("sender_id").notNull().default(0), // will use 0 for anonymous/guest users
  senderName: text("sender_name").notNull(),
  senderRole: text("sender_role").notNull(), // "user" or "staff"
  content: text("content").notNull(),
  timestamp: text("timestamp").notNull(),
  isRead: boolean("is_read").notNull().default(false),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertHousing = z.infer<typeof insertHousingSchema>;
export type Housing = typeof housings.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
