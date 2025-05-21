import { 
  users, User, InsertUser, 
  housings, Housing, InsertHousing,
  bookings, Booking, InsertBooking,
  messages, Message, InsertMessage
} from "./schema";
import { IStorage } from "./storage";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllHousings(): Promise<Housing[]> {
    return await db.select().from(housings);
  }

  async getHousingById(id: number): Promise<Housing | undefined> {
    const [housing] = await db.select().from(housings).where(eq(housings.id, id));
    return housing || undefined;
  }

  async createHousing(insertHousing: InsertHousing): Promise<Housing> {
    const [housing] = await db
      .insert(housings)
      .values(insertHousing)
      .returning();
    return housing;
  }

  async updateHousingAvailability(id: number, availability: string): Promise<Housing | undefined> {
    const [housing] = await db
      .update(housings)
      .set({ availability })
      .where(eq(housings.id, id))
      .returning();
    return housing || undefined;
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings);
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getBookingsByUserId(userId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async createBooking(booking: any): Promise<Booking> {
    const [newBooking] = await db
      .insert(bookings)
      .values(booking)
      .returning();
    return newBooking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const [booking] = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return booking || undefined;
  }

  async getMessagesByBookingId(bookingId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.bookingId, bookingId));
  }

  async createMessage(message: Omit<InsertMessage, "timestamp">): Promise<Message> {
    const newMessage = {
      ...message,
      timestamp: new Date().toISOString(),
    };
    
    const [createdMessage] = await db
      .insert(messages)
      .values(newMessage)
      .returning();
    return createdMessage;
  }

  async markMessagesAsRead(bookingId: number, recipientRole: string): Promise<void> {
    // Mark messages as read where the booking ID matches and the sender is not of the specified role
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.bookingId, bookingId),
          eq(messages.senderRole, recipientRole === 'staff' ? 'user' : 'staff')
        )
      );
  }
}