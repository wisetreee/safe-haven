import { storage } from "../server/storage";
import { SAMPLE_HOUSINGS } from "../client/src/lib/constants";

/**
 * Script to load sample housing data into the database
 */
async function loadSampleData() {
  console.log("Loading sample housing data into the database...");
  
  try {
    // First get all existing housings to avoid duplicates
    const existingHousings = await storage.getAllHousings();
    
    for (const housing of SAMPLE_HOUSINGS) {
      // Skip if housing with this ID already exists
      if (existingHousings.some(h => h.id === housing.id)) {
        console.log(`Housing with ID ${housing.id} already exists, skipping...`);
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
    
    console.log("Sample data loaded successfully!");
  } catch (error) {
    console.error("Error loading sample data:", error);
  }
}

// Run the function
loadSampleData();