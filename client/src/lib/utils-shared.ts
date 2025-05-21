/**
 * Utility functions that were originally shared between client and server
 */

/**
 * Generates a random booking number in the format BR-YYYY-XXXX
 * where YYYY is the current year and XXXX is a random 4-digit number
 */
export function generateBookingNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `BR-${year}-${randomNum}`;
}

/**
 * Converts a client-side housing object to match the database schema
 */
export function convertToApiHousing(housing: any) {
  return {
    ...housing,
    amenities: housing.amenities ? housing.amenities.split(',').map((a: string) => a.trim()) : [],
    support: housing.support ? housing.support.split(',').map((s: string) => s.trim()) : []
  };
}

/**
 * Converts a database housing object to match the client-side format
 */
export function convertToClientHousing(housing: any) {
  return {
    ...housing,
    amenities: housing.amenities || [],
    support: housing.support || []
  };
}