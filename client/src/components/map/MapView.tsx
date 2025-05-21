import { useState, useEffect, useRef } from "react";
import { Housing } from "@/lib/types";
import { MapPin, Map, CheckCircle, AlertCircle, XCircle } from "lucide-react";

// Default center for Moscow
const DEFAULT_LATITUDE = 55.7558;
const DEFAULT_LONGITUDE = 37.6176;

interface MapViewProps {
  housings: Housing[];
  onSelectHousing: (housingId: number) => void;
  selectedHousingId?: number;
}

export default function MapView({ housings, onSelectHousing, selectedHousingId }: MapViewProps) {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number}>({
    lat: DEFAULT_LATITUDE,
    lng: DEFAULT_LONGITUDE
  });
  const [selectedHousing, setSelectedHousing] = useState<Housing | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Try to get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          console.log("Геолокация не доступна, используем стандартное расположение");
        }
      );
    }
  }, []);

  // Update selected housing when selectedHousingId changes
  useEffect(() => {
    if (selectedHousingId) {
      const housing = housings.find(h => h.id === selectedHousingId);
      if (housing) {
        setSelectedHousing(housing);
        
        // Scroll the corresponding housing card into view
        const housingElement = document.getElementById(`housing-${housing.id}`);
        if (housingElement) {
          housingElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    } else {
      setSelectedHousing(null);
    }
  }, [selectedHousingId, housings]);
  
  // Function to generate OpenStreetMap URL with markers
  const getOpenStreetMapUrl = () => {
    // Use user's location if available, otherwise use Moscow
    const centerLat = userLocation ? userLocation.lat : DEFAULT_LATITUDE;
    const centerLon = userLocation ? userLocation.lng : DEFAULT_LONGITUDE;
    
    // Create a very tight bounding box (about 5-8km radius)
    // This will show only the city center area
    const latSpan = 0.05; // Approximately 5-6km north-south
    const lonSpan = 0.08; // Approximately 5-6km east-west
    
    const minLat = centerLat - latSpan;
    const maxLat = centerLat + latSpan;
    const minLon = centerLon - lonSpan;
    const maxLon = centerLon + lonSpan;
    
    // Add marker for each housing location
    const markerParams = housings.map(housing => 
      `&marker=${housing.latitude},${housing.longitude}`
    ).join('');
    
    // Higher zoom level with tighter bounds
    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik${markerParams}`;
  };
  
  // Function to get availability icon
  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'limited':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };
  
  // Function to get availability text
  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'Доступно';
      case 'limited':
        return 'Мало мест';
      default:
        return 'Нет мест';
    }
  };
  
  // Function to get availability class
  const getAvailabilityClass = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-500';
      case 'limited':
        return 'bg-amber-500';
      default:
        return 'bg-red-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* OpenStreetMap */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Карта доступного жилья</h3>
          <Map className="h-5 w-5 text-secondary" />
        </div>
        
        <div className="relative bg-blue-50 rounded-xl overflow-hidden">
          {/* OpenStreetMap iframe */}
          <div className="map-container w-full h-full">
            <iframe 
              ref={iframeRef}
              src={getOpenStreetMapUrl()}
              className="w-full h-[500px] md:h-[600px] rounded-lg border-0"
              style={{ display: 'block' }}
              title="Карта доступного жилья" 
              allowFullScreen
            ></iframe>
          </div>
          
          {/* Housing Markers Overlay */}
          <div className="absolute top-3 left-3 z-10 bg-white p-3 rounded-lg shadow-md max-w-xs">
            <h4 className="font-medium text-sm mb-2">Жилье на карте:</h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {housings.map(housing => (
                <div 
                  key={housing.id}
                  className={`p-2 rounded cursor-pointer flex items-center ${
                    selectedHousingId === housing.id 
                      ? 'bg-accent text-white' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => onSelectHousing(housing.id)}
                >
                  <div className={`w-3 h-3 rounded-full mr-2 ${getAvailabilityClass(housing.availability)}`}></div>
                  <div className="text-xs font-medium truncate">{housing.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-3 gap-2 text-sm mt-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Доступно</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span>Мало мест</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Нет мест</span>
          </div>
        </div>
      </div>
      
      {/* Housing List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-white rounded-lg shadow-sm">
        <h3 className="col-span-full text-lg font-medium mb-2">Доступные места</h3>
        {housings.map(housing => (
          <div 
            key={housing.id}
            id={`housing-${housing.id}`}
            className={`p-3 rounded-lg cursor-pointer transition-colors border ${
              selectedHousingId === housing.id 
                ? 'bg-accent text-white border-accent' 
                : `bg-gray-50 hover:bg-gray-100 border-gray-200 ${
                    housing.availability === 'available' 
                      ? 'hover:border-green-300' 
                      : housing.availability === 'limited' 
                        ? 'hover:border-amber-300' 
                        : 'hover:border-red-300'
                  }`
            }`}
            onClick={() => onSelectHousing(housing.id)}
          >
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mt-0.5 mr-1.5 flex-shrink-0" />
              <div>
                <div className="font-medium mb-1">{housing.name}</div>
                <div className="text-sm">{housing.location}</div>
                <div className="text-sm mt-1">{housing.distance} км</div>
                <div className="flex items-center mt-2">
                  {getAvailabilityIcon(housing.availability)}
                  <span className="text-xs ml-1.5">
                    {getAvailabilityText(housing.availability)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}