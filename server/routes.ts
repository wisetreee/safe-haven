import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { insertBookingSchema, insertMessageSchema, insertUserSchema } from "./schema.js";
import { generateBookingNumber } from "./utils.js";
import { z } from "zod";
import { WebSocketServer } from "ws";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session management
  const MemoryStoreClass = MemoryStore(session);
  app.use(session({
    secret: 'safe-house-secure-app-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    store: new MemoryStoreClass({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));

  // Configure passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy for all users
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        // First try exact username match
        let user = await storage.getUserByUsername(username);
        
        // If not found, try checking if it's a phone number (without user_ prefix)
        if (!user) {
          // Try with prefix
          const phoneUsername = `user_${username.replace(/\D/g, '')}`;
          user = await storage.getUserByUsername(phoneUsername);
          
          // Try without prefix (for backward compatibility)
          if (!user) {
            // Also check if username might be a raw phone number
            const allUsers = await storage.getAllUsers();
            user = allUsers.find(u => {
              // Find user where the phone matches either exactly or just digits
              if (!u.phone) return false;
              const cleanPhone = u.phone.replace(/\D/g, '');
              const cleanInput = username.replace(/\D/g, '');
              return cleanPhone === cleanInput || u.phone === username;
            });
          }
        }
        
        if (!user) {
          return done(null, false, { message: 'Неверное имя пользователя' });
        }
        
        // In a real app, you would use bcrypt to compare passwords
        if (user.password !== password) {
          return done(null, false, { message: 'Неверный пароль' });
        }
        
        // Successfully authenticated
        return done(null, user);
      } catch (error) {
        console.error("Authentication error:", error);
        return done(error);
      }
    }
  ));

  passport.serializeUser((user: any, done) => {
    // Store just the user ID in the session
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(new Error('User not found'), null);
      }
      done(null, user);
    } catch (error) {
      console.error("Session deserialization error:", error);
      done(error, null);
    }
  });

  // Auth middleware for staff routes
  const ensureStaff = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated() && (req.user as any)?.role === 'staff') {
      return next();
    }
    res.status(401).json({ message: 'Доступ запрещен' });
  };
  // Get all housings
  app.get("/api/housings", async (req, res) => {
    try {
      const housings = await storage.getAllHousings();
      res.json(housings);
    } catch (error) {
      console.error("Error fetching housings:", error);
      res.status(500).json({ message: "Не удалось загрузить список жилья" });
    }
  });

  // Get a specific housing by ID
  app.get("/api/housings/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Неверный ID жилья" });
    }

    try {
      const housing = await storage.getHousingById(id);
      if (!housing) {
        return res.status(404).json({ message: "Жилье не найдено" });
      }
      res.json(housing);
    } catch (error) {
      console.error(`Error fetching housing ${id}:`, error);
      res.status(500).json({ message: "Не удалось загрузить данные о жилье" });
    }
  });

  // Get bookings based on user role
  app.get("/api/bookings", async (req, res) => {
    try {
      // If not authenticated, return empty array
      if (!req.isAuthenticated()) {
        return res.json([]);
      }
      
      const user = req.user as any;
      let bookings;
      
      // Staff can see all bookings
      if (user.role === 'staff') {
        bookings = await storage.getAllBookings();
      } else {
        // Regular users can only see their own bookings
        bookings = await storage.getBookingsByUserId(user.id);
      }
      
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Не удалось загрузить список бронирований" });
    }
  });
  
  // Check booking status by booking number and phone
  app.get("/api/bookings/check", async (req, res) => {
    const { bookingNumber, phone } = req.query;
    
    if (!bookingNumber || !phone) {
      return res.status(400).json({ message: "Укажите номер бронирования и телефон" });
    }
    
    try {
      const bookings = await storage.getAllBookings();
      const booking = bookings.find(b => 
        b.bookingNumber === bookingNumber && 
        b.guestPhone === phone
      );
      
      if (!booking) {
        return res.status(404).json({ message: "Бронирование не найдено" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error checking booking:", error);
      res.status(500).json({ message: "Не удалось проверить бронирование" });
    }
  });

  // Register a new user (for guest registration)
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, name, phone, role } = req.body;
      
      // Check if username is taken
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Имя пользователя уже занято" });
      }
      
      // Create the user
      const user = await storage.createUser({
        username,
        password,
        name,
        role: role || "user",
        phone,
      });
      
      // For security, don't return the password
      const { password: _, ...userWithoutPassword } = user;
      
      // Login the user automatically
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Ошибка автоматического входа" });
        }
        
        return res.status(201).json({ user: userWithoutPassword });
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Не удалось зарегистрировать пользователя" });
    }
  });

  // Create a new booking
  app.post("/api/bookings", async (req, res) => {
    try {
      // We need to handle userId specially since it comes separately
      const { userId, ...bookingData } = req.body;
      
      // Validate booking data without userId
      const validatedData = insertBookingSchema.parse(bookingData);
      
      // Generate a booking number
      const bookingNumber = generateBookingNumber();
      
      // Determine the userId for this booking
      let finalUserId = null;
      if (req.isAuthenticated()) {
        // If user is logged in, use their ID
        finalUserId = (req.user as any).id;
      } else if (userId && typeof userId === 'number') {
        // If user just registered and provided a userId
        finalUserId = userId;
      } else {
        // If no userId, create a user account based on their info
        // Generate a more unique username with random component
        const random = Math.floor(10000 + Math.random() * 90000); // 5-digit random number
        const username = `id${random}`;
        // Using the first few characters of the name plus the last 4 digits of phone as password
        const cleanPhone = validatedData.guestPhone.replace(/\D/g, '');
        const namePart = validatedData.guestName.slice(0, 3).toLowerCase();
        const phonePart = cleanPhone.slice(-4) || '1234'; // Default if phone is too short
        const password = `${namePart}${phonePart}`;
        
        // Check if username already exists
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser) {
          // If user already exists, use their account
          finalUserId = existingUser.id;
        } else {
          // Create new user account
          const tempUser = await storage.createUser({
            username: username,
            password: password, 
            name: validatedData.guestName,
            role: "user",
            phone: validatedData.guestPhone,
          });
          
          finalUserId = tempUser.id;
          
          // Store the credentials in the response so we can show them to the user
          res.locals.newAccount = {
            username: username,
            password: password
          };
        }
      }
      
      // Add booking to storage with userId
      const booking = await storage.createBooking({
        ...validatedData,
        bookingNumber,
        bookingDate: new Date().toISOString(), // Set booking date to current time
        status: "pending", // All bookings start as pending
        userId: finalUserId, // Always include a userId now
      });
      
      // Prepare response with booking info
      const response: any = {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        status: booking.status
      };
      
      // If we created a new account for this booking, include the credentials
      if (res.locals.newAccount) {
        response.account = res.locals.newAccount;
      }
      
      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating booking:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Данные бронирования некорректны", errors: error.errors });
      }
      
      res.status(500).json({ message: "Не удалось создать бронирование" });
    }
  });

  // Cancel a booking
  app.post("/api/bookings/:id/cancel", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Неверный ID бронирования" });
    }

    try {
      const booking = await storage.getBookingById(id);
      if (!booking) {
        return res.status(404).json({ message: "Бронирование не найдено" });
      }

      if (booking.status === "cancelled") {
        return res.status(400).json({ message: "Бронирование уже отменено" });
      }

      await storage.updateBookingStatus(id, "cancelled");
      
      // Add system message about cancellation
      await storage.createMessage({
        bookingId: id,
        senderId: 0,
        senderName: "Система",
        senderRole: "user",
        content: "Бронирование было отменено пользователем",
      });
      
      res.status(200).json({ message: "Бронирование успешно отменено" });
    } catch (error) {
      console.error(`Error cancelling booking ${id}:`, error);
      res.status(500).json({ message: "Не удалось отменить бронирование" });
    }
  });

  // Auth routes
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: any, info: { message: string }) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Внутренняя ошибка сервера" });
      }
      
      if (!user) {
        console.log("Login failed:", info);
        return res.status(401).json({ message: info?.message || "Неверные учетные данные" });
      }
      
      req.logIn(user, (err: Error | null) => {
        if (err) {
          console.error("Session login error:", err);
          return res.status(500).json({ message: "Ошибка при создании сессии" });
        }
        
        // Return user info without sensitive data
        const { password, ...userWithoutPassword } = user;
        return res.json({ user: userWithoutPassword });
      });
    })(req, res, next);
  });

  app.get("/api/auth/current-user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Не авторизован" });
    }
    
    const { password, ...userWithoutPassword } = req.user as any;
    res.json({ user: userWithoutPassword });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Ошибка при выходе" });
      }
      res.json({ message: "Успешный выход" });
    });
  });

  // Staff routes (protected)
  app.get("/api/staff/bookings", ensureStaff, async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching staff bookings:", error);
      res.status(500).json({ message: "Не удалось загрузить список бронирований" });
    }
  });

  app.post("/api/bookings/:id/confirm", ensureStaff, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Неверный ID бронирования" });
    }

    try {
      const booking = await storage.getBookingById(id);
      if (!booking) {
        return res.status(404).json({ message: "Бронирование не найдено" });
      }

      if (booking.status !== "pending") {
        return res.status(400).json({ 
          message: booking.status === "confirmed" 
            ? "Бронирование уже подтверждено" 
            : "Невозможно подтвердить отмененное бронирование" 
        });
      }

      await storage.updateBookingStatus(id, "confirmed");
      
      // Add an automatic system message about confirmation
      await storage.createMessage({
        bookingId: id,
        senderId: (req.user as any).id,
        senderName: "Система",
        senderRole: "staff",
        content: "Бронирование было подтверждено сотрудником " + (req.user as any).name,
      });
      
      res.status(200).json({ message: "Бронирование успешно подтверждено" });
    } catch (error) {
      console.error(`Error confirming booking ${id}:`, error);
      res.status(500).json({ message: "Не удалось подтвердить бронирование" });
    }
  });
  
  // Add route for rejecting bookings
  app.post("/api/bookings/:id/reject", ensureStaff, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Неверный ID бронирования" });
    }
    
    const { reason } = req.body;

    try {
      const booking = await storage.getBookingById(id);
      if (!booking) {
        return res.status(404).json({ message: "Бронирование не найдено" });
      }

      if (booking.status === "cancelled") {
        return res.status(400).json({ message: "Бронирование уже отменено" });
      }

      await storage.updateBookingStatus(id, "cancelled");
      
      // Add an automatic system message about rejection
      await storage.createMessage({
        bookingId: id,
        senderId: (req.user as any).id,
        senderName: "Система",
        senderRole: "staff",
        content: `Бронирование было отклонено сотрудником ${(req.user as any).name}${reason ? `. Причина: ${reason}` : ''}`,
      });
      
      res.status(200).json({ message: "Бронирование успешно отклонено" });
    } catch (error) {
      console.error(`Error rejecting booking ${id}:`, error);
      res.status(500).json({ message: "Не удалось отклонить бронирование" });
    }
  });

  // Chat/Messages routes
  app.get("/api/bookings/:id/messages", async (req, res) => {
    const bookingId = parseInt(req.params.id);
    if (isNaN(bookingId)) {
      return res.status(400).json({ message: "Неверный ID бронирования" });
    }

    try {
      const booking = await storage.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Бронирование не найдено" });
      }

      // If it's a staff member, they can access any booking's messages
      // If it's a non-authenticated user, they would need to provide additional
      // validation (e.g., booking number) - this is simplified for the example
      const messages = await storage.getMessagesByBookingId(bookingId);
      
      // Mark messages as read based on who's viewing
      const viewerRole = req.isAuthenticated() && (req.user as any)?.role === 'staff' 
        ? 'staff' 
        : 'user';
      await storage.markMessagesAsRead(bookingId, viewerRole);
      
      res.json(messages);
    } catch (error) {
      console.error(`Error fetching messages for booking ${bookingId}:`, error);
      res.status(500).json({ message: "Не удалось загрузить сообщения" });
    }
  });

  app.post("/api/bookings/:id/messages", async (req, res) => {
    const bookingId = parseInt(req.params.id);
    if (isNaN(bookingId)) {
      return res.status(400).json({ message: "Неверный ID бронирования" });
    }

    try {
      const booking = await storage.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Бронирование не найдено" });
      }

      // Determine sender based on authentication
      let senderId = 0;
      let senderName = req.body.senderName || booking.guestName;
      let senderRole = 'user';
      
      if (req.isAuthenticated()) {
        const user = req.user as any;
        senderId = user.id;
        senderName = user.name;
        senderRole = user.role;
      }

      // Validate and create message
      const messageData = {
        bookingId,
        senderId,
        senderName,
        senderRole,
        content: req.body.content,
      };
      
      const validatedData = insertMessageSchema.parse(messageData);
      const message = await storage.createMessage(validatedData);
      
      res.status(201).json(message);
    } catch (error) {
      console.error(`Error sending message for booking ${bookingId}:`, error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Данные сообщения некорректны", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Не удалось отправить сообщение" });
    }
  });

  // Setup WebSockets for real-time chat (temporarily disabled)
  /*
  const wss = new WebSocketServer({ server: httpServer });
  
  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      try {
        // Parse the message (should contain bookingId)
        const data = JSON.parse(message.toString());
        
        // Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === 1) {
            client.send(JSON.stringify(data));
          }
        });
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
  });
  */
  
  const httpServer = createServer(app);
  return httpServer;
}
