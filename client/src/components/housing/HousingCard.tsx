import { Housing } from "@/lib/types";
import { MapPin, Bed, Users, Clock } from "lucide-react";

interface HousingCardProps {
  housing: Housing;
  onClick: (id: number) => void;
}

export default function HousingCard({ housing, onClick }: HousingCardProps) {
  return (
    <div 
      className="housing-card bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
      onClick={() => onClick(housing.id)}
    >
      <img 
        src={housing.imageUrl} 
        alt={housing.name} 
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium">{housing.name}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${
            housing.availability === "available" 
              ? "bg-green-100 text-green-800" 
              : housing.availability === "limited" 
                ? "bg-yellow-100 text-yellow-800" 
                : "bg-red-100 text-red-800"
          }`}>
            {housing.availability === "available" 
              ? "Доступно" 
              : housing.availability === "limited" 
                ? "Почти заполнен" 
                : "Нет мест"}
          </span>
        </div>
        <p className="text-secondary text-sm mb-2">
          <MapPin className="inline-block mr-1 h-3 w-3" /> 
          {housing.location}, {housing.distance} км
        </p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm">
            <Bed className="inline-block mr-1 h-3 w-3" /> 
            {housing.rooms} {getRoomsText(housing.rooms)}
          </span>
          <span className="text-sm">
            <Users className="inline-block mr-1 h-3 w-3" /> 
            До {housing.capacity} {getPeopleText(housing.capacity)}
          </span>
        </div>
        <div className="mt-3 flex justify-between items-center">
          <div className="text-sm text-secondary">
            <Clock className="inline-block mr-1 h-3 w-3" /> 
            Доступно: {housing.availableFrom}
          </div>
          <button className="text-accent hover:underline text-sm font-medium">
            Подробнее
          </button>
        </div>
      </div>
    </div>
  );
}

function getRoomsText(rooms: number): string {
  if (rooms === 1) return "комната";
  if (rooms > 1 && rooms < 5) return "комнаты";
  return "комнат";
}

function getPeopleText(people: number): string {
  if (people === 1) return "человек";
  if (people > 1 && people < 5) return "человека";
  return "человек";
}
