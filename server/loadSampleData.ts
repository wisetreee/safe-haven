import { storage } from "./storage";
import { SAMPLE_HOUSINGS, SAMPLE_BOOKINGS } from "../client/src/lib/constants";

/**
 * Script to load sample data into the database
 */
async function loadSampleData() {
  console.log("Loading sample data into the database...");
  
  try {
    // First create a staff user
    console.log("Creating staff user...");
    try {
      await storage.createUser({
        username: "admin",
        password: "password123",
        name: "Admin User",
        role: "staff",
        phone: "+7 (999) 123-4567",
        email: "admin@saferefuge.ru"
      });
      console.log("Staff user created successfully");
    } catch (error) {
      console.log("Staff user may already exist, continuing...");
    }

    // Load housing data
    console.log("Loading sample housing data...");
    const existingHousings = await storage.getAllHousings();
    
    for (const housing of SAMPLE_HOUSINGS) {
      // Skip if housing with this name already exists (checking by name since IDs might be different in DB)
      if (existingHousings.some(h => h.name === housing.name)) {
        console.log(`Housing "${housing.name}" already exists, skipping...`);
        continue;
      }
      
      // Add housing to storage
      await storage.createHousing({
        name: housing.name,
        description: housing.description,
        imageUrl: housing.imageUrl,
        images: housing.images || [],
        location: housing.location,
        latitude: String(housing.latitude),
        longitude: String(housing.longitude),
        distance: String(housing.distance),
        rooms: housing.rooms,
        capacity: housing.capacity,
        availability: housing.availability,
        availableFrom: housing.availableFrom,
        amenities: housing.amenities || [],
        support: housing.support || [],
      });
      
      console.log(`Added housing: ${housing.name}`);
    }

    // Load sample bookings
    console.log("Loading sample booking data...");
    const existingBookings = await storage.getAllBookings();
    
    for (const booking of SAMPLE_BOOKINGS) {
      // Skip if booking with this booking number already exists
      if (existingBookings.some(b => b.bookingNumber === booking.bookingNumber)) {
        console.log(`Booking with number ${booking.bookingNumber} already exists, skipping...`);
        continue;
      }

      // Get the housing (needed for creating the booking)
      const housings = await storage.getAllHousings();
      const housing = housings.find(h => h.name === booking.housingName) || housings[0];
      
      if (!housing) {
        console.log(`No housing found for booking ${booking.bookingNumber}, skipping...`);
        continue;
      }
      
      // Add booking to storage
      await storage.createBooking({
        userId: booking.userId,
        housingId: housing.id,
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
        specialNeeds: booking.specialNeeds
      });
      
      console.log(`Added booking: ${booking.bookingNumber} for ${booking.guestName}`);
    }
    
    console.log("Sample data loaded successfully!");
  } catch (error) {
    console.error("Error loading sample data:", error);
  }
}

// Run the function
loadSampleData();