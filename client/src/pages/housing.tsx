import TabNavigation from "@/components/layout/TabNavigation";
import HousingList from "@/components/housing/HousingList";
import FilterBar from "@/components/housing/FilterBar";
import MapView from "@/components/map/MapView";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Housing } from "@/lib/types";

export default function HousingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  
  const { data: housings } = useQuery<Housing[]>({
    queryKey: ['/api/housings'],
  });
  
  const handleRefreshMap = () => {
    console.log("Refresh housing list");
  };

  const handleShowFilters = () => {
    console.log("Show filters clicked");
  };
  
  const handleToggleView = () => {
    setViewMode(prev => prev === "list" ? "map" : "list");
  };

  return (
    <div className="container mx-auto px-4 pb-20">
      <TabNavigation />
      
      <FilterBar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onRefreshMap={handleRefreshMap}
        onShowFilters={handleShowFilters}
      />
      
      <div className="flex justify-end mb-4">
        <button 
          className="px-4 py-2 bg-accent text-white rounded-lg flex items-center"
          onClick={handleToggleView}
        >
          {viewMode === "list" ? "Показать карту" : "Показать список"}
        </button>
      </div>
      
      {viewMode === "list" ? (
        <HousingList />
      ) : (
        housings && <MapView 
          housings={housings} 
          onSelectHousing={() => {}}
          selectedHousingId={undefined}
        />
      )}
    </div>
  );
}
