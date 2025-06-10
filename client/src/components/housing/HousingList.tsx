import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import HousingCard from "./HousingCard";
import HousingDetailModal from "./HousingDetailModal";
import BookingFormModal from "../booking/RefactoredBookingForm";
import SuccessModal from "../booking/SuccessModal";
import { Housing } from "@/lib/types";

export default function HousingList() {
  const [selectedHousing, setSelectedHousing] = useState<Housing | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingId, setBookingId] = useState<number | undefined>();
  const [bookingNumber, setBookingNumber] = useState<string>("");
  const [accountInfo, setAccountInfo] = useState<{username: string, password: string} | undefined>();

  const { data: housings, isLoading } = useQuery<Housing[]>({
    queryKey: ['/api/housings'],
  });

  const handleHousingClick = (id: number) => {
    if (!housings) return;
    
    const housing = housings.find(h => h.id === id);
    if (housing) {
      setSelectedHousing(housing);
      setShowDetailModal(true);
    }
  };

  const handleBookNow = () => {
    setShowDetailModal(false);
    setShowBookingModal(true);
  };

  // This will be called from the booking form with the booking details
  const handleConfirmBooking = (bookingInfo?: {
    id?: number;
    bookingNumber?: string;
    accountInfo?: {username: string, password: string};
  }) => {
    setShowBookingModal(false);
    
    // Save booking information if provided
    if (bookingInfo) {
      if (bookingInfo.id) setBookingId(bookingInfo.id);
      if (bookingInfo.bookingNumber) setBookingNumber(bookingInfo.bookingNumber);
      if (bookingInfo.accountInfo) setAccountInfo(bookingInfo.accountInfo);
    }
    
    setShowSuccessModal(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="w-full h-40 bg-gray-200 animate-pulse" />
            <div className="p-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="flex justify-between mb-2">
                <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="flex justify-between mt-3">
                <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <h2 className="text-xl font-medium mb-4">Доступное жилье рядом с вами</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {housings?.map((housing) => (
          <HousingCard
            key={housing.id}
            housing={housing}
            onClick={handleHousingClick}
          />
        ))}
      </div>

      {selectedHousing && (
        <>
          <HousingDetailModal
            show={showDetailModal}
            housing={selectedHousing}
            onClose={() => setShowDetailModal(false)}
            onBookNow={handleBookNow}
          />
          
          <BookingFormModal
            show={showBookingModal}
            housing={selectedHousing}
            onClose={() => setShowBookingModal(false)}
            onConfirm={handleConfirmBooking}
          />
          
          <SuccessModal
            show={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            bookingId={bookingId}
            bookingNumber={bookingNumber}
            accountInfo={accountInfo}
          />
        </>
      )}
    </>
  );
}
