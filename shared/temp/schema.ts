import { pgTable, text, serial, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the users table (keeping the existing one)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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
  distance: text("distance").notNull(), // in km
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

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertHousing = z.infer<typeof insertHousingSchema>;
export type Housing = typeof housings.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
