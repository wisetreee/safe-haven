/**
 * Utility functions for the application
 */

/**
 * Generates a random booking number in the format BR-YYYY-XXXX
 * where YYYY is the current year and XXXX is a random 4-digit number
 */
export function generateBookingNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `BR-${year}-${randomNum}`;
}

/**
 * Converts a client-side housing object to match the database schema
 */
export function convertToApiHousing(housing: any) {
  return {
    ...housing,
    latitude: String(housing.latitude),
    longitude: String(housing.longitude), 
    distance: String(housing.distance),
    images: housing.images || null,
    amenities: housing.amenities || null,
    support: housing.support || null
  };
}

/**
 * Converts a database housing object to match the client-side format
 */
export function convertToClientHousing(housing: any) {
  return {
    ...housing,
    latitude: parseFloat(housing.latitude),
    longitude: parseFloat(housing.longitude),
    distance: parseFloat(housing.distance)
  };
}