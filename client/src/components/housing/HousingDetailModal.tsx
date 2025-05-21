import { useState } from "react";
import { X, MapPin, Bed, Users, Clock, Wifi, Utensils, Bath, Shirt, Lock, Baby } from "lucide-react";
import { Housing } from "@/lib/types";

interface HousingDetailModalProps {
  show: boolean;
  housing: Housing;
  onClose: () => void;
  onBookNow: () => void;
}

export default function HousingDetailModal({ show, housing, onClose, onBookNow }: HousingDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-medium">{housing.name}</h2>
          <button 
            className="text-gray-500 hover:text-gray-700" 
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          {/* Image carousel */}
          <div className="relative mb-4">
            <img 
              src={housing.imageUrl} 
              alt={housing.name} 
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute bottom-4 right-4 flex space-x-1">
              {housing.images?.map((_, index) => (
                <button 
                  key={index}
                  className={`w-2 h-2 rounded-full bg-white ${index === currentImageIndex ? 'opacity-100' : 'opacity-75'}`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          </div>
          
          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="font-medium mb-1">Местоположение</h3>
              <p className="text-sm text-secondary">{housing.location}, {housing.distance} км от вас</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="font-medium mb-1">Вместимость</h3>
              <p className="text-sm text-secondary">{housing.rooms} комнат, до {housing.capacity} человек</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="font-medium mb-1">Доступность</h3>
              <p className={`text-sm ${
                housing.availability === "available" 
                  ? "text-green-600" 
                  : housing.availability === "limited" 
                    ? "text-yellow-600" 
                    : "text-red-600"
              }`}>
                Доступно {housing.availableFrom}
              </p>
            </div>
          </div>
          
          {/* Description */}
          <div className="mb-4">
            <h3 className="font-medium mb-2">Описание</h3>
            <p className="text-sm text-secondary">
              {housing.description}
            </p>
          </div>
          
          {/* Amenities */}
          <div className="mb-4">
            <h3 className="font-medium mb-2">Удобства</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {housing.amenities?.map((amenity, index) => {
                let icon = null;
                switch (amenity) {
                  case "wifi": icon = <Wifi className="mr-2 text-secondary h-4 w-4" />; break;
                  case "kitchen": icon = <Utensils className="mr-2 text-secondary h-4 w-4" />; break;
                  case "bathroom": icon = <Bath className="mr-2 text-secondary h-4 w-4" />; break;
                  case "washer": icon = <Shirt className="mr-2 text-secondary h-4 w-4" />; break;
                  case "security": icon = <Lock className="mr-2 text-secondary h-4 w-4" />; break;
                  case "childFriendly": icon = <Baby className="mr-2 text-secondary h-4 w-4" />; break;
                  default: icon = null;
                }
                
                return (
                  <div key={index} className="flex items-center text-sm">
                    {icon}
                    <span>{amenity === "wifi" ? "Бесплатный Wi-Fi" :
                           amenity === "kitchen" ? "Кухня" :
                           amenity === "bathroom" ? "Отдельная ванная" :
                           amenity === "washer" ? "Стиральная машина" :
                           amenity === "security" ? "Охрана 24/7" :
                           amenity === "childFriendly" ? "Подходит для детей" : amenity}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Support info */}
          <div className="mb-4 bg-blue-50 p-3 rounded-lg">
            <h3 className="font-medium mb-2">Поддержка на месте</h3>
            <p className="text-sm text-secondary mb-2">
              В этом жилье вам будет доступна следующая поддержка:
            </p>
            <ul className="text-sm text-secondary list-disc pl-5 space-y-1">
              {housing.support?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button className="px-4 py-2 border border-secondary text-secondary rounded-lg hover:bg-gray-50">
              Сохранить
            </button>
            <button 
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
              onClick={onBookNow}
            >
              Забронировать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
