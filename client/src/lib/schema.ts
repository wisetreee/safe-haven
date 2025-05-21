// Client copy of the shared schema
// This file contains the database schema definitions that are needed by the client

import { createInsertSchema } from "drizzle-zod";
import { 
  pgTable, 
  serial, 
  text, 
  varchar, 
  timestamp, 
  integer, 
  boolean
} from "drizzle-orm/pg-core";
import { z } from "zod";

// User-related schemas
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default('user'),
  password: varchar("password", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  name: true,
  role: true,
  password: true,
  phone: true,
  email: true
});

// Housing-related schemas
export const housings = pgTable("housings", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  imageUrl: varchar("image_url", { length: 255 }).notNull(),
  images: text("images").array(),
  location: varchar("location", { length: 255 }).notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  distance: integer("distance").notNull(),
  rooms: integer("rooms").notNull(),
  capacity: integer("capacity").notNull(),
  availability: varchar("availability", { length: 50 }).notNull().default('available'),
  availableFrom: varchar("available_from", { length: 50 }).notNull(),
  amenities: text("amenities").array(),
  support: text("support").array(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertHousingSchema = createInsertSchema(housings).omit({
  id: true,
  createdAt: true
});

// Booking-related schemas
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  housingId: integer("housing_id").references(() => housings.id).notNull(),
  housingName: varchar("housing_name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  checkIn: varchar("check_in", { length: 50 }).notNull(),
  checkOut: varchar("check_out", { length: 50 }).notNull(),
  bookingDate: timestamp("booking_date").defaultNow(),
  bookingNumber: varchar("booking_number", { length: 50 }).notNull().unique(),
  status: varchar("status", { length: 50 }).notNull().default('pending'),
  guestName: varchar("guest_name", { length: 255 }).notNull(),
  guestPhone: varchar("guest_phone", { length: 50 }).notNull(),
  guestCount: integer("guest_count").notNull(),
  specialNeeds: text("special_needs"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  bookingDate: true,
  bookingNumber: true,
  createdAt: true
});

// Message-related schemas
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  senderId: integer("sender_id").notNull(),
  senderName: varchar("sender_name", { length: 255 }).notNull(),
  senderRole: varchar("sender_role", { length: 50 }).notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  isRead: boolean("is_read").default(false)
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true
});

// Typescript types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertHousing = z.infer<typeof insertHousingSchema>;
export type Housing = typeof housings.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;