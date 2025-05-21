import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TabNavigation from "@/components/layout/TabNavigation";
import FilterBar from "@/components/housing/FilterBar";
import MapView from "@/components/map/MapView";
import HousingList from "@/components/housing/HousingList";
import HousingDetailModal from "@/components/housing/HousingDetailModal";
import SimpleBookingForm from "@/components/booking/SimpleBookingForm";
import SuccessModal from "@/components/booking/SuccessModal";
import { Housing } from "@/lib/types";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHousingId, setSelectedHousingId] = useState<number | undefined>();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { data: housings, isLoading, refetch } = useQuery<Housing[]>({
    queryKey: ['/api/housings'],
  });

  const handleRefreshMap = () => {
    refetch();
  };

  const handleShowFilters = () => {
    // Placeholder for filter implementation
    console.log("Show filters clicked");
  };

  const handleSelectHousing = (housingId: number) => {
    setSelectedHousingId(housingId);
    setShowDetailModal(true);
  };

  const handleBookNow = () => {
    setShowDetailModal(false);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = () => {
    setShowBookingModal(false);
    setShowSuccessModal(true);
  };

  const selectedHousing = housings?.find(h => h.id === selectedHousingId);

  return (
    <div className="container mx-auto px-4 pb-20">
      <TabNavigation />
      
      <FilterBar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onRefreshMap={handleRefreshMap}
        onShowFilters={handleShowFilters}
      />

      {isLoading ? (
        <div className="bg-gray-200 animate-pulse map-container rounded-lg" />
      ) : (
        <MapView 
          housings={housings || []} 
          onSelectHousing={handleSelectHousing}
          selectedHousingId={selectedHousingId}
        />
      )}

      <HousingList />

      {selectedHousing && (
        <>
          <HousingDetailModal
            show={showDetailModal}
            housing={selectedHousing}
            onClose={() => setShowDetailModal(false)}
            onBookNow={handleBookNow}
          />
          
          <SimpleBookingForm
            show={showBookingModal}
            housing={selectedHousing}
            onClose={() => setShowBookingModal(false)}
            onConfirm={handleConfirmBooking}
          />
          
          <SuccessModal
            show={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
          />
        </>
      )}
    </div>
  );
}
