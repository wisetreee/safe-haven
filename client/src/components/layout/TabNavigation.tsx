import { Link, useLocation } from "wouter";
import { MapPin, List, Calendar, Info } from "lucide-react";

export default function TabNavigation() {
  const [location] = useLocation();
  
  const isActive = (path: string) => location === path;
  
  return (
    <div className="tabs-container bg-white shadow-sm mb-4 hidden md:block">
      <div className="container mx-auto py-4">
        <nav className="flex justify-around">
          <Link href="/" className={`flex-1 px-4 py-3 text-center font-medium focus:outline-none ${isActive("/") ? "text-accent border-b-2 border-accent" : "text-secondary"}`}>
            <MapPin className="inline-block mr-2 h-4 w-4" />
            <span>Карта</span>
          </Link>
          <Link href="/bookings" className={`flex-1 px-4 py-3 text-center font-medium focus:outline-none ${isActive("/bookings") ? "text-accent border-b-2 border-accent" : "text-secondary"}`}>
            <Calendar className="inline-block mr-2 h-4 w-4" />
            <span>Бронирования</span>
          </Link>
          <Link href="/resources" className={`flex-1 px-4 py-3 text-center font-medium focus:outline-none ${isActive("/resources") ? "text-accent border-b-2 border-accent" : "text-secondary"}`}>
            <Info className="inline-block mr-2 h-4 w-4" />
            <span>Ресурсы</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
