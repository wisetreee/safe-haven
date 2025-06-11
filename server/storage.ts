import { 
  users, User, InsertUser, 
  housings, Housing, InsertHousing,
  bookings, Booking, InsertBooking,
  messages, Message, InsertMessage
} from "@shared/schema";
import { SAMPLE_HOUSINGS, SAMPLE_BOOKINGS } from "./constants.js";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// Convert client-side types to match database schema types
function convertHousing(housing: any): Housing {
  return {
    id: housing.id,
    name: housing.name,
    description: housing.description,
    imageUrl: housing.imageUrl,
    location: housing.location,
    latitude: String(housing.latitude), 
    longitude: String(housing.longitude),
    distance: String(housing.distance),
    rooms: housing.rooms,
    capacity: housing.capacity,
    availability: housing.availability,
    availableFrom: housing.availableFrom,
    images: housing.images || null,
    amenities: housing.amenities || null,
    support: housing.support || null
  };
}

// Convert client-side booking to match database schema
function convertBooking(booking: any): Booking {
  return {
    id: booking.id,
    userId: booking.userId || null,
    housingId: booking.housingId,
    housingName: booking.housingName,
    location: booking.location,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    bookingDate: booking.bookingDate,
    bookingNumber: booking.bookingNumber,
    status: booking.status,
    guestName: booking.guestName,
    guestPhone: booking.guestPhone,
    guestCount: booking.guestCount,
    specialNeeds: booking.specialNeeds || null
  };
}

// Define the storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  
  // Housing methods
  getAllHousings(): Promise<Housing[]>;
  getHousingById(id: number): Promise<Housing | undefined>;
  createHousing(housing: InsertHousing): Promise<Housing>;
  updateHousingAvailability(id: number, availability: string): Promise<Housing | undefined>;
  
  // Booking methods
  getAllBookings(): Promise<Booking[]>;
  getBookingById(id: number): Promise<Booking | undefined>;
  getBookingsByUserId(userId: number): Promise<Booking[]>;
  createBooking(booking: any): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  
  // Message methods
  getMessagesByBookingId(bookingId: number): Promise<Message[]>;
  createMessage(message: Omit<InsertMessage, "timestamp">): Promise<Message>;
  markMessagesAsRead(bookingId: number, recipientRole: string): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private housings: Map<number, Housing>;
  private bookings: Map<number, Booking>;
  private messages: Map<number, Message>;
  
  currentUserId: number;
  currentHousingId: number;
  currentBookingId: number;
  currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.housings = new Map();
    this.bookings = new Map();
    this.messages = new Map();
    
    this.currentUserId = 1;
    this.currentHousingId = 1;
    this.currentBookingId = 1;
    this.currentMessageId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add sample staff user
    const staffUser: User = {
      id: this.currentUserId++,
      username: "staff",
      password: "password123", // In a real app, this would be hashed
      name: "Сотрудник поддержки",
      role: "staff",
      phone: "+7 (XXX) XXX-XX-XX",
      email: "staff@example.com"
    };
    this.users.set(staffUser.id, staffUser);

    // Add sample housings
    SAMPLE_HOUSINGS.forEach(housing => {
      this.housings.set(housing.id, convertHousing({
        ...housing,
        id: this.currentHousingId++
      }));
    });
    
    // Add sample bookings
    SAMPLE_BOOKINGS.forEach(booking => {
      this.bookings.set(booking.id, {
        ...booking,
        id: this.currentBookingId++,
        userId: booking.userId || 1, // Link to staff user as default
        specialNeeds: booking.specialNeeds || null
      });
    });
    
    // Add sample messages for the first booking
    if (this.bookings.size > 0) {
      const firstBooking = this.bookings.get(1);
      if (firstBooking) {
        // Sample message from user
        this.messages.set(this.currentMessageId++, {
          id: 1,
          bookingId: firstBooking.id,
          senderId: 0, // Using 0 for guest/anonymous users
          senderName: firstBooking.guestName,
          senderRole: "user",
          content: "Здравствуйте! Мне нужна дополнительная информация о бронировании.",
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          isRead: true
        });
        
        // Sample response from staff
        this.messages.set(this.currentMessageId++, {
          id: 2,
          bookingId: firstBooking.id,
          senderId: staffUser.id,
          senderName: staffUser.name,
          senderRole: "staff",
          content: "Добрый день! Чем я могу вам помочь?",
          timestamp: new Date(Date.now() - 82800000).toISOString(), // 23 hours ago
          isRead: true
        });
      }
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "user", 
      phone: insertUser.phone || null,
      email: insertUser.email || null
    };
    this.users.set(id, user);
    return user;
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Housing methods
  async getAllHousings(): Promise<Housing[]> {
    return Array.from(this.housings.values());
  }
  
  async getHousingById(id: number): Promise<Housing | undefined> {
    return this.housings.get(id);
  }
  
  async createHousing(insertHousing: InsertHousing): Promise<Housing> {
    const id = this.currentHousingId++;
    const housing = convertHousing({ ...insertHousing, id });
    this.housings.set(id, housing);
    return housing;
  }
  
  async updateHousingAvailability(id: number, availability: string): Promise<Housing | undefined> {
    const housing = this.housings.get(id);
    if (!housing) return undefined;
    
    const updatedHousing = convertHousing({ ...housing, availability });
    this.housings.set(id, updatedHousing);
    return updatedHousing;
  }
  
  // Booking methods
  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }
  
  async getBookingById(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }
  
  async getBookingsByUserId(userId: number): Promise<Booking[]> {
    // Filter bookings by userId
    return Array.from(this.bookings.values())
      .filter(booking => booking.userId === userId);
  }
  
  async createBooking(booking: any): Promise<Booking> {
    const id = this.currentBookingId++;
    const now = new Date();
    
    const newBooking = convertBooking({
      ...booking,
      id,
      userId: booking.userId || null, // Include userId if provided
      bookingDate: now.toISOString()
    });
    
    this.bookings.set(id, newBooking);
    
    // Update housing availability if needed
    const housing = this.housings.get(booking.housingId);
    if (housing && housing.availability === "available") {
      await this.updateHousingAvailability(booking.housingId, "limited");
    }
    
    return newBooking;
  }
  
  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = convertBooking({ 
      ...booking, 
      status
    });
    this.bookings.set(id, updatedBooking);
    
    // If booking is cancelled, update housing availability
    if (status === "cancelled") {
      const housing = this.housings.get(booking.housingId);
      if (housing && housing.availability === "limited") {
        await this.updateHousingAvailability(booking.housingId, "available");
      }
    }
    
    return updatedBooking;
  }
  
  // Message methods
  async getMessagesByBookingId(bookingId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.bookingId === bookingId)
      .sort((a, b) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
  }
  
  async createMessage(message: Omit<InsertMessage, "timestamp">): Promise<Message> {
    const id = this.currentMessageId++;
    const now = new Date();
    
    const newMessage: Message = {
      ...message,
      id,
      senderId: message.senderId ?? 0, // Use 0 for anonymous users
      timestamp: now.toISOString(),
      isRead: false
    };
    
    this.messages.set(id, newMessage);
    return newMessage;
  }
  
  async markMessagesAsRead(bookingId: number, recipientRole: string): Promise<void> {
    // Find all messages for this booking where the recipient role matches
    // (i.e., if staff is viewing, mark user messages as read)
    const messages = Array.from(this.messages.values())
      .filter(message => 
        message.bookingId === bookingId && 
        message.senderRole !== recipientRole
      );
    
    // Mark them as read
    for (const message of messages) {
      this.messages.set(message.id, { ...message, isRead: true });
    }
  }
}

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

export const storage = new DatabaseStorage();
